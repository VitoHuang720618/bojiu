<template>
    <div class="image-uploader" :class="{ 'is-loading': loading, 'is-disabled': disabled }">
        <div v-if="previewUrl" class="preview-container">
            <img :src="previewUrl" :alt="altText" class="preview-img" />
            <div v-if="!disabled" class="overlay">
                <div class="actions">
                    <button @click.stop="triggerInput" class="btn btn-edit" title="更換圖片">
                        <span class="icon">✎</span>
                    </button>
                    <button @click.stop="$emit('clear')" class="btn btn-delete" title="移除">
                        <span class="icon">✕</span>
                    </button>
                </div>
            </div>
        </div>

        <div v-else class="placeholder" @click="triggerInput">
            <div class="placeholder-content">
                <span class="icon">+</span>
                <span class="text">{{ placeholder }}</span>
                <span v-if="dimensions" class="dimensions">{{ dimensions }}</span>
            </div>
        </div>

        <input type="file" ref="fileInput" class="file-input" accept="image/*" :disabled="disabled" @change="handleFileChange" />

        <div v-if="loading" class="loading-overlay">
            <div class="spinner"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    previewUrl?: string
    altText?: string
    placeholder?: string
    dimensions?: string // e.g. "1920x500"
    loading?: boolean
    disabled?: boolean
}>()

const emit = defineEmits<{
    (e: 'upload', file: File): void
    (e: 'clear'): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const triggerInput = () => {
    if (props.disabled) return
    fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
    if (props.disabled) return
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        emit('upload', file)
        // Clear value to allow re-selecting the same file
        target.value = ''
    }
}
</script>

<style scoped>
.image-uploader {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: inherit; /* 讓外部容器決定高度 */
    border: 2px dashed #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
    background: #f8f9fa;
}

.image-uploader:hover {
    border-color: #3498db;
    background: #f1f8ff;
}

.image-uploader.is-disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.image-uploader.is-disabled:hover {
    border-color: #e0e0e0;
    background: #f8f9fa;
}

.image-uploader.is-disabled .placeholder {
    cursor: not-allowed;
}

.preview-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.preview-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    background: white;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5); /* 稍微加深背景，但降低模糊度 */
    backdrop-filter: blur(2px); /* 降低模糊度，由 4px 改為 2px，確保能看清圖案 */
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: scale(0.9); /* 改為縮放，避免在窄容器中位移過大 */
}

.preview-container:hover .overlay {
    opacity: 1;
    transform: scale(1);
}

.actions {
    display: flex;
    gap: 12px;
    padding: 4px; /* 確保按鈕周圍有安全間距 */
}

.btn {
    width: 32px; /* 依照主人吩咐：按鈕稍微縮小 */
    height: 32px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn:hover {
    transform: scale(1.15);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.btn-edit {
    background: white;
    color: #333;
}

.btn-delete {
    background: #ff4757;
    color: white;
}

.placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #adb5bd;
}

.placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 4px;
    text-align: center;
    max-height: 100%;
    overflow: hidden;
}

.placeholder .icon {
    font-size: 1.5rem; /* 標題圖示也稍微縮小 */
    font-weight: 300;
}

.placeholder .text {
    font-size: 0.9rem;
    font-weight: 500;
}

.placeholder .dimensions {
    font-size: 0.7rem; /* 再次縮小 */
    opacity: 0.7;
    background: rgba(0, 0, 0, 0.05);
    padding: 1px 4px;
    border-radius: 3px;
    white-space: nowrap;
}

.file-input {
    display: none;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.spinner {
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
