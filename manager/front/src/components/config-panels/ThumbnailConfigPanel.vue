<template>
    <div class="config-panel">
        <div class="panel-header">
            <div class="header-info">
                <h3>{{ title }}</h3>
                <p class="subtitle">管理{{ itemLabel }}列表與內容</p>
            </div>
            <button @click="$emit('add')" class="btn btn-primary">新增{{ itemLabel }}</button>
        </div>

        <div v-if="items.length === 0" class="empty-state">
            <div class="empty-icon">📁</div>
            <p>目前沒有{{ itemLabel }}項目</p>
            <button @click="$emit('add')" class="btn btn-outline-primary">新增第一個{{ itemLabel }}</button>
        </div>

        <div class="items-list">
            <div v-for="(item, index) in items" :key="index" class="item-card">
                <div class="item-card-header">
                    <span class="item-badge">項目 {{ index + 1 }}</span>
                    <button @click="$emit('remove', index)" class="btn btn-icon-danger" title="刪除項目">
                        <span class="icon">🗑️</span>
                    </button>
                </div>

                <div class="item-card-body">
                    <div class="upload-column">
                        <div class="image-preview-wrapper" :class="{ 'has-image': item.image }">
                            <img v-if="item.image" :src="getImageUrl(item.image)" :alt="item.alt" class="preview-img" />
                            <div v-else class="placeholder">
                                <span class="icon">🖼️</span>
                                <span class="text">上傳縮圖</span>
                            </div>
                            <input type="file" @change="(e) => $emit('upload', e, index)" accept="image/*"
                                class="file-input" />
                        </div>
                        <button v-if="item.image" @click="$emit('removeImage', index)"
                            class="btn btn-link-danger btn-sm">移除圖片</button>
                    </div>

                    <div class="fields-column">
                        <div class="field-group">
                            <label>連結地址</label>
                            <input v-model="item.href" type="url" class="form-control" placeholder="https://..."
                                @input="$emit('change')" />
                        </div>
                        <div class="form-row">
                            <div class="field-group">
                                <label>顯示標題</label>
                                <input v-model="item.title" type="text" class="form-control"
                                    :placeholder="`${itemLabel}標題`" @input="$emit('change')" />
                            </div>
                            <div class="field-group">
                                <label>圖片描述 (ALT)</label>
                                <input v-model="item.alt" type="text" class="form-control" placeholder="描述文字..."
                                    @input="$emit('change')" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface ThumbnailItem {
    image: string
    href: string
    title: string
    alt: string
}

const props = defineProps<{
    title: string
    itemLabel: string
    items: ThumbnailItem[]
    getImageUrl: (path: string) => string
}>()

defineEmits<{
    (e: 'add'): void
    (e: 'remove', index: number): void
    (e: 'upload', event: Event, index: number): void
    (e: 'removeImage', index: number): void
    (e: 'change'): void
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

.empty-state {
    background: #f8f9fa;
    border: 2px dashed #dee2e6;
    border-radius: 12px;
    padding: 4rem 2rem;
    text-align: center;
    color: #6c757d;
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.item-card {
    background: #fff;
    border: 1px solid #eef0f2;
    border-radius: 12px;
    margin-bottom: 1.5rem;
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
    display: flex;
    gap: 1.5rem;
}

.upload-column {
    width: 140px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.image-preview-wrapper {
    width: 140px;
    height: 100px;
    position: relative;
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    overflow: hidden;
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
    width: 100%;
    height: 100%;
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

.fields-column {
    flex: 1;
}

.field-group {
    margin-bottom: 1rem;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    max-width: 600px;
    /* Match form-control max-width */
}

.form-row .field-group {
    margin-bottom: 0;
}

.form-row .form-control {
    max-width: 100%;
    /* Fill the grid cell */
}

.field-group:last-child {
    margin-bottom: 0;
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
    /* Constrain width */
    padding: 0.6rem 0.8rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: border-color 0.2s;
}

.form-control:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.btn-icon-danger {
    background: transparent;
    border: none;
    color: #dc3545;
    padding: 0.25rem;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-icon-danger:hover {
    opacity: 1;
    background: #fff5f5;
    border-radius: 4px;
}

.btn-link-danger {
    background: transparent;
    border: none;
    color: #dc3545;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0;
}

.btn-link-danger:hover {
    text-decoration: underline;
}

@media (max-width: 768px) {
    .item-card-body {
        flex-direction: column;
    }

    .upload-column {
        width: 100%;
    }

    .image-preview-wrapper {
        width: 100%;
        height: 150px;
    }
}
</style>
