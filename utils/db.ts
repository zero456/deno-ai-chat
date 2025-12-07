import Dexie, { type Table } from 'dexie';
import type { HistoryItem, Model, TabItem } from './types';

export class Database extends Dexie {
    history!: Table<HistoryItem>
    tab!: Table<TabItem>

    constructor() {
        super('ai')
        this.version(4).stores({
            history: '++id, session, type, role, content, src',
            tab: '++id, label'
        })
        this.version(5).stores({
            tab: '++id, label, created_at',
            history: '++id, session, type, role, content, src, created_at',
        }).upgrade(trans => {
            return trans.table('history').toCollection().modify(async i => {
                if (i.type === 'image') {
                    i.content = ''
                    i.src = [i.src]
                }
            })
        })
    }

    getLatestTab() {
        return DB.tab.orderBy('id').last();
    }

    getTabs() {
        return DB.tab.limit(100).reverse().toArray()
    }

    async getHistory(session: number) {
        const arr = await DB.history.where('session').equals(session).limit(100).toArray()
        arr.forEach(i => {
            if (i.type === 'image') {
                i.src_url = []
                i.src?.forEach(src => {
                    i.src_url!.push(URL.createObjectURL(src))
                })
                i.content = 'image'
            }
        })
        return arr
    }

    addTab(label: string) {
        return DB.tab.add({ label, created_at: Date.now() })
    }

    deleteTabAndHistory(id: number) {
        return DB.transaction('rw', DB.tab, DB.history, async () => {
            await DB.tab.delete(id)
            await DB.history.where('session').equals(id).delete()
        })
    }
}

export const DB = new Database();

export const initialSettings = {
    openaiKey: '',
    image_steps: 20,
    system_prompt: '你是一位博学的专家，用中文给出简洁而准确的回答。',
}

export type Settings = typeof initialSettings

export const uniModals: Model[] = [
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        provider: 'google',
        type: 'universal'
    },
    {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 pro',
        provider: 'google',
        type: 'universal'
    },
    {
        id: 'gemini-flash-lite-latest',
        name: 'gemini flash lite latest',
        provider: 'google',
        type: 'universal'
    },
    {
        id: 'gemini-flash-latest',
        name: 'gemini flash latest',
        provider: 'google',
        type: 'universal'
    },

    // 新增多个OpenAI兼容provider支持
    {
        id: 'x-ai/grok-4.1-fast:free',
        name: 'grok-4.1-fast',
        provider: 'openai',
        type: 'universal',
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKeyEnv: 'OPENROUTER_API_KEY',
        endpoint: 'chat/completions'
    },    
    {
        id: 'zai-org/GLM-4.6',
        name: 'GLM-4.6',
        provider: 'openai',
        type: 'universal',
        baseUrl: 'https://api.siliconflow.cn/v1',
        apiKeyEnv: 'SILICONFLOW_API_KEY',
        endpoint: 'chat/completions'
    },    
    {
        id: 'GLM-4.5-Flash',
        name: 'GLM 4.5 Flash',
        provider: 'openai',
        type: 'universal',
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        apiKeyEnv: 'ZHIPU_API_KEY',
        endpoint: 'chat/completions'
    },
    {
        id: 'mistral-large-2512',
        name: 'Mistral Large',
        provider: 'openai',
        type: 'universal',
        baseUrl: 'https://api.mistral.ai/v1',
        apiKeyEnv: 'MISTRAL_API_KEY',
        endpoint: 'chat/completions'
    },
    {
        id: 'mistral-medium-2508',
        name: 'mistral-medium',
        provider: 'openai',
        type: 'universal',
        baseUrl: 'https://api.mistral.ai/v1',
        apiKeyEnv: 'MISTRAL_API_KEY',
        endpoint: 'chat/completions'
    }    
]

export const textGenModels: Model[] = [{
    id: '@cf/openai/gpt-oss-120b',
    name: 'gpt-oss-120b',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
    name: 'deepseek-r1-qwen-32b',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@cf/qwen/qwen3-30b-a3b-fp8',
    name: 'qwen3-30b-a3b',
    provider: 'workers-ai',
    type: 'chat'
}]

export const imageGenModels: Model[] = [{
    id: '@cf/leonardo/phoenix-1.0',
    name: 'phoenix-1.0',
    provider: 'workers-ai-image',
    type: 'text-to-image'
}, {
    id: '@cf/lykon/dreamshaper-8-lcm',
    name: 'dreamshaper-8-lcm',
    provider: 'workers-ai-image',
    type: 'text-to-image'
}, {
    id: '@cf/black-forest-labs/flux-1-schnell',
    name: 'flux-1-schnell',
    provider: 'workers-ai-image',
    type: 'text-to-image'
}, {
    id: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
    name: 'stable-diffusion-xl-base-1.0',
    provider: 'workers-ai-image',
    type: 'text-to-image'
}, {
    id: '@cf/bytedance/stable-diffusion-xl-lightning',
    name: 'stable-diffusion-xl-lightning',
    provider: 'workers-ai-image',
    type: 'text-to-image'
}]

export const models: Model[] = [...uniModals, ...textGenModels, ...imageGenModels]
