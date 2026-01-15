<template>
    <div class="config-panel">
        <div class="panel-header">
            <h3>工具圖標設置</h3>
            <div class="button-actions">
                <button @click="$emit('reset')" class="btn btn-secondary">重置為預設</button>
                <button @click="$emit('add')" class="btn btn-primary">新增圖標</button>
            </div>
        </div>

        <div class="button-links-info">
            <p class="info-text">
                <strong>說明：</strong>這裡配置的工具圖標會替換前端頁面推薦瀏覽器區域的圖標。
                可以上傳自定義的圖標（默認圖和懸停圖），並設置圖標名稱。
                所有圖標都會在新視窗中打開。
            </p>
        </div>

        <!-- 如果沒有工具圖標，顯示提示 -->
        <div v-if="toolIcons.length === 0" class="empty-state">
            <p>目前沒有工具圖標配置，將使用預設配置</p>
            <button @click="$emit('add')" class="btn btn-primary btn-lg">新增第一個工具圖標</button>
        </div>

        <div v-for="(tool, index) in toolIcons" :key="index" class="button-link-item">
            <div class="item-header">
                <h4>工具圖標 {{ index + 1 }}</h4>
                <button @click="$emit('remove', index)" class="btn btn-danger btn-sm">刪除</button>
            </div>
            <div class="button-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>連結網址</label>
                        <input v-model="tool.href" type="url" class="form-control" placeholder="https://example.com"
                            @input="$emit('change')" />
                    </div>
                </div>
                <div class="image-row">
                    <div class="form-group">
                        <label>默認圖標</label>
                        <div class="image-upload">
                            <img v-if="tool.default" :src="getImageUrl(tool.default)" alt="Default"
                                class="preview-img small" />
                            <div v-else class="placeholder small">無圖片</div>
                            <input type="file" @change="(e) => $emit('upload', e, index, 'default')" accept="image/*"
                                class="file-input" />
                            <button @click="$emit('removeImage', index, 'default')"
                                class="btn btn-danger btn-sm">刪除圖片</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>懸停圖標</label>
                        <div class="image-upload">
                            <img v-if="tool.hover" :src="getImageUrl(tool.hover)" alt="Hover"
                                class="preview-img small" />
                            <div v-else class="placeholder small">無圖片</div>
                            <input type="file" @change="(e) => $emit('upload', e, index, 'hover')" accept="image/*"
                                class="file-input" />
                            <button @click="$emit('removeImage', index, 'hover')"
                                class="btn btn-danger btn-sm">刪除圖片</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface ToolIcon {
    href: string
    default: string
    hover: string
}

defineProps<{
    toolIcons: ToolIcon[]
    getImageUrl: (path: string) => string
}>()

defineEmits<{
    (e: 'reset'): void
    (e: 'add'): void
    (e: 'remove', index: number): void
    (e: 'upload', event: Event, index: number, type: 'default' | 'hover'): void
    (e: 'removeImage', index: number, type: 'default' | 'hover'): void
    (e: 'change'): void
}>()
</script>

<style scoped>
.button-link-item {
    background: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

.item-header h4 {
    margin: 0;
    color: #333;
}

.form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
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

.image-row {
    display: flex;
    gap: 20px;
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

.empty-state {
    text-align: center;
    padding: 40px;
    background: #f9f9f9;
    border-radius: 8px;
    border: 2px dashed #eee;
    margin: 20px 0;
}

.button-actions {
    display: flex;
    gap: 10px;
}
</style>
