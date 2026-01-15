<template>
    <div class="config-panel">
        <div class="panel-header">
            <h3>{{ title }}</h3>
            <button @click="$emit('add')" class="btn btn-primary">新增{{ itemLabel }}</button>
        </div>

        <!-- 如果沒有項目，顯示提示和新增按鈕 -->
        <div v-if="items.length === 0" class="empty-state">
            <p>目前沒有{{ itemLabel }}項目</p>
            <button @click="$emit('add')" class="btn btn-primary btn-lg">新增第一個{{ itemLabel }}</button>
        </div>

        <div v-for="(item, index) in items" :key="index" class="thumbnail-item">
            <div class="item-header">
                <h4>{{ itemLabel }} {{ index + 1 }}</h4>
                <button @click="$emit('remove', index)" class="btn btn-danger btn-sm">刪除項目</button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>縮圖</label>
                    <div class="image-upload">
                        <img v-if="item.image" :src="item.image" :alt="item.alt" class="preview-img small" />
                        <div v-else class="placeholder small">無圖片</div>
                        <input type="file" @change="(e) => $emit('upload', e, index)" accept="image/*"
                            class="file-input" />
                    </div>
                    <button v-if="item.image" @click="$emit('removeImage', index)"
                        class="btn btn-danger btn-sm mt-2">刪除圖片</button>
                </div>
                <div class="form-group">
                    <label>連結</label>
                    <input v-model="item.href" type="url" class="form-control" placeholder="https://example.com"
                        @input="$emit('change')" />
                </div>
                <div class="form-group">
                    <label>標題</label>
                    <input v-model="item.title" type="text" class="form-control" :placeholder="`${itemLabel}標題`"
                        @input="$emit('change')" />
                </div>
                <div class="form-group">
                    <label>描述</label>
                    <input v-model="item.alt" type="text" class="form-control" placeholder="圖片描述"
                        @input="$emit('change')" />
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

defineProps<{
    title: string
    itemLabel: string
    items: ThumbnailItem[]
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
.thumbnail-item {
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

.image-upload {
    border: 1px dashed #ccc;
    border-radius: 4px;
    padding: 10px;
    text-align: center;
    position: relative;
    background: white;
}

.preview-img.small {
    height: 80px;
    object-fit: contain;
}

.placeholder.small {
    height: 80px;
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
