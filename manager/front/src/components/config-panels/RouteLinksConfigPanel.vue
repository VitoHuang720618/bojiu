<template>
    <div class="config-panel">
        <div class="panel-header">
            <div class="header-info">
                <h3>推薦路線按鈕</h3>
                <p class="subtitle">管理首頁推薦線路區域的入口按鈕 (共 6 組)</p>
            </div>
            <div class="header-actions">
                <button @click="$emit('reset')" class="btn btn-outline-secondary">重置為預設</button>
            </div>
        </div>

        <div class="routes-grid">
            <template v-if="Array.isArray(routeLinks)">
                <div v-for="(link, index) in routeLinks" :key="index" class="route-card">
                    <div class="card-header">
                        <h5>線路 {{ index + 1 }}</h5>
                    </div>

                    <div class="input-section">
                        <label>連結網址 (HREF)</label>
                        <input type="text" :value="link.href"
                            @change="(e) => $emit('update', index, 'href', (e.target as HTMLInputElement).value)"
                            placeholder="請輸入跳轉連結 (https://...)" class="form-control" />
                    </div>

                    <div class="dual-upload-row">
                        <!-- Default -->
                        <div class="upload-slot">
                            <label>默認圖片</label>
                            <div class="uploader-container">
                                <ImageUploader :preview-url="link?.default ? getImageUrl(link.default) : ''"
                                    placeholder="默認" @upload="(file) => handleUpload(file, index, 'default')"
                                    @clear="$emit('removeImage', index, 'default')" />
                            </div>
                        </div>

                        <!-- Hover -->
                        <div class="upload-slot">
                            <label>懸停圖片</label>
                            <div class="uploader-container">
                                <ImageUploader :preview-url="link?.hover ? getImageUrl(link.hover) : ''" placeholder="懸停"
                                    @upload="(file) => handleUpload(file, index, 'hover')"
                                    @clear="$emit('removeImage', index, 'hover')" />
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <div v-else class="loading-placeholder">
                正在初始化配置...
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ImageUploader from '../common/ImageUploader.vue'

interface RouteLink {
    default: string
    hover: string
    href?: string
}

const props = defineProps<{
    routeLinks: RouteLink[]
    getImageUrl: (path: string) => string
}>()

const emit = defineEmits<{
    (e: 'reset'): void
    (e: 'upload', event: Event, index: number, type: 'default' | 'hover'): void
    (e: 'removeImage', index: number, type: 'default' | 'hover'): void
    (e: 'update', index: number, key: string, value: string): void
}>()

const handleUpload = (file: File, index: number, type: 'default' | 'hover') => {
    emit('upload', { target: { files: [file] } } as unknown as Event, index, type)
}
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

.routes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.route-card {
    background: #fff;
    border: 1px solid #eef0f2;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.card-header h5 {
    margin: 0 0 0px 0;
    color: #333;
    font-size: 1rem;
}

.input-section {
    margin: 15px 0;
}

.input-section label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: #495057;
    margin-bottom: 5px;
}

.form-control {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.9rem;
    transition: border-color 0.15s;
}

.form-control:focus {
    border-color: #80bdff;
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.dual-upload-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    border-top: 1px solid #f8f9fa;
    padding-top: 15px;
}

.upload-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.upload-slot label {
    font-weight: 600;
    font-size: 0.8rem;
    color: #495057;
}

.uploader-container {
    width: 100%;
    height: 100px;
}
</style>
