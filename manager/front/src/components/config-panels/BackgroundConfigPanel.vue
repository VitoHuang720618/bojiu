<template>
    <div class="config-panel">
        <div class="panel-header">
            <h3>背景圖設置</h3>
            <p class="subtitle">設定全站的背景圖片或底紋</p>
        </div>

        <div class="form-group">
            <div class="image-upload-card">
                <div class="image-preview-wrapper" :class="{ 'has-image': backgroundImage }">
                    <img v-if="backgroundImage" :src="getImageUrl(backgroundImage)" alt="Background"
                        class="preview-img" />
                    <div v-else class="placeholder">
                        <p>尚未設置背景圖</p>
                    </div>
                    <input type="file" @change="(e) => $emit('upload', e)" accept="image/*" class="file-input" />
                </div>

                <div class="upload-actions">
                    <div class="info">
                        <label>點擊區域上傳新圖片</label>
                        <span v-if="backgroundImage" class="filename">{{ getFileName(backgroundImage) }}</span>
                    </div>
                    <button v-if="backgroundImage" @click="$emit('clear')" class="btn btn-danger btn-sm">清除圖片</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    backgroundImage: string | undefined
    getImageUrl: (path: string) => string
}>()

defineEmits<{
    (e: 'upload', event: Event): void
    (e: 'clear'): void
}>()

const getFileName = (path: string) => {
    return path.split('/').pop() || path
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

.image-upload-card {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid #e9ecef;
    max-width: 600px;
    /* Constrain width */
}

.image-preview-wrapper {
    position: relative;
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
    aspect-ratio: 16 / 9;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

.image-preview-wrapper:hover {
    border-color: #007bff;
    background: #f0f7ff;
}

.image-preview-wrapper.has-image {
    border-style: solid;
}

.preview-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.placeholder {
    text-align: center;
    color: #adb5bd;
}

.placeholder .icon {
    font-size: 2.5rem;
    display: block;
    margin-bottom: 0.5rem;
}

.file-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 1;
}

.upload-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
}

.upload-actions .info {
    display: flex;
    flex-direction: column;
}

.upload-actions label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #495057;
}

.filename {
    font-size: 0.75rem;
    color: #6c757d;
    font-family: monospace;
}

.btn-sm {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    position: relative;
    z-index: 2;
}
</style>
