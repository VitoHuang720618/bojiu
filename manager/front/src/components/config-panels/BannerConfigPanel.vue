<template>
    <div class="config-panel">
        <div class="panel-header">
            <h3>Banner 設置</h3>
            <p class="subtitle">為不同裝置提供最佳化的顯示效果</p>
        </div>



        <div class="banner-grid">
            <!-- PC Banner -->
            <div class="banner-slot">
                <label>電腦版 (PC)</label>
                <div class="uploader-container pc">
                    <ImageUploader :preview-url="getBannerUrl('pc') ? getImageUrl(getBannerUrl('pc')) : ''"
                        placeholder="上傳 PC 版 Banner" dimensions="1920x500" @upload="(file) => handleUpload(file, 'pc')"
                        @clear="$emit('clear', 'pc')" />
                </div>
            </div>

            <!-- Tablet Banner -->
            <div class="banner-slot">
                <label>平板版 (Tablet)</label>
                <div class="uploader-container tablet">
                    <ImageUploader :preview-url="getBannerUrl('tablet') ? getImageUrl(getBannerUrl('tablet')) : ''"
                        placeholder="上傳平板版 Banner" dimensions="1024x400" @upload="(file) => handleUpload(file, 'tablet')"
                        @clear="$emit('clear', 'tablet')" />
                </div>
            </div>

            <!-- Mobile Banner -->
            <div class="banner-slot">
                <label>手機版 (Mobile)</label>
                <div class="uploader-container mobile">
                    <ImageUploader :preview-url="getBannerUrl('mobile') ? getImageUrl(getBannerUrl('mobile')) : ''"
                        placeholder="上傳手機版 Banner" dimensions="750x300" @upload="(file) => handleUpload(file, 'mobile')"
                        @clear="$emit('clear', 'mobile')" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ImageUploader from '../common/ImageUploader.vue'
import type { BannerConfig } from '../../services/configService'

const props = defineProps<{
    banner: string | BannerConfig | undefined
    getImageUrl: (path: string) => string
}>()

const emit = defineEmits<{
    (e: 'upload', event: Event, device: 'pc' | 'tablet' | 'mobile'): void
    (e: 'clear', device: 'pc' | 'tablet' | 'mobile'): void
}>()

const handleUpload = (file: File, device: 'pc' | 'tablet' | 'mobile') => {
    emit('upload', { target: { files: [file] } } as unknown as Event, device)
}

const getBannerUrl = (device: 'pc' | 'tablet' | 'mobile') => {
    if (!props.banner) return ''
    if (typeof props.banner === 'string') {
        return props.banner
    }
    return (props.banner as any)?.[device] || ''
}
</script>

<style scoped>
.banner-grid {
    display: flex;
    flex-direction: column;
    gap: 30px;
    margin-top: 20px;
}

.banner-slot {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    max-width: 600px; /* 限制最大寬度，避免過大 */
}

.banner-slot label {
    font-weight: 600;
    color: #555;
    font-size: 14px;
}

.uploader-container {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
}

.uploader-container.pc {
    height: 180px;
}

.uploader-container.tablet {
    height: 140px;
}

.uploader-container.mobile {
    height: 120px;
}




.btn-danger {
    background: #dc3545;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 0.4rem 1rem;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-danger:hover {
    background: #c82333;
}

.btn-sm {
    padding: 4px 12px;
    font-size: 12px;
}
</style>
