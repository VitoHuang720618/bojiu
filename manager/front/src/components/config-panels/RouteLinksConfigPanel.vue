<template>
    <div class="config-panel">
        <div class="panel-header">
            <h3>推薦路線設置</h3>
            <div class="button-actions">
                <button @click="$emit('reset')" class="btn btn-secondary">重置為預設</button>
            </div>
        </div>

        <div class="button-links-info">
            <p class="info-text">
                <strong>說明：</strong>這裡配置推薦優質線路區域的按鈕圖片。
                可以上傳自定義的圖片（默認圖和懸停圖）。
                這個按鈕會顯示在推薦優質線路標題下方。
            </p>
        </div>

        <div class="route-links-item">
            <div class="item-header">
                <h4>推薦路線按鈕</h4>
            </div>
            <div class="button-form">
                <div class="image-row">
                    <div class="form-group">
                        <label>默認圖片</label>
                        <div class="image-upload">
                            <img v-if="routeLinks.default" :src="getImageUrl(routeLinks.default)" alt="Default"
                                class="preview-img small" />
                            <div v-else class="placeholder small">無圖片</div>
                            <input type="file" @change="(e) => $emit('upload', e, 'default')" accept="image/*"
                                class="file-input" />
                            <button @click="$emit('removeImage', 'default')" class="btn btn-danger btn-sm">刪除圖片</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>懸停圖片</label>
                        <div class="image-upload">
                            <img v-if="routeLinks.hover" :src="getImageUrl(routeLinks.hover)" alt="Hover"
                                class="preview-img small" />
                            <div v-else class="placeholder small">無圖片</div>
                            <input type="file" @change="(e) => $emit('upload', e, 'hover')" accept="image/*"
                                class="file-input" />
                            <button @click="$emit('removeImage', 'hover')" class="btn btn-danger btn-sm">刪除圖片</button>
                        </div>
                    </div>
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

defineProps<{
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
.route-links-item {
    background: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 20px;
}

.item-header {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

.item-header h4 {
    margin: 0;
    color: #333;
}

.image-row {
    display: flex;
    gap: 20px;
}

.form-group {
    flex: 1;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #666;
}

.image-upload {
    border: 1px dashed #ccc;
    border-radius: 4px;
    padding: 10px;
    text-align: center;
    position: relative;
    background: white;
}

.preview-img.small {
    height: 60px;
    object-fit: contain;
}

.placeholder.small {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    background: #f5f5f5;
    font-size: 12px;
}

.file-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
}
</style>
