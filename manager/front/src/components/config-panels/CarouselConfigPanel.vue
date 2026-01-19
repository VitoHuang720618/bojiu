<template>
    <div class="config-panel">
        <div class="panel-header">
            <div class="header-info">
                <h3>輪播圖設置</h3>
                <p class="subtitle">管理首頁頂部的大型輪播圖片</p>
            </div>
            <button @click="$emit('add')" class="btn btn-primary">新增輪播圖</button>
        </div>

        <div v-if="carouselSlides.length === 0" class="empty-state">
            <div class="empty-icon">🎞️</div>
            <p>目前沒有輪播圖配置</p>
            <button @click="$emit('add')" class="btn btn-outline-primary">新增第一張輪播圖</button>
        </div>

        <div class="items-list">
            <div v-for="(slide, index) in carouselSlides" :key="index" class="item-card">
                <div class="item-card-header">
                    <span class="item-badge">幻燈片 {{ index + 1 }}</span>
                    <button @click="$emit('remove', index)" class="btn btn-icon-danger" title="刪除">
                        <span class="icon">🗑️</span>
                    </button>
                </div>

                <div class="item-card-body">
                    <div class="upload-column">
                        <label>輪播圖片</label>
                        <div class="uploader-container">
                            <ImageUploader :preview-url="slide.image ? getImageUrl(slide.image) : ''"
                                alt-text="Carousel Slide" placeholder="上傳圖片" dimensions="1920x500"
                                @upload="(file) => handleUpload(file, index)" @clear="$emit('clearImage', index)" />
                        </div>
                    </div>

                    <div class="fields-column">
                        <div class="field-group">
                            <label>跳轉連結</label>
                            <input v-model="slide.href" type="url" class="form-control" placeholder="https://..."
                                @input="$emit('change')" />
                        </div>
                        <div class="field-group">
                            <label>圖片描述</label>
                            <input v-model="slide.description" type="text" class="form-control" placeholder="輸入描述文字..."
                                @input="$emit('change')" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ImageUploader from '../common/ImageUploader.vue'

interface CarouselSlide {
    image: string
    href: string
    description?: string
}

const props = defineProps<{
    carouselSlides: CarouselSlide[]
    getImageUrl: (path: string) => string
}>()

const emit = defineEmits<{
    (e: 'add'): void
    (e: 'remove', index: number): void
    (e: 'upload', event: Event, index: number): void
    (e: 'clearImage', index: number): void
    (e: 'change'): void
}>()

const handleUpload = (file: File, index: number) => {
    // Reconstruct event for parent compatibility
    emit('upload', { target: { files: [file] } } as unknown as Event, index)
}
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
    width: 240px;
    flex-shrink: 0;
}

.upload-column label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.5rem;
}

.uploader-container {
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
}

.fields-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
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

.btn-icon-danger {
    background: transparent;
    border: none;
    color: #dc3545;
    padding: 0.25rem;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s;
}

.btn-icon-danger:hover {
    opacity: 1;
}

@media (max-width: 768px) {
    .item-card-body {
        flex-direction: column;
    }

    .upload-column {
        width: 100%;
    }
}
</style>
