<script setup lang="ts">
import { ref } from 'vue'
import ImageComponent from './ImageComponent.vue'
import { updateAssetManifest } from '../config/assetManifest'

const props = defineProps<{
  src: string
  alt: string
  configPath: string
  width?: string | number
  height?: string | number
}>()

const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files?.length) return

  const file = target.files[0]
  const formData = new FormData()
  formData.append('image', file)
  formData.append('path', props.configPath)

  isUploading.value = true
  try {
    const response = await fetch('http://localhost:3003/api/upload', {
      method: 'POST',
      body: formData
    })
    if (response.ok) {
      await updateAssetManifest()
    }
  } catch (err) {
    console.error('Upload failed:', err)
  } finally {
    isUploading.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('確定要刪除這張圖片嗎？')) return

  try {
    const response = await fetch('http://localhost:3003/api/image', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: props.configPath })
    })
    if (response.ok) {
      await updateAssetManifest()
    }
  } catch (err) {
    console.error('Delete failed:', err)
  }
}
</script>

<template>
  <div class="image-editor-wrap">
    <ImageComponent :src="src" :alt="alt" />

    <div class="editor-overlay" v-if="!isUploading">
      <button @click="triggerUpload" class="edit-btn">更換圖</button>
      <button @click="handleDelete" class="delete-btn" v-if="src">刪除</button>
    </div>

    <div class="upload-progress" v-if="isUploading">
      <span>上傳中...</span>
    </div>

    <input type="file" ref="fileInput" style="display: none" accept="image/*" @change="handleUpload" />
  </div>
</template>

<style scoped>
.image-editor-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.editor-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.image-editor-wrap:hover .editor-overlay {
  opacity: 1;
}

.edit-btn,
.delete-btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.edit-btn {
  background: #ba081f;
  color: white;
}

.delete-btn {
  background: #444;
  color: white;
}

.upload-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 11;
}
</style>
