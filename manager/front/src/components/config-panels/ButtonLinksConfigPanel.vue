<template>
    <div class="config-panel">
        <div class="panel-header">
            <h3>按鈕鏈接設置</h3>
            <div class="button-actions">
                <button @click="$emit('reset')" class="btn btn-secondary">重置為預設</button>
                <button @click="$emit('add')" class="btn btn-primary">新增按鈕</button>
            </div>
        </div>

        <div class="button-links-info">
            <p class="info-text">
                <strong>說明：</strong>這裡配置的按鈕會替換前端頁面頂部的按鈕。
                可以上傳自定義的按鈕圖片（默認圖和懸停圖），並設置鏈接地址和顯示文字。
                所有鏈接都會在新視窗中打開。
            </p>
        </div>

        <!-- 如果沒有按鈕鏈接，顯示提示 -->
        <div v-if="buttonLinks.length === 0" class="empty-state">
            <p>目前沒有按鈕鏈接配置，將使用預設配置</p>
            <button @click="$emit('add')" class="btn btn-primary btn-lg">新增第一個按鈕鏈接</button>
        </div>

        <div v-for="(button, index) in buttonLinks" :key="index" class="button-link-item">
            <div class="item-header">
                <h4>按鈕 {{ index + 1 }}</h4>
                <button @click="$emit('remove', index)" class="btn btn-danger btn-sm">刪除</button>
            </div>
            <div class="button-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>顯示文字</label>
                        <input v-model="button.text" type="text" class="form-control" placeholder="例如：官方網站"
                            @input="$emit('change')" />
                    </div>
                    <div class="form-group">
                        <label>鏈接地址</label>
                        <input v-model="button.href" type="url" class="form-control" placeholder="https://example.com"
                            @input="$emit('change')" />
                    </div>
                </div>
                <div class="image-row">
                    <div class="form-group">
                        <label>默認圖片</label>
                        <div class="image-upload">
                            <img v-if="button.defaultImage" :src="getImageUrl(button.defaultImage)" alt="Default"
                                class="preview-img small" />
                            <div v-else class="placeholder small">無圖片</div>
                            <input type="file" @change="(e) => $emit('upload', e, index, 'defaultImage')"
                                accept="image/*" class="file-input" />
                            <button @click="$emit('removeImage', index, 'defaultImage')"
                                class="btn btn-danger btn-sm">刪除圖片</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>懸停圖片</label>
                        <div class="image-upload">
                            <img v-if="button.hoverImage" :src="getImageUrl(button.hoverImage)" alt="Hover"
                                class="preview-img small" />
                            <div v-else class="placeholder small">無圖片</div>
                            <input type="file" @change="(e) => $emit('upload', e, index, 'hoverImage')" accept="image/*"
                                class="file-input" />
                            <button @click="$emit('removeImage', index, 'hoverImage')"
                                class="btn btn-danger btn-sm">刪除圖片</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface ButtonLink {
    text: string
    href: string
    defaultImage?: string
    hoverImage?: string
}

defineProps<{
    buttonLinks: ButtonLink[]
    getImageUrl: (path: string) => string
}>()

defineEmits<{
    (e: 'reset'): void
    (e: 'add'): void
    (e: 'remove', index: number): void
    (e: 'upload', event: Event, index: number, type: 'defaultImage' | 'hoverImage'): void
    (e: 'removeImage', index: number, type: 'defaultImage' | 'hoverImage'): void
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
