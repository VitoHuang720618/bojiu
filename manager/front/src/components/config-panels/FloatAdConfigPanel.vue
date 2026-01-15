<template>
    <div class="config-panel">
        <div class="panel-header">
            <h3>浮動廣告設置</h3>
            <div class="button-actions">
                <button @click="$emit('reset')" class="btn btn-secondary">重置為預設</button>
                <button @click="$emit('add')" class="btn btn-primary">新增廣告</button>
            </div>
        </div>

        <div class="button-links-info">
            <p class="info-text">
                <strong>說明：</strong>這裡配置的浮動廣告按鈕會顯示在頁面右下角。
                可以上傳自定義的圖標（默認圖和懸停圖），並設置點擊連結。
                所有按鈕都會在新視窗中打開。
            </p>
        </div>

        <!-- 如果沒有浮動廣告，顯示提示 -->
        <div v-if="floatAdButtons.length === 0" class="empty-state">
            <p>目前沒有浮動廣告配置，將使用預設配置</p>
            <button @click="$emit('add')" class="btn btn-primary btn-lg">新增第一個浮動廣告</button>
        </div>

        <div v-for="(button, index) in floatAdButtons" :key="index" class="button-link-item">
            <div class="item-header">
                <h4>浮動廣告 {{ index + 1 }}</h4>
                <button @click="$emit('remove', index)" class="btn btn-danger btn-sm">刪除</button>
            </div>
            <div class="button-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>連結網址</label>
                        <input v-model="button.href" type="url" class="form-control" placeholder="https://example.com"
                            @input="$emit('change')" />
                    </div>
                </div>
                <div class="image-row">
                    <div class="form-group">
                        <label>默認圖標</label>
                        <div class="image-upload">
                            <img v-if="button.default" :src="getImageUrl(button.default)" alt="Default"
                                class="preview-img small" />
                            <div v-else class="placeholder small">無圖片</div>
                            <input type="file" @change="(e) => $emit('upload', e, index, 'default')" accept="image/*"
                                class="file-input" />
                        </div>
                        <button v-if="button.default" @click="$emit('removeImage', index, 'default')"
                            class="btn btn-danger btn-sm mt-1">刪除圖片</button>
                    </div>
                    <div class="form-group">
                        <label>懸停圖標</label>
                        <div class="image-upload">
                            <img v-if="button.hover" :src="getImageUrl(button.hover)" alt="Hover"
                                class="preview-img small" />
                            <div v-else class="placeholder small">無圖片</div>
                            <input type="file" @change="(e) => $emit('upload', e, index, 'hover')" accept="image/*"
                                class="file-input" />
                        </div>
                        <button v-if="button.hover" @click="$emit('removeImage', index, 'hover')"
                            class="btn btn-danger btn-sm mt-1">刪除圖片</button>
                    </div>
                    <div class="form-group">
                        <label>手機端圖標</label>
                        <div class="image-upload">
                            <img v-if="button.mobile" :src="getImageUrl(button.mobile)" alt="Mobile"
                                class="preview-img small" />
                            <div v-else class="placeholder small">無圖片</div>
                            <input type="file" @change="(e) => $emit('upload', e, index, 'mobile')" accept="image/*"
                                class="file-input" />
                        </div>
                        <button v-if="button.mobile" @click="$emit('removeImage', index, 'mobile')"
                            class="btn btn-danger btn-sm mt-1">刪除圖片</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface FloatAdButton {
    href: string
    default: string
    hover: string
    mobile: string
}

defineProps<{
    floatAdButtons: FloatAdButton[]
    getImageUrl: (path: string) => string
}>()

defineEmits<{
    (e: 'reset'): void
    (e: 'add'): void
    (e: 'remove', index: number): void
    (e: 'upload', event: Event, index: number, type: 'default' | 'hover' | 'mobile'): void
    (e: 'removeImage', index: number, type: 'default' | 'hover' | 'mobile'): void
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

.form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
}

.form-group {
    flex: 1;
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
</style>
