<template>
    <div class="config-panel">
        <div class="panel-header">
            <div class="header-info">
                <h3>推薦路線按鈕</h3>
                <p class="subtitle">管理首頁推薦線路區域的入口按鈕</p>
            </div>
            <div class="header-actions">
                <button @click="$emit('reset')" class="btn btn-outline-secondary">重置為預設</button>
            </div>
        </div>

        <div class="form-section">
            <div class="section-title">
                <h4>按鈕圖標</h4>
                <p>配置推薦優質線路標題下方的入口按鈕（默認與懸停狀態）</p>
            </div>

            <div class="dual-upload-row">
                <div class="upload-slot">
                    <label>默認圖片</label>
                    <div class="image-preview-wrapper" :class="{ 'has-image': routeLinks.default }">
                        <img v-if="routeLinks.default" :src="getImageUrl(routeLinks.default)" alt="Default"
                            class="preview-img" />
                        <div v-else class="placeholder">
                            <span class="icon">🖼️</span>
                            <span class="text">默認狀態</span>
                        </div>
                        <input type="file" @change="(e) => $emit('upload', e, 'default')" accept="image/*"
                            class="file-input" />
                    </div>
                    <button v-if="routeLinks.default" @click="$emit('removeImage', 'default')"
                        class="btn btn-link-danger btn-sm">移除圖片</button>
                </div>

                <div class="upload-slot">
                    <label>懸停圖片</label>
                    <div class="image-preview-wrapper" :class="{ 'has-image': routeLinks.hover }">
                        <img v-if="routeLinks.hover" :src="getImageUrl(routeLinks.hover)" alt="Hover"
                            class="preview-img" />
                        <div v-else class="placeholder">
                            <span class="icon">✨</span>
                            <span class="text">懸停狀態</span>
                        </div>
                        <input type="file" @change="(e) => $emit('upload', e, 'hover')" accept="image/*"
                            class="file-input" />
                    </div>
                    <button v-if="routeLinks.hover" @click="$emit('removeImage', 'hover')"
                        class="btn btn-link-danger btn-sm">移除圖片</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface RouteLinks {
    default: string
    hover: string
}

const props = defineProps<{
    routeLinks: RouteLinks
    getImageUrl: (path: string) => string
}>()

defineEmits<{
    (e: 'reset'): void
    (e: 'upload', event: Event, type: 'default' | 'hover'): void
    (e: 'removeImage', type: 'default' | 'hover'): void
}>()
</script>

<style scoped>
.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.section-title {
    margin-bottom: 2rem;
    border-bottom: 1px solid #f8f9fa;
    padding-bottom: 1rem;
}

.section-title h4 {
    margin: 0;
    color: #333;
}

.section-title p {
    margin: 0.3rem 0 0 0;
    font-size: 0.85rem;
    color: #888;
}

.dual-upload-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
}

.upload-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
}

.upload-slot label {
    font-weight: 600;
    font-size: 0.85rem;
    color: #495057;
}

.image-preview-wrapper {
    width: 100%;
    height: 120px;
    position: relative;
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
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

.placeholder .text {
    font-size: 0.75rem;
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

.btn-link-danger {
    background: transparent;
    border: none;
    color: #dc3545;
    font-size: 0.8rem;
    cursor: pointer;
}

.btn-link-danger:hover {
    text-decoration: underline;
}

@media (max-width: 576px) {
    .dual-upload-row {
        grid-template-columns: 1fr;
        gap: 2rem;
    }
}
</style>
