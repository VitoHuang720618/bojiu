<template>
    <div class="image-uploader" :class="{ 'is-loading': loading }">
        <div v-if="previewUrl" class="preview-container">
            <img :src="previewUrl" :alt="altText" class="preview-img" />
            <div class="overlay">
                <div class="actions">
                    <button @click="triggerInput" class="btn btn-edit" title="更換圖片">
                        <span class="icon">✎</span>
                    </button>
                    <button @click="$emit('clear')" class="btn btn-delete" title="清除圖片">
                        <span class="icon">×</span>
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

        <input type="file" ref="fileInput" class="file-input" accept="image/*" @change="handleFileChange" />

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
}>()

const emit = defineEmits<{
    (e: 'upload', file: File): void
    (e: 'clear'): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const triggerInput = () => {
    fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
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
    min-height: 160px;
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
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
}

.preview-container:hover .overlay {
    opacity: 1;
}

.actions {
    display: flex;
    gap: 12px;
}

.btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: transform 0.1s;
}

.btn:hover {
    transform: scale(1.1);
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
    gap: 8px;
}

.placeholder .icon {
    font-size: 2rem;
    font-weight: 300;
}

.placeholder .text {
    font-size: 0.9rem;
    font-weight: 500;
}

.placeholder .dimensions {
    font-size: 0.8rem;
    opacity: 0.8;
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 6px;
    border-radius: 4px;
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
