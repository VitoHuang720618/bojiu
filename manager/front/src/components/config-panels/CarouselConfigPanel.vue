<template>
    <div class="config-panel">
        <div class="panel-header">
            <h3>輪播圖設置</h3>
            <div class="button-actions">
                <button @click="$emit('add')" class="btn btn-primary">新增輪播圖</button>
            </div>
        </div>

        <!-- 如果沒有輪播圖，顯示提示 -->
        <div v-if="carouselSlides.length === 0" class="empty-state">
            <p>目前沒有輪播圖配置</p>
            <button @click="$emit('add')" class="btn btn-primary btn-lg">新增第一張輪播圖</button>
        </div>

        <div v-for="(slide, index) in carouselSlides" :key="index" class="carousel-item">
            <div class="item-header">
                <h4>輪播圖 {{ index + 1 }}</h4>
                <button @click="$emit('remove', index)" class="btn btn-danger btn-sm">刪除</button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>圖片</label>
                    <div class="image-upload-wrapper">
                        <ImageUploader :preview-url="slide.image" alt-text="Carousel Slide" placeholder="上傳圖片"
                            dimensions="1920x500" @upload="(file) => handleUpload(file, index)"
                            @clear="$emit('clearImage', index)" />
                    </div>
                </div>
                <div class="form-group">
                    <label>連結</label>
                    <input v-model="slide.href" type="url" class="form-control" placeholder="https://example.com"
                        @input="$emit('change')" />
                </div>
                <div class="form-group">
                    <label>描述</label>
                    <input v-model="slide.description" type="text" class="form-control" placeholder="圖片描述"
                        @input="$emit('change')" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface CarouselSlide {
    image: string
    href: string
    description?: string
}

import ImageUploader from '../common/ImageUploader.vue'

defineProps<{
    carouselSlides: CarouselSlide[]
}>()

const emit = defineEmits<{
    (e: 'add'): void
    (e: 'remove', index: number): void
    (e: 'upload', event: Event, index: number): void
    (e: 'clearImage', index: number): void
    (e: 'change'): void
}>()

const handleUpload = (file: File, index: number) => {
    // Create a mock Event object to maintain compatibility with the existing parent handler
    // or ideally, refactor the parent to accept File directly. 
    // For now, let's look at how the parent uses it.
    // The parent ConfigManager uses: const file = (event.target as HTMLInputElement).files?.[0]
    // So we need to reconstruct an event-like structure or change the parent.
    // Let's opt to change the parent handler signature in the next step for cleaner code.
    // But for this component, we can emit a custom event payload and let the parent handle it.
    // Actually, looking at the emit definition: (e: 'upload', event: Event, index: number)
    // We should change the emit definition to accept File object directly for better DX.

    // Changing strategy: We will emit a modified event.
    // But wait, constructing a fake Event with target.files is messy.
    // Better to update the emit definition to: (e: 'upload', file: File, index: number)
    emit('upload', { target: { files: [file] } } as unknown as Event, index)
}
</script>

<style scoped>
.carousel-item {
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
    flex-wrap: wrap;
}

.form-group {
    flex: 1;
    min-width: 200px;
}

.image-upload-wrapper {
    height: 160px;
}

.preview-img.small {
    height: 100px;
    object-fit: contain;
}

.placeholder.small {
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    background: #f5f5f5;
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
