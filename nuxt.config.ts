// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
    devtools: { enabled: false },
    modules: ['@nuxt/ui', '@nuxtjs/i18n'],
    css: ['~/assets/css/style.css'],

    devServer: {
        port: 3001,
    },

    routeRules: {
        '/': {
            prerender: true,
        }
    },

    app: {
        head: {
            title: 'fyx-chat',
            meta: [
                {
                    name: 'keywords',
                    content: 'AI, Cloudflare Workers, ChatGPT, GeminiPro, Google Generative AI'
                },
                {
                    name: 'description',
                    content: 'Integrated web platform supporting GeminiPro/Cloudflare Workers AI/ChatGPT'
                }
            ],
            link: [
                {
                    rel: 'manifest',
                    href: '/manifest.json'
                },
                {
                    rel: 'preconnect',
                    href: 'https://fonts.googleapis.com'
                },
                {
                    rel: 'preconnect',
                    href: 'https://fonts.gstatic.com',
                    crossorigin: ''
                },
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
                }
            ]
        }
    },

    i18n: {
        vueI18n: './i18n.config.ts',
        strategy: 'no_prefix',
        defaultLocale: 'zh',
    },
    sourcemap: {
      server: false // 强烈建议关闭服务端的 source map
      // client: false  // 如果依然内存不足，也可以关闭客户端的
    },
    nitro: {
      sourceMap: false // 确保 Nitro 也不生成
    },

    compatibilityDate: '2025-11-24'
})