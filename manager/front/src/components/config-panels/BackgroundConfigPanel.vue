<template>
    <div class="config-panel">
        <h3>背景圖設置</h3>
        <div class="form-group">
            <label>背景圖片</label>
            <div class="image-upload">
                <img v-if="backgroundImage" :src="backgroundImage" alt="Background" class="preview-img" />
                <div v-else class="placeholder">無背景圖（顯示預設圖案）</div>
                <input type="file" @change="(e) => $emit('upload', e)" accept="image/*" class="file-input" />
                <button @click="$emit('clear')" class="btn btn-danger btn-sm">清除</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    backgroundImage: string | undefined
}>()

defineEmits<{
    (e: 'upload', event: Event): void
    (e: 'clear'): void
}>()
</script>

<style scoped>
.form-group {
    margin-bottom: 20px;
}

.image-upload {
    border: 2px dashed #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    position: relative;
    background: #fdfdfd;
    transition: all 0.3s ease;
}

.image-upload:hover {
    border-color: #3498db;
    background: #f0f7ff;
}

.preview-img {
    max-width: 100%;
    max-height: 300px;
    margin-bottom: 15px;
    border-radius: 4px;
}

.placeholder {
    padding: 40px;
    color: #999;
    background: #f5f5f5;
    border-radius: 4px;
    margin-bottom: 15px;
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

.btn {
    position: relative;
    z-index: 2;
}
</style>
