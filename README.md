# deno deploy AI chat

## 特性

- 利用 Deno Deploy 快速搭建多模态AI平台
- 本地优先 - 聊天记录完全本地存储，隐私安全
- 数学公式 - LaTeX 公式渲染
- 代码高亮 - 支持多种编程语言
- 图片生成 - Stable Diffusion 集成
- 支持图片和docx文件上传
- 支持开启访问密码，聊天记录本地存储
- 轻量化 - ~646 KB gzip
- 无服务器 - Serverless 部署，零运维
- 支持多个 AI 服务提供商，并可自行添加：
    - OpenAI (ChatGPT)
    - Google AI (Gemini Pro)
    - Mistral AI
    - Zhipu AI (智谱)
    - OpenRouter
    - Groq
    - SiliconFlow
    Stable Diffusion (图像生成)
- 响应式设计: 移动端 + 桌面端
- 明暗模式切换

## Deno Deploy

https://dash.deno.com

- Fork 本仓库
- Build Step改为`NITRO_PRESET=deno-deploy npm run build_node`
- Deploy Project
- 按下表设置环境变量
- `./utils/db.ts`中设置了BASE_URL的，环境变量中可以不用填写。

### 环境变量列表

| 名称             | 描述                                 | 
|----------------|------------------------------------|
| CF_TOKEN       | Cloudflare Workers AI Token        |  
| CF_GATEWAY     | Cloudflare AI Gateway URL          |    
| OPENAI_API_KEY | OpenAI API Key (需要ChatGPT时填写)      |     
| OPENAI_API_URL | 自定义OpenAI API请求地址 |
| G_API_KEY      | Google AI API Key (需要GeminiPro时填写) | 
| G_API_URL      | Google AI 反代地址     |
| MISTRAL_API_KEY | Mistral API Key (需要Mistral时填写) |
| MISTRAL_BASE_URL | Mistral API Base URL | 
| ZHIPU_API_KEY | Zhipu API Key (需要Zhipu时填写) |
| ZHIPU_BASE_URL | Zhipu API Base URL |
| OPENROUTER_API_KEY | OpenRouter API Key (需要OpenRouter时填写) |
| OPENROUTER_BASE_URL | OpenRouter API Base URL |
| GROQ_API_KEY | Groq API Key (需要Groq时填写) |
| GROQ_BASE_URL | Groq API Base URL |
| SILICONFLOW_API_KEY | SiliconFlow API Key (需要SiliconFlow时填写) |
| SILICONFLOW_BASE_URL | SiliconFlow API Base URL |
| PASSWORD       | 访问密码 (可选)                          |

### 模型支持

https://developers.cloudflare.com/workers-ai/models/

- 你可以在`./utils/db.ts`中增删模型
- 本地调试时`.env`文件设置，查看`.env.example`文件

#### CF_TOKEN

https://dash.cloudflare.com/profile/api-tokens

- 单击创建令牌
- 使用Workers AI (Beta)模板
- 单击继续以显示摘要
- 单击创建令牌
- 复制您的令牌，设置环境变量

#### CF_GATEWAY

https://dash.cloudflare.com/

- Cloudflare 侧栏 AI - AI Gateway
- 添加新 AI Gateway
- 填写名称和URL slug创建
- 单击右上角API Endpoints
- 复制您的Universal Endpoint(去掉末尾`/`)，设置环境变量

#### G_API_KEY

https://ai.google.dev/tutorials/rest_quickstart#set_up_your_api_key

## 技术栈

- 前端框架
    - Nuxt 3 - Vue 3 全栈框架
    - Vue 3 - 核心 UI 框架
    - TypeScript - 类型安全
- 后端：Deno Deploy
- 本地存储：Dexie.js - IndexedDB 封装库

