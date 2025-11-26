import {GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, SafetySetting} from '@google/generative-ai'
import {headers} from '~/utils/helper';
import {OpenAIMessage} from "~/utils/types";

const genAI = new GoogleGenerativeAI(process.env.G_API_KEY!)

export default defineEventHandler(async (event) => {
    const body = await readFormData(event)
    const model = body.get('model') as string
    const messages: OpenAIMessage[] = JSON.parse(<string>body.get('messages'))
    const files = body.getAll('files') as File[]

    const m = genAI.getGenerativeModel({model, safetySettings})
    let msg = messages.slice(1)

    let res
    if (files.length) {
        const parts = await Promise.all(files.map(async (f) => {
            if (f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const text = await docxToText(f)
                return {text}
            }
            return fileToGenerativePart(f)
        }))
        const prompt = msg.at(-1)
        if (prompt === undefined) {
            return new Response('对话失效，请重新开始对话', {status: 400})
        }
        res = await m.generateContentStream([prompt.content, ...parts])
    } else {
        const chat = m.startChat({
            history: msg.slice(0, -1).map(m => ({
                role: m.role === 'assistant' ? 'model' : m.role === 'user' ? 'user' : 'function',
                parts: [{text: m.content}]
            }))
        })
        res = await chat.sendMessageStream(msg[msg.length - 1].content)
    }

    const textEncoder = new TextEncoder()
    const readableStream = new ReadableStream({
        async start(controller) {
            for await (const chunk of res.stream) {
                try {
                    controller.enqueue(textEncoder.encode(chunk.text()))
                } catch (e) {
                    console.error(e)
                    controller.enqueue(textEncoder.encode('已触发安全限制，请重新开始对话'))
                }
            }

            controller.close()
        }
    })

    return new Response(readableStream, {
        headers,
    })
})

async function fileToGenerativePart(file: File) {
    return {
        inlineData: {
            data: Buffer.from(await file.arrayBuffer()).toString('base64'),
            mimeType: file.type,
        },
    };
}

// Minimal .docx text extractor: read document.xml from the zip and strip tags
async function docxToText(file: File): Promise<string> {
    const buf = new Uint8Array(await file.arrayBuffer())
    const { unzip } = await import('fflate')
    return await new Promise<string>((resolve, reject) => {
        unzip(buf, (err, data) => {
            if (err) return reject(err)
            const doc = data['word/document.xml']
            if (!doc) return resolve('')
            const xml = new TextDecoder('utf-8').decode(doc)
            const withLines = xml
                .replace(/<w:p[^>]*>/g, '\n')
                .replace(/<w:br\b[^>]*\/>/g, '\n')
                .replace(/<[^>]+>/g, ' ')
            const text = withLines
                .replace(/\s+\n/g, '\n')
                .replace(/\n{3,}/g, '\n\n')
                .replace(/[ \t\f\v]+/g, ' ')
                .replace(/\n\s+\n/g, '\n\n')
                .trim()
            resolve(text)
        })
    })
}

const safetySettings: SafetySetting[] = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
]
