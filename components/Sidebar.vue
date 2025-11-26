<script setup lang="ts">
import {useGlobalState} from "~/utils/store";

const {openAside, openSettings} = useGlobalState()

defineProps<{
  tabs: TabItem[]
  selected: number

  handleNewChat: () => void
  handleDelete: (tid: number) => void
  handleSwitchChat: (e: MouseEvent) => void
}>()
</script>

<template>
  <div :class="{mask:openAside}" @click="openAside=!openAside"></div>
  <aside class="w-64 flex flex-col transition-all duration-300 ease-in-out mobile-bar mr-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-r border-neutral-200/50 dark:border-neutral-800/50" :class="{hide:!openAside}">
    <ol id="tabEl" class="flex flex-col space-y-2 overflow-y-auto h-full scrollbar-hide pt-20 px-2"
        @click="handleSwitchChat">
      <li v-for="i in tabs" :key="i.id"
          class="rounded-xl p-3 mx-1 cursor-pointer group transition-all duration-200 btn-scale"
          :class="{
            'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400': i.id !== selected,
            'bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 shadow-md ring-1 ring-slate-300/30 dark:ring-slate-600/30': i.id === selected
          }"
          :data-id="i.id">
        <div class="line-clamp-1 font-medium text-sm w-full text-neutral-700 dark:text-neutral-300" :data-id="i.id">
          {{ i.label }}
        </div>
        <UIcon
          name="i-heroicons-trash-20-solid"
          v-if="i.id === selected"
          @click.stop="handleDelete(i.id)"
          class="shrink-0 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150"
        />
      </li>
    </ol>

    <div class="flex items-center space-x-2 p-3 border-t border-neutral-200 dark:border-neutral-700">
      <IButton
        name="i-heroicons-cog-8-tooth-20-solid"
        variant="ghost"
        size="sm"
        class="rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 btn-scale"
        @click="openSettings=!openSettings"
      />
      <UButton
        class="ml-auto px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-medium shadow-lg shadow-slate-500/20 transition-all duration-300 btn-scale dark:bg-slate-300 dark:hover:bg-slate-200 dark:text-slate-900"
        @click="handleNewChat"
      >
        <UIcon name="i-heroicons-plus-20-solid" class="mr-1.5"/>
        {{ $t('new_chat') }}
      </UButton>
    </div>
  </aside>
</template>

<style scoped lang="postcss">
.hide {
  @apply -translate-x-full opacity-0 w-0 m-0 invisible transition-all
}

.card-focus {
  @apply ring-2 ring-primary-500 dark:ring-primary-400
}

@media not all and (min-width: 768px) {
  .mobile-bar {
    @apply fixed left-0 z-20 h-full bg-white shadow-xl pb-6 px-2 dark:bg-neutral-900 rounded-r
  }

  .mask {
    @apply fixed inset-0 z-10 bg-black opacity-25
  }
}
</style>
