<template>
    <div class="config-panel">
        <div class="panel-header">
            <h3>背景圖設置</h3>
            <p class="subtitle">設定全站的背景圖片或底紋</p>
        </div>

        <div class="form-group">
            <div class="uploader-container background-uploader">
                <ImageUploader :preview-url="backgroundImage ? getImageUrl(backgroundImage) : ''"
                    alt-text="Background" placeholder="點擊上傳背景圖" @upload="handleUpload" @clear="$emit('clear')" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ImageUploader from '../common/ImageUploader.vue'

const props = defineProps<{
    backgroundImage: string | undefined
    getImageUrl: (path: string) => string
}>()

const emit = defineEmits<{
    (e: 'upload', event: Event): void
    (e: 'clear'): void
}>()

const handleUpload = (file: File) => {
    emit('upload', { target: { files: [file] } } as unknown as Event)
}
</script>

<style scoped>
.panel-header {
    margin-bottom: 2rem;
}

.subtitle {
    font-size: 0.9rem;
    color: #666;
    margin: 0.25rem 0 0 0;
}

.background-uploader {
    width: 100%;
    max-width: 600px;
    height: 300px;
    border-radius: 12px;
    overflow: hidden;
}

/* 舊有的樣式已由 ImageUploader 內部管理 */
</style>
