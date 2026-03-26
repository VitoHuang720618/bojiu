<template>
    <div class="config-panel">
        <div class="panel-header">
            <div class="header-info">
                <h3>浮動廣告設置</h3>
                <p class="subtitle">管理頁面右側的悬浮快捷入口</p>
            </div>
            <div class="header-actions">
                <button @click="$emit('reset')" class="btn btn-outline-secondary">重置為預設</button>
                <button @click="$emit('add')" class="btn btn-primary">新增廣告</button>
            </div>
        </div>

        <div v-if="floatAdButtons.length === 0" class="empty-state">
            <div class="empty-icon">🛰️</div>
            <p>目前沒有浮動廣告按鈕</p>
            <button @click="$emit('add')" class="btn btn-outline-primary">新增第一個廣告</button>
        </div>

        <div class="items-list">
            <div v-for="(button, index) in floatAdButtons" :key="index" class="item-card">
                <div class="item-card-header">
                    <span class="item-badge">廣告 {{ index + 1 }}</span>
                    <button @click="$emit('remove', index)" class="btn btn-icon-danger" title="刪除廣告">
                        <span class="icon">🗑️</span>
                    </button>
                </div>

                <div class="item-card-body">
                    <div class="field-group mb-4">
                        <label>跳轉網址</label>
                        <input v-model="button.href" type="url" class="form-control" placeholder="https://..."
                            @input="$emit('change')" />
                    </div>


                    <div class="upload-grid">
                        <div class="upload-slot">
                            <label>PC 默認</label>
                            <div class="uploader-container">
                                <ImageUploader :preview-url="button.default ? getImageUrl(button.default) : ''"
                                    placeholder="默認" @upload="(file) => handleUpload(file, index, 'default')"
                                    @clear="$emit('removeImage', index, 'default')" />
                            </div>
                        </div>

                        <div class="upload-slot">
                            <label>PC 懸停</label>
                            <div class="uploader-container">
                                <ImageUploader :preview-url="button.hover ? getImageUrl(button.hover) : ''"
                                    placeholder="懸停" @upload="(file) => handleUpload(file, index, 'hover')"
                                    @clear="$emit('removeImage', index, 'hover')" />
                            </div>
                        </div>

                        <div class="upload-slot">
                            <label>平板端</label>
                            <div class="uploader-container">
                                <ImageUploader :preview-url="button.tablet ? getImageUrl(button.tablet) : ''"
                                    placeholder="平板" @upload="(file) => handleUpload(file, index, 'tablet')"
                                    @clear="$emit('removeImage', index, 'tablet')" />
                            </div>
                        </div>

                        <div class="upload-slot">
                            <label>手機端</label>
                            <div class="uploader-container">
                                <ImageUploader :preview-url="button.mobile ? getImageUrl(button.mobile) : ''"
                                    placeholder="手機" @upload="(file) => handleUpload(file, index, 'mobile')"
                                    @clear="$emit('removeImage', index, 'mobile')" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ImageUploader from '../common/ImageUploader.vue'

interface FloatAdButton {
    href: string
    default: string
    hover: string
    tablet?: string
    mobile: string
}

const props = defineProps<{
    floatAdButtons: FloatAdButton[]
    getImageUrl: (path: string) => string
}>()

const emit = defineEmits<{
    (e: 'reset'): void
    (e: 'add'): void
    (e: 'remove', index: number): void
    (e: 'upload', event: Event, index: number, type: 'default' | 'hover' | 'tablet' | 'mobile'): void
    (e: 'removeImage', index: number, type: 'default' | 'hover' | 'tablet' | 'mobile'): void
    (e: 'change'): void
}>()

const handleUpload = (file: File, index: number, type: 'default' | 'hover' | 'tablet' | 'mobile') => {
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

.header-actions {
    display: flex;
    gap: 0.5rem;
}

.subtitle {
    font-size: 0.9rem;
    color: #666;
    margin: 0.25rem 0 0 0;
}

.empty-state {
    background: #f8f9fa;
    border: 2px dashed #dee2e6;
    border-radius: 12px;
    padding: 3rem 2rem;
    text-align: center;
    color: #6c757d;
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
}

.items-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
}

.item-card {
    background: #fff;
    border: 1px solid #eef0f2;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.item-card-header {
    background: #fcfdfe;
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid #eef0f2;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.item-badge {
    background: #e7f3ff;
    color: #007bff;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    text-transform: uppercase;
}

.item-card-body {
    padding: 1.5rem;
}

.mb-4 {
    margin-bottom: 1.5rem;
}

.field-group label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.4rem;
}

.form-control {
    width: 100%;
    max-width: 600px;
    padding: 0.6rem 0.8rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 0.9rem;
}

.upload-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #f1f3f5;
    max-width: 600px;
    /* Constrain width */
}

.upload-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.upload-slot label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #868e96;
}

.uploader-container {
    width: 100%;
    height: 70px;
}

.btn-icon-danger {
    background: transparent;
    border: none;
    color: #dc3545;
    padding: 0.25rem;
    cursor: pointer;
}

.btn-danger {
    background: #dc3545;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-danger:hover {
    background: #c82333;
}

@media (max-width: 768px) {
    .upload-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
}
</style>
