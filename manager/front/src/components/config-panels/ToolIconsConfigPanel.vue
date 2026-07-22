<template>
    <div class="config-panel">
        <div class="panel-header">
            <div class="header-info">
                <h3>推薦工具設定</h3>
                <p class="subtitle">設定推薦工具列的連結、預設圖示與滑過圖示</p>
            </div>
            <div class="header-actions">
                <button @click="$emit('reset')" class="btn btn-outline-secondary">重置為預設</button>
                <button @click="$emit('add')" class="btn btn-primary">新增推薦工具</button>
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
                                <div class="uploader-container">
                                    <ImageUploader :preview-url="tool.default ? getImageUrl(tool.default) : ''"
                                        placeholder="默認" @upload="(file) => handleUpload(file, index, 'default')"
                                        @clear="$emit('removeImage', index, 'default')" />
                                </div>
                            </div>

                            <div class="upload-slot">
                                <label>懸停狀態</label>
                                <div class="uploader-container">
                                    <ImageUploader :preview-url="tool.hover ? getImageUrl(tool.hover) : ''"
                                        placeholder="懸停" @upload="(file) => handleUpload(file, index, 'hover')"
                                        @clear="$emit('removeImage', index, 'hover')" />
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

interface ToolIcon {
    href: string
    default: string
    hover: string
}

const props = defineProps<{
    toolIcons: ToolIcon[]
    getImageUrl: (path: string) => string
}>()

const emit = defineEmits<{
    (e: 'reset'): void
    (e: 'add'): void
    (e: 'remove', index: number): void
    (e: 'upload', event: Event, index: number, type: 'default' | 'hover'): void
    (e: 'removeImage', index: number, type: 'default' | 'hover'): void
    (e: 'change'): void
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
    margin-bottom: 1.5rem;
}

.panel-header h3 {
    margin: 0;
    color: #22384e;
    font-size: 1.35rem;
    letter-spacing: 0.01em;
}

.btn {
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 0.58rem 0.82rem;
    font-size: 0.84rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}

.btn:hover { transform: translateY(-1px); }
.btn-primary { background: #2563a4; color: #fff; border-color: #2563a4; }
.btn-outline-secondary { background: #fff; color: #52667a; border-color: #ccd8e4; }
.btn-icon-danger { padding: 0.3rem 0.45rem; color: #a33f47; background: transparent; border-color: transparent; }
.btn-icon-danger:hover { background: #fff0f1; }

.header-actions {
    display: flex;
    gap: 0.5rem;
}

.subtitle {
    font-size: 0.88rem;
    color: #718096;
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
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.item-card {
    background: #ffffff;
    border: 1px solid #dfe7ef;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(27, 53, 78, 0.06);
    display: flex;
    flex-direction: column;
    max-width: 980px;
}

.item-card-header {
    background: #f5f8fb;
    padding: 0.7rem 1rem;
    border-bottom: 1px solid #e7edf3;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.item-badge {
    background: #e5f0fb;
    color: #2563a4;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.28rem 0.58rem;
    border-radius: 999px;
    text-transform: uppercase;
}

.item-card-body {
    padding: 1rem;
    flex: 1;
}

.mb-4 {
    margin-bottom: 1rem;
}

.field-group label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #34495e;
    margin-bottom: 0.4rem;
}

.form-control {
    width: 100%;
    padding: 0.7rem 0.8rem;
    border: 1px solid #cad7e3;
    border-radius: 8px;
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
    gap: 0.75rem;
    padding-top: 0.85rem;
    border-top: 1px solid #e7edf3;
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
    gap: 0.5rem;
    padding: 0.65rem;
    background: #f8fafc;
    border: 1px solid #e5edf5;
    border-radius: 10px;
}

.upload-slot label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #868e96;
}

.uploader-container {
    width: 100%;
    height: 78px;
}

.header-actions :deep(button),
.item-card-header :deep(button) {
    border-radius: 8px;
}

/* Casino control-room finish */
.panel-header h3 { color: #f2c36f; }
.subtitle { color: #aeb9c6; }
.btn-primary { background: linear-gradient(135deg, #bd4d34, #8e202a); border-color: #d47852; }
.btn-outline-secondary { background: #19222d; color: #e5c27e; border-color: rgba(229, 194, 126, 0.38); }
.item-card { background: #141c26; border-color: rgba(229, 194, 126, 0.22); box-shadow: 0 14px 30px rgba(0, 0, 0, 0.24); }
.item-card-header { background: linear-gradient(90deg, #1b2633, #151c26); border-bottom-color: rgba(229, 194, 126, 0.16); }
.item-badge { background: rgba(195, 52, 61, 0.18); color: #f0c26d; border: 1px solid rgba(240, 194, 109, 0.24); }
.field-group label, .upload-slot label { color: #d4dde8; }
.form-control { background: #0d131b; color: #e8edf3; border-color: #394757; }
.form-control:focus { border-color: #d29a46; box-shadow: 0 0 0 3px rgba(210, 154, 70, 0.16); }
.dual-upload-row { border-top-color: rgba(229, 194, 126, 0.14); }
.upload-slot { background: #101720; border-color: rgba(229, 194, 126, 0.14); }
</style>
