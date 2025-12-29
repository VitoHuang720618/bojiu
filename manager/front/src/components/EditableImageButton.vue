<script setup lang="ts">
import { ref } from 'vue'
import ImageComponent from './ImageComponent.vue'

interface EditableImageButtonProps {
    defaultSrc: string
    hoverSrc: string
    alt: string
    configPathDefault: string
    configPathHover: string
    dataIndex?: string | number
    dataTitle?: string
}

const props = defineProps<EditableImageButtonProps>()

const fileInputDefault = ref<HTMLInputElement | null>(null)
const fileInputHover = ref<HTMLInputElement | null>(null)

const triggerUpload = (input: HTMLInputElement | null) => {
    input?.click()
}

const handleFileUpload = async (event: Event, path: string) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)
    formData.append('path', path)

    try {
        const response = await fetch('http://localhost:3003/api/upload', {
            method: 'POST',
            body: formData
        })
        if (response.ok) {
            window.location.reload()
        }
    } catch (error) {
        console.error('Upload failed:', error)
    }
}
</script>

<template>
    <div class="editable-img-button" :data-index="dataIndex" :data-title="dataTitle">
        <!-- Visual content mimicking ImageButton -->
        <ImageComponent :src="defaultSrc" :alt="alt" class="img-button--default" />
        <ImageComponent :src="hoverSrc" :alt="alt" class="img-button--hover" />

        <!-- Hidden File Inputs -->
        <input type="file" ref="fileInputDefault" style="display: none" accept="image/*"
            @change="handleFileUpload($event, configPathDefault)" />
        <input type="file" ref="fileInputHover" style="display: none" accept="image/*"
            @change="handleFileUpload($event, configPathHover)" />

        <!-- Editor Overlay (Shown on hover) -->
        <div class="editor-overlay">
            <button @click.stop="triggerUpload(fileInputDefault)" class="edit-btn">更換默認</button>
            <button @click.stop="triggerUpload(fileInputHover)" class="edit-btn">更換懸停</button>
        </div>
    </div>
</template>

<style scoped>
.editable-img-button {
    display: block;
    position: relative;
    cursor: pointer;
}

.editable-img-button :deep(img) {
    display: block;
    width: 100%;
}

.editable-img-button :deep(.img-button--default) {
    opacity: 1;
    transition: opacity 0.1s ease-in-out;
}

.editable-img-button :deep(.img-button--hover) {
    left: 0;
    opacity: 0;
    position: absolute;
    top: 0;
    transition: opacity 0.1s ease-in-out;
}

/* Maintain original hover effect for preview */
.editable-img-button:hover :deep(.img-button--default) {
    opacity: 0;
}

.editable-img-button:hover :deep(.img-button--hover) {
    opacity: 1;
}

/* Editor Overlay Styles */
.editor-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 10;
}

.editable-img-button:hover .editor-overlay {
    opacity: 1;
}

.edit-btn {
    background: #ba081f;
    color: white;
    border: none;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
}

.edit-btn:hover {
    background: #8b0012;
}

/* Replicate data-index/data-title if needed from global.css or HomePage.vue logic */
</style>
