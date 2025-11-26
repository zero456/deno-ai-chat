<script setup lang="ts">
import {compressionFile, handleImgZoom} from "~/utils/tools";

const input = ref('')
const addHistory = ref(true)
const fileList = ref<{
  file: File
  url: string
}[]>([])
const {openModelSelect} = useGlobalState()

onMounted(() => {
  addHistory.value = localStorage.getItem('addHistory') === 'true'
})
watch(addHistory, () => {
  localStorage.setItem('addHistory', addHistory.value.toString())
})

const p = defineProps<{
  loading: boolean
  selectedModel: Model

  handleSend: (input: string, addHistory: boolean, files: {
    file: File
    url: string
  }[]) => void
}>()

function handleInput(e: KeyboardEvent) {
  if (e.shiftKey) {
    input.value += '\n'
  }
  if (e.isComposing || e.shiftKey) {
    return
  }

  if (input.value.trim() === '') return
  if (p.loading) return
  p.handleSend(input.value, addHistory.value, toRaw(fileList.value))
  input.value = ''
  fileList.value = []
}

const imageType = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif']
const docTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']

function checkFile(file: File) {
  if (fileList.value.length >= 5) {
    alert('You can only upload up to 5 files')
    return false
  }
  const isImage = imageType.includes(file.type)
  const isDoc = docTypes.includes(file.type)
  if (!isImage && !isDoc) {
    alert([...imageType, ...docTypes].join(', ') + ' only')
    return false
  }
  return true
}

function handleAddFiles() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = [...imageType, ...docTypes].join(',')
  input.multiple = true
  input.onchange = async () => {
    document.body.style.cursor = 'wait'

    const files = Array.from(input.files || [])
    for (const f of files) {
      if (!checkFile(f)) continue;
      let file = f
      if (imageType.includes(f.type)) {
        file = await compressionFile(f, f.type)
      }
      const url = URL.createObjectURL(file)
      fileList.value.push({file, url})
    }

    document.body.style.cursor = 'auto'
  }
  input.click()
}

onUnmounted(() => {
  fileList.value.forEach(i => {
    URL.revokeObjectURL(i.url)
  })
})

const handlePaste = (e: ClipboardEvent) => {
  const files = Array.from(e.clipboardData?.files || [])
  files.forEach(file => {
    if (!checkFile(file)) return

    const url = URL.createObjectURL(file)
    fileList.value.push({file, url})
  })
}
</script>

<template>
  <div class="relative">
    <div class="absolute bottom-12 w-full flex flex-col">
            <ul v-if="selectedModel.type === 'universal'" style="margin: 0"
          class="flex flex-wrap bg-transparent rounded-t-md px-2 pt-2">
        <li v-for="file in fileList" :key="file.url" class="relative group/img">
          <button @click="fileList.splice(fileList.indexOf(file), 1)"
                  class="absolute z-10 hidden group-hover/img:block rounded-full bg-neutral-100 right-0 hover:brightness-75 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 16 16">
              <path fill="currentColor"
                    d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94z"/>
            </svg>
          </button>
          <template v-if="file.file.type.startsWith('image/')">
            <img :src="file.url"
                 class="max-h-16 m-1 shadow-xl cursor-pointer group-hover/img:brightness-75 transition-all rounded-md border border-neutral-200 dark:border-neutral-700"
                 alt="selected image" @click="handleImgZoom($event.target as HTMLImageElement)"/>
          </template>
          <template v-else>
            <div class="m-1 px-2 py-1 rounded-md shadow text-xs bg-neutral-100 dark:bg-neutral-800">
              {{ file.file.name }}
            </div>
          </template>
        </li>
      </ul>
    </div>
    <div class="flex items-center px-2 md:px-3 py-2 gap-1">
      <UButton class="h-[38px] w-[38px] m-1" @click="addHistory = !addHistory" :color="addHistory ? 'green' : 'gray'"
               :title="addHistory ? '启用上下文记忆' : '禁用上下文记忆'">
        <UIcon name="i-heroicons-clock-solid" class="w-6 h-6"/>
      </UButton>
      <div title="添加文件">
        <UButton @click="handleAddFiles" color="white" class="h-[38px] w-[38px] m-1">
          <UIcon name="i-heroicons-paper-clip-16-solid" class="w-6 h-6"/>
        </UButton>
      </div>
      <UTextarea v-model="input" :placeholder="$t('please_input_text') + '...' "
                 @keydown.prevent.enter="handleInput($event)"
                 @paste="handlePaste"
                 autofocus :rows="2" autoresize color="gray"
                 class="flex-1 max-h-40 min-h-[44px] overflow-y-auto px-3 py-3 !bg-transparent !border-0 focus:ring-0 text-base leading-relaxed placeholder:text-neutral-400"/>
      <UButton @click="handleInput($event)" :disabled="loading" class="h-[38px] w-[38px] m-1 bg-slate-700 hover:bg-slate-800 text-white shadow-sm dark:bg-slate-300 dark:hover:bg-slate-200 dark:text-slate-900 flex items-center justify-center btn-scale">
        <UIcon v-if="!p.loading" name="i-heroicons-paper-airplane-solid"/>
        <UIcon v-else name="i-heroicons-stop-circle-20-solid"/>
      </UButton>
    </div>
  </div>
</template>
