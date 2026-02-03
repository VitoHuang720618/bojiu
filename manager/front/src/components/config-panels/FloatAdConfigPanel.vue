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
                            <div class="image-preview-wrapper" :class="{ 'has-image': button.default }">
                                <img v-if="button.default" :src="getImageUrl(button.default)" alt="Default"
                                    class="preview-img" />
                                <div v-else class="placeholder">
                                    <span class="text">默認</span>
                                </div>
                                <input type="file" @change="(e) => $emit('upload', e, index, 'default')"
                                    accept="image/*" class="file-input" />
                            </div>
                            <button v-if="button.default" @click="$emit('removeImage', index, 'default')"
                                class="btn btn-link-danger btn-sm">移除</button>
                        </div>

                        <div class="upload-slot">
                            <label>PC 懸停</label>
                            <div class="image-preview-wrapper" :class="{ 'has-image': button.hover }">
                                <img v-if="button.hover" :src="getImageUrl(button.hover)" alt="Hover"
                                    class="preview-img" />
                                <div v-else class="placeholder">
                                    <span class="text">懸停</span>
                                </div>
                                <input type="file" @change="(e) => $emit('upload', e, index, 'hover')" accept="image/*"
                                    class="file-input" />
                            </div>
                            <button v-if="button.hover" @click="$emit('removeImage', index, 'hover')"
                                class="btn btn-link-danger btn-sm">移除</button>
                        </div>

                        <div class="upload-slot">
                            <label>平板端</label>
                            <div class="image-preview-wrapper" :class="{ 'has-image': button.tablet }">
                                <img v-if="button.tablet" :src="getImageUrl(button.tablet)" alt="Tablet"
                                    class="preview-img" />
                                <div v-else class="placeholder">
                                    <span class="text">平板</span>
                                </div>
                                <input type="file" @change="(e) => $emit('upload', e, index, 'tablet')" accept="image/*"
                                    class="file-input" />
                            </div>
                            <button v-if="button.tablet" @click="$emit('removeImage', index, 'tablet')"
                                class="btn btn-link-danger btn-sm">移除</button>
                        </div>

                        <div class="upload-slot">
                            <label>手機端</label>
                            <div class="image-preview-wrapper" :class="{ 'has-image': button.mobile }">
                                <img v-if="button.mobile" :src="getImageUrl(button.mobile)" alt="Mobile"
                                    class="preview-img" />
                                <div v-else class="placeholder">
                                    <span class="text">手機</span>
                                </div>
                                <input type="file" @change="(e) => $emit('upload', e, index, 'mobile')" accept="image/*"
                                    class="file-input" />
                            </div>
                            <button v-if="button.mobile" @click="$emit('removeImage', index, 'mobile')"
                                class="btn btn-link-danger btn-sm">移除</button>
                        </div>
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
    tablet?: string
    mobile: string
}

const props = defineProps<{
    floatAdButtons: FloatAdButton[]
    getImageUrl: (path: string) => string
}>()

defineEmits<{
    (e: 'reset'): void
    (e: 'add'): void
    (e: 'remove', index: number): void
    (e: 'upload', event: Event, index: number, type: 'default' | 'hover' | 'tablet' | 'mobile'): void
    (e: 'removeImage', index: number, type: 'default' | 'hover' | 'tablet' | 'mobile'): void
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

.image-preview-wrapper {
    width: 100%;
    height: 70px;
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
    max-width: 85%;
    max-height: 85%;
    object-fit: contain;
}

.placeholder .icon {
    font-size: 1.2rem;
    color: #adb5bd;
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

.btn-icon-danger {
    background: transparent;
    border: none;
    color: #dc3545;
    padding: 0.25rem;
    cursor: pointer;
}

.btn-link-danger {
    background: transparent;
    border: none;
    color: #dc3545;
    font-size: 0.75rem;
    cursor: pointer;
}

.btn-link-danger:hover {
    text-decoration: underline;
}

@media (max-width: 768px) {
    .upload-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
}
</style>
