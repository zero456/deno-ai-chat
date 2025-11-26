import { handleErr, openaiParser, streamResponse } from "~/utils/helper";
import { OpenAIBody, OpenAIReq } from "~/utils/types";
import { uniModals } from "~/utils/db";

export default defineEventHandler(async (event) => {
    const contentType = getHeader(event, 'content-type') || '';

    let model: string, messages: OpenAIMessage[], key: string | undefined, endpoint: string;
    let files: File[] = [];
    let baseUrl: string | undefined, apiKeyEnv: string | undefined;

    if (contentType.includes('multipart/form-data')) {
        // Handle FormData (with files)
        const formData = await readFormData(event);
        model = formData.get('model') as string;
        messages = JSON.parse(formData.get('messages') as string);
        const keyValue = formData.get('key');
        key = keyValue && keyValue !== 'undefined' ? keyValue as string : undefined;
        endpoint = formData.get('endpoint') as string;
        baseUrl = formData.get('baseUrl') as string;
        apiKeyEnv = formData.get('apiKeyEnv') as string;
        files = formData.getAll('files') as File[];
    } else {
        // Handle JSON (backward compatibility)
        const body: OpenAIReq = await readBody(event);
        ({ model, messages, key, endpoint } = body);
    }

    // 如果没有提供baseUrl，从模型配置中获取
    if (!baseUrl) {
        const modelConfig = uniModals.find(m => m.id === model);
        if (modelConfig) {
            baseUrl = modelConfig.baseUrl;
            apiKeyEnv = modelConfig.apiKeyEnv;
        }
    }

    // Process docx files if present
    if (files.length > 0) {
        const docxFiles = files.filter(f => f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        if (docxFiles.length > 0) {
            const docxTexts = await Promise.all(docxFiles.map(f => docxToText(f)));
            const docxContent = docxTexts.join('\n\n---\n\n');
            // Add docx content to the last user message
            if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
                messages[messages.length - 1].content += '\n\n[Document Content]:\n' + docxContent;
            }
        }
    }

    const openAIBody: OpenAIBody = {
        stream: true,
        model,
        messages,
    };

    // 优先使用模型级别的baseUrl，然后是环境变量，最后fallback到CF Gateway
    let apiUrl: string;
    if (baseUrl) {
        apiUrl = `${baseUrl}/${endpoint || 'chat/completions'}`;
    } else if (process.env.OPENAI_API_URL) {
        apiUrl = `${process.env.OPENAI_API_URL}/chat/completions`; // 尝试删去v1以便兼容GLM
    } else {
        apiUrl = `${process.env.CF_GATEWAY}/openai/${endpoint}`;
    }

    // 优先使用指定的API key，然后是从环境变量读取的key，最后是全局OPENAI_API_KEY
    let authKey: string;
    if (key) {
        authKey = key;
    } else if (apiKeyEnv && process.env[apiKeyEnv]) {
        authKey = process.env[apiKeyEnv];
    } else {
        authKey = process.env.OPENAI_API_KEY || '';
    }

    const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${authKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(openAIBody),
    });

    if (!res.ok) {
        return handleErr(res);
    }

    return streamResponse(res, openaiParser);
});

// Minimal .docx text extractor
async function docxToText(file: File): Promise<string> {
    const buf = new Uint8Array(await file.arrayBuffer());
    const { unzip } = await import('fflate');
    return await new Promise<string>((resolve, reject) => {
        unzip(buf, (err, data) => {
            if (err) return reject(err);
            const doc = data['word/document.xml'];
            if (!doc) return resolve('');
            const xml = new TextDecoder('utf-8').decode(doc);
            const withLines = xml
                .replace(/<w:p[^>]*>/g, '\n')
                .replace(/<w:br\b[^>]*\/>/g, '\n')
                .replace(/<[^>]+>/g, ' ');
            const text = withLines
                .replace(/\s+\n/g, '\n')
                .replace(/\n{3,}/g, '\n\n')
                .replace(/[ \t\f\v]+/g, ' ')
                .replace(/\n\s+\n/g, '\n\n')
                .trim();
            resolve(text);
        });
    });
}
