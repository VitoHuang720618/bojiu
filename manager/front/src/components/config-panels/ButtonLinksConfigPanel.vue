<template>
    <div class="config-panel">
        <div class="panel-header">
            <div class="header-info">
                <h3>按鈕鏈接設置</h3>
                <p class="subtitle">管理導航欄按鈕及其顯示效果</p>
            </div>
            <div class="header-actions">
                <button @click="$emit('reset')" class="btn btn-outline-secondary">重置為預設</button>
            </div>
        </div>

        <div v-if="buttonLinks.length === 0" class="empty-state">
            <div class="empty-icon">🔗</div>
            <p>目前沒有自定義按鈕，將使用系統預設配置</p>
        </div>

        <div class="items-list">
            <div v-for="(button, index) in buttonLinks" :key="index" class="item-card">
                <div class="item-card-header">
                    <span class="item-badge">按鈕 {{ index + 1 }}</span>
                </div>

                <div class="item-card-body">
                    <div class="form-main">
                        <div class="field-row">
                            <div class="field-group">
                                <label>按鈕文字</label>
                                <input v-model="button.text" type="text" class="form-control" placeholder="例如：官方網站"
                                    @input="$emit('change')" />
                            </div>
                            <div class="field-group">
                                <label>連結地址</label>
                                <input v-model="button.href" type="url" class="form-control" placeholder="https://..."
                                    @input="$emit('change')" />
                            </div>
                        </div>

                        <div class="dual-upload-row">
                            <div class="upload-slot">
                                <label>默認圖標</label>
                                <div class="uploader-container">
                                    <ImageUploader :preview-url="button.defaultImage ? getImageUrl(button.defaultImage) : ''"
                                        placeholder="默認" @upload="(file) => handleUpload(file, index, 'defaultImage')"
                                        @clear="$emit('removeImage', index, 'defaultImage')" />
                                </div>
                            </div>

                            <div class="upload-slot">
                                <label>懸停圖標</label>
                                <div class="uploader-container">
                                    <ImageUploader :preview-url="button.hoverImage ? getImageUrl(button.hoverImage) : ''"
                                        placeholder="懸停" @upload="(file) => handleUpload(file, index, 'hoverImage')"
                                        @clear="$emit('removeImage', index, 'hoverImage')" />
                                </div>
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

interface ButtonLink {
    text: string
    href: string
    defaultImage?: string
    hoverImage?: string
}

const props = defineProps<{
    buttonLinks: ButtonLink[]
    getImageUrl: (path: string) => string
}>()

const emit = defineEmits<{
    (e: 'reset'): void
    (e: 'add'): void
    (e: 'remove', index: number): void
    (e: 'upload', event: Event, index: number, type: 'defaultImage' | 'hoverImage'): void
    (e: 'removeImage', index: number, type: 'defaultImage' | 'hoverImage'): void
    (e: 'change'): void
}>()

const handleUpload = (file: File, index: number, type: 'defaultImage' | 'hoverImage') => {
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
    letter-spacing: 0.5px;
}

.item-card-body {
    padding: 1.5rem;
}

.field-row {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
    max-width: 600px;
    /* Constrain width */
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
    padding: 0.6rem 0.8rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 0.9rem;
}

.form-control:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.dual-upload-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding-top: 1rem;
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
    font-size: 0.8rem;
    font-weight: 600;
    color: #868e96;
}

.uploader-container {
    width: 100%;
    height: 80px;
}

@media (max-width: 576px) {
    .field-row {
        grid-template-columns: 1fr;
    }

    .dual-upload-row {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
}
</style>
