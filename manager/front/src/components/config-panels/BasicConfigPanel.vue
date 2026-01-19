<template>
    <div class="config-panel">
        <div class="panel-header">
            <h3>基本設置</h3>
            <p class="subtitle">管理網站的全局基本配置項目</p>
        </div>

        <!-- Logo 設置 -->
        <div class="form-section">
            <div class="section-title">
                <h4>網站 Logo</h4>
                <p>顯示在頁面頂部的品牌標誌</p>
            </div>

            <div class="image-upload-card">
                <div class="image-preview-wrapper" :class="{ 'has-image': logo }">
                    <img v-if="logo" :src="getImageUrl(logo)" alt="Logo" class="preview-img" />
                    <div v-else class="placeholder">
                        <span class="icon">🏷️</span>
                        <p>尚未設置 Logo</p>
                    </div>
                    <input type="file" @change="(e) => $emit('upload', e, 'logo')" accept="image/*"
                        class="file-input" />
                </div>

                <div class="upload-actions">
                    <div class="info">
                        <label>點擊區域上傳新 Logo</label>
                        <span v-if="logo" class="filename">{{ getFileName(logo) }}</span>
                    </div>
                    <button v-if="logo" @click="$emit('clear', 'logo')" class="btn btn-danger btn-sm">清除</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    logo: string | undefined
    getImageUrl: (path: string) => string
}>()

defineEmits<{
    (e: 'upload', event: Event, field: string): void
    (e: 'clear', field: string): void
}>()

const getFileName = (path: string) => {
    return path.split('/').pop() || path
}
</script>

<style scoped>
.panel-header {
    margin-bottom: 2.5rem;
}

.subtitle {
    font-size: 0.9rem;
    color: #666;
    margin: 0.25rem 0 0 0;
}

.form-section {
    background: #fff;
    border: 1px solid #eef0f2;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.section-title {
    margin-bottom: 1.5rem;
}

.section-title h4 {
    margin: 0;
    color: #333;
    font-size: 1.1rem;
}

.section-title p {
    margin: 0.2rem 0 0 0;
    font-size: 0.85rem;
    color: #888;
}

.image-upload-card {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid #e9ecef;
}

.image-preview-wrapper {
    position: relative;
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
    height: 120px;
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
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
}

.placeholder {
    text-align: center;
    color: #adb5bd;
}

.placeholder .icon {
    font-size: 1.5rem;
    display: block;
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
