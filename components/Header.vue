<script setup lang="ts">
import {useDark, useToggle} from "@vueuse/core";
import {useGlobalState} from "~/utils/store";

const isDark = useDark()
const toggleDark = useToggle(isDark)
const {openAside, openModelSelect, selectedModel} = useGlobalState()
onMounted(() => {
  const open = localStorage.getItem('openAside')
  openAside.value = open === 'true' || open === null
})
watch(openAside, (v) => {
  localStorage.setItem('openAside', v.toString())
})

function handleReload() {
  location.reload()
}
</script>

<template>
  <header class="header-glass shadow-sm border-b border-neutral-200/50 dark:border-neutral-700/50 h-16 fixed w-full z-30">
    <div class="w-full h-full flex items-center px-2 md:px-4 gap-1 md:gap-2">
      <!-- 左侧区域: 菜单按钮 + Logo + 标题 -->
      <div class="flex items-center gap-1 md:gap-2 flex-1 min-w-0">
        <button
          class="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 flex-shrink-0"
          @click="openAside = !openAside"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        <img src="/pwa.webp" alt="logo" class="w-6 h-6 rounded-sm flex-shrink-0"/>

        <h1
          @click="handleReload"
          class="text-base md:text-xl font-bold ml-1 md:ml-2 hover:cursor-pointer bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-500 dark:from-slate-300 dark:to-slate-400 transition-all duration-200 hidden sm:block truncate"
        >
          Deno Chat
        </h1>
      </div>

      <!-- 中间区域: 模型选择按钮 -->
      <div class="flex justify-center flex-shrink-0">
        <UButton 
          size="sm" 
          class="px-3 md:px-6 py-1.5 md:py-2 text-xs md:text-sm bg-slate-700 hover:bg-slate-800 text-white rounded-lg md:rounded-xl font-medium shadow-lg shadow-slate-500/20 transition-all duration-300 btn-scale dark:bg-slate-300 dark:hover:bg-slate-200 dark:text-slate-900" 
          @click="openModelSelect = true"
        >
          <span class="max-w-[100px] md:max-w-[200px] truncate">{{ selectedModel.name }}</span>
          <template #trailing>
            <UIcon name="i-heroicons-chevron-down-solid" class="w-3 h-3 ml-1 md:ml-2 flex-shrink-0"/>
          </template>
        </UButton>
      </div>

      <!-- 右侧区域: GitHub链接 + 主题切换 -->
      <div class="flex items-center gap-0.5 md:gap-1 flex-1 min-w-0 justify-end">
        <a href="https://github.com/zero456/deno-ai-chat" target="_blank" aria-label="GitHub"
           class="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 hidden md:flex flex-shrink-0">
          <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38l-.01-1.34c-2.01.37-2.53-.49-2.69-.94c-.09-.23-.48-.94-.82-1.13c-.28-.15-.68-.52-.01-.53c.63-.01 1.08.58 1.23.82c.72 1.21 1.87.87 2.33.66c.07-.52.28-.87.51-1.07c-1.78-.2-3.64-.89-3.64-3.95c0-.87.31-1.59.82-2.15c-.08-.2-.36-1.01.08-2.11c0 0 .67-.21 2.2.82c.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82c.44 1.1.16 1.91.08 2.11c.51.56.82 1.27.82 2.15c0 3.07-1.87 3.75-3.65 3.95c.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path>
          </svg>
        </a>
        <button
          class="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 flex-shrink-0"
          @click="toggleDark()"
        >
          <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>
