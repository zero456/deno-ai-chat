<script setup lang="ts">
import MarkdownIt from "markdown-it"
import hljs from "highlight.js"
import 'highlight.js/styles/github-dark-dimmed.min.css'
import 'katex/dist/katex.min.css'
// @ts-ignore
import texmath from 'markdown-it-texmath'
// @ts-ignore
import katex from 'katex'

defineProps<{
  history: HistoryItem[]
  loading: boolean
}>()

const md: MarkdownIt = new MarkdownIt({
  linkify: true,
  html: true,
  highlight: (code, language) => {
    if (language && hljs.getLanguage(language)) {
      return `<pre class="hljs"><code>${hljs.highlight(code, {language}).value}</code></pre>`;
    }
    return `<pre class="hljs"><code>${hljs.highlightAuto(code).value}</code></pre>`;
  },
})

// Add texmath plugin for math rendering with KaTeX
md.use(texmath, {
  engine: katex,
  delimiters: 'dollars',
  katexOptions: { 
    throwOnError: false,
    errorColor: '#cc0000'
  }
})

const copiedId = ref<string | null>(null)

const copyToClipboard = async (content: string, id: string) => {
  try {
    await navigator.clipboard.writeText(content)
    copiedId.value = id
    setTimeout(() => {
      copiedId.value = null
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<template>
  <ul class="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pt-24 pb-24 px-4 flex flex-col space-y-6 container-chat mx-auto w-full">
    <template v-for="(i,index) in history" :key="i.id">
      <template v-if="!i.content">
        <USkeleton class="loading-item"/>
      </template>
      <template v-else>
        <template v-if="i.role==='user'">
          <li v-if="i.type === 'text' || i.type === 'image-prompt'"
              class="user chat-item slide-up bubble-user rounded-2xl max-w-full">
            <div class="px-4 pt-3 pb-4">
              <div class="flex items-center gap-2 mb-1 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <UIcon name="i-heroicons-user-circle" class="w-3 h-3"/> {{ $t('you') || 'You' }}
              </div>
              <div class="break-words text-base leading-relaxed">
                {{ i.content }}
              </div>
            </div>
          </li>
          <li v-else-if="i.type === 'image'" class="user image-item slide-up">
            <div class="max-w-[70%] md:max-w-[50%]">
              <div class="flex flex-wrap gap-3">
                <template v-for="img_url in i.src_url" :key="img_url">
                  <img @click="handleImgZoom($event.target as HTMLImageElement)"
                       :src="img_url"
                       :alt="img_url"
                       class="image transition-all duration-200 hover:scale-105"
                       :class="i.src_url?.length === 1 ? 'max-h-60 md:max-h-80' : 'max-h-32 md:max-h-40'"/>
                </template>
              </div>
            </div>
          </li>
        </template>
        <template v-else>
          <li v-if="i.type === 'text'"
              class="assistant chat-item slide-up bubble-assistant rounded-2xl max-w-full p-0"
              :class="[index+1===history.length && loading ? 'loading loading-stream' : '']">
            <div class="px-4 pt-3">
              <div class="flex items-center gap-2 mb-1 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <UIcon name="i-heroicons-sparkles" class="w-3 h-3"/> {{ $t('assistant') || 'Assistant' }}
              </div>
            </div>
            <div class="p-4 pt-0 prose prose-neutral dark:prose-invert prose-pre:break-words prose-pre:whitespace-pre-wrap" v-html="md.render(i.content)"></div>
            <div class="px-4 pb-3 flex justify-end">
              <button 
                @click="copyToClipboard(i.content, i.id)"
                class="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 rounded-lg transition-all duration-200 btn-scale"
              >
                <UIcon 
                  :name="copiedId === i.id ? 'i-heroicons-check-20-solid' : 'i-heroicons-clipboard-document-20-solid'" 
                  class="w-3.5 h-3.5"
                />
                <span>{{ copiedId === i.id ? '已复制' : '复制' }}</span>
              </button>
            </div>
          </li>
          <li v-else-if="i.type === 'image'" class="assistant image-item slide-up">
            <div class="max-w-[60%] md:max-w-[50%]">
              <div class="flex flex-wrap gap-2">
                <template v-for="img_url in i.src_url" :key="img_url">
                  <img @click="handleImgZoom($event.target as HTMLImageElement)"
                       :src="img_url"
                       :alt="img_url"
                       class="image transition-all duration-200 hover:scale-105"/>
                </template>
              </div>
            </div>
          </li>
          <li v-else-if="i.type==='error'" class="assistant chat-item assistant-error slide-up">
            <UIcon name="i-heroicons-exclamation-triangle-20-solid" class="text-red-500 mr-2"/>
            <span class="text-red-700 dark:text-red-300 text-sm">{{ i.content }}</span>
          </li>
        </template>
      </template>
    </template>
  </ul>
</template>

<style scoped lang="postcss">
.loading-item {
  @apply bg-neutral-200 dark:bg-neutral-600 rounded-2xl h-12 w-64 animate-pulse
}

.user {
  @apply self-start
}

.assistant {
  @apply self-start
}

.chat-item {
  @apply shadow-sm
}

.user-text {
  @apply bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200
}

.assistant-text {
  @apply bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm hover:shadow-md transition-all duration-200
}

.image-item {
  @apply bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-all duration-200
}

.assistant-error {
  @apply bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 shadow-sm
}

.image {
  @apply cursor-pointer transition-all duration-200 hover:scale-105 rounded-xl shadow-sm hover:shadow-md border border-neutral-200 dark:border-neutral-700
}

.slide-up {
  animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both
}

@keyframes slide-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
