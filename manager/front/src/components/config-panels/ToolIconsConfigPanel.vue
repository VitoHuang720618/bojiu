<template>
    <div class="config-panel">
        <div class="panel-header">
            <div class="header-info">
                <h3>工具圖標設置</h3>
                <p class="subtitle">管理頁面底部的外鏈工具與圖標</p>
            </div>
            <div class="header-actions">
                <button @click="$emit('reset')" class="btn btn-outline-secondary">重置為預設</button>
                <button @click="$emit('add')" class="btn btn-primary">新增圖標</button>
            </div>
        </div>

        <div v-if="toolIcons.length === 0" class="empty-state">
            <div class="empty-icon">🛠️</div>
            <p>目前沒有自定義工具圖標</p>
            <button @click="$emit('add')" class="btn btn-outline-primary">新增第一個圖標</button>
        </div>

        <div class="items-list">
            <div v-for="(tool, index) in toolIcons" :key="index" class="item-card">
                <div class="item-card-header">
                    <span class="item-badge">工具 {{ index + 1 }}</span>
                    <button @click="$emit('remove', index)" class="btn btn-icon-danger" title="刪除圖標">
                        <span class="icon">🗑️</span>
                    </button>
                </div>

                <div class="item-card-body">
                    <div class="form-main">
                        <div class="field-group mb-4">
                            <label>連結地址</label>
                            <input v-model="tool.href" type="url" class="form-control" placeholder="https://..."
                                @input="$emit('change')" />
                        </div>

                        <div class="dual-upload-row">
                            <div class="upload-slot">
                                <label>默認狀態</label>
                                <div class="image-preview-wrapper" :class="{ 'has-image': tool.default }">
                                    <img v-if="tool.default" :src="getImageUrl(tool.default)" alt="Default"
                                        class="preview-img" />
                                    <div v-else class="placeholder">
                                        <span class="icon">🖼️</span>
                                    </div>
                                    <input type="file" @change="(e) => $emit('upload', e, index, 'default')"
                                        accept="image/*" class="file-input" />
                                </div>
                                <button v-if="tool.default" @click="$emit('removeImage', index, 'default')"
                                    class="btn btn-link-danger btn-sm">移除</button>
                            </div>

                            <div class="upload-slot">
                                <label>懸停狀態</label>
                                <div class="image-preview-wrapper" :class="{ 'has-image': tool.hover }">
                                    <img v-if="tool.hover" :src="getImageUrl(tool.hover)" alt="Hover"
                                        class="preview-img" />
                                    <div v-else class="placeholder">
                                        <span class="icon">✨</span>
                                    </div>
                                    <input type="file" @change="(e) => $emit('upload', e, index, 'hover')"
                                        accept="image/*" class="file-input" />
                                </div>
                                <button v-if="tool.hover" @click="$emit('removeImage', index, 'hover')"
                                    class="btn btn-link-danger btn-sm">移除</button>
                            </div>
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

const props = defineProps<{
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
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.item-card {
    background: #fff;
    border: 1px solid #eef0f2;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    display: flex;
    flex-direction: column;
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
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    text-transform: uppercase;
}

.item-card-body {
    padding: 1.25rem;
    flex: 1;
}

.mb-4 {
    margin-bottom: 1rem;
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
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #f1f3f5;
}

@media (max-width: 576px) {
    .dual-upload-row {
        grid-template-columns: 1fr;
    }
}

.upload-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
}

.upload-slot label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #868e96;
}

.image-preview-wrapper {
    width: 100%;
    height: 60px;
    position: relative;
    border: 2px dashed #dee2e6;
    border-radius: 6px;
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
    max-width: 80%;
    max-height: 80%;
    object-fit: contain;
}

.placeholder .icon {
    font-size: 1rem;
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
    line-height: 1;
}

.btn-link-danger {
    background: transparent;
    border: none;
    color: #dc3545;
    font-size: 0.7rem;
    cursor: pointer;
}

.btn-link-danger:hover {
    text-decoration: underline;
}
</style>
