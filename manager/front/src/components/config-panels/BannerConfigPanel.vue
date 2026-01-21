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
                <div class="image-upload">
                    <img v-if="getBannerUrl('pc')" :src="getImageUrl(getBannerUrl('pc'))" alt="PC Banner"
                        class="preview-img" />
                    <div v-else class="placeholder">未設置</div>
                    <input type="file" @change="(e) => $emit('upload', e, 'pc')" accept="image/*" class="file-input" />
                    <div class="slot-actions">

                        <button @click="$emit('clear', 'pc')" class="btn btn-danger btn-sm">清除</button>
                    </div>
                </div>
            </div>

            <!-- Tablet Banner -->
            <div class="banner-slot">
                <label>平板版 (Tablet)</label>
                <div class="image-upload">
                    <img v-if="getBannerUrl('tablet')" :src="getImageUrl(getBannerUrl('tablet'))" alt="Tablet Banner"
                        class="preview-img" />
                    <div v-else class="placeholder">未設置</div>
                    <input type="file" @change="(e) => $emit('upload', e, 'tablet')" accept="image/*"
                        class="file-input" />
                    <div class="slot-actions">

                        <button @click="$emit('clear', 'tablet')" class="btn btn-danger btn-sm">清除</button>
                    </div>
                </div>
            </div>

            <!-- Mobile Banner -->
            <div class="banner-slot">
                <label>手機版 (Mobile)</label>
                <div class="image-upload">
                    <img v-if="getBannerUrl('mobile')" :src="getImageUrl(getBannerUrl('mobile'))" alt="Mobile Banner"
                        class="preview-img" />
                    <div v-else class="placeholder">未設置</div>
                    <input type="file" @change="(e) => $emit('upload', e, 'mobile')" accept="image/*"
                        class="file-input" />
                    <div class="slot-actions">

                        <button @click="$emit('clear', 'mobile')" class="btn btn-danger btn-sm">清除</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { BannerConfig } from '../../services/configService'

const props = defineProps<{
    banner: string | BannerConfig | undefined
    getImageUrl: (path: string) => string
}>()

const emit = defineEmits<{
    (e: 'upload', event: Event, device: 'pc' | 'tablet' | 'mobile'): void
    (e: 'clear', device: 'pc' | 'tablet' | 'mobile'): void
}>()

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

.image-upload {
    border: 2px dashed #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    position: relative;
    background: #fdfdfd;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 180px;
}

.image-upload:hover {
    border-color: #3498db;
    background: #f0f7ff;
}

.preview-img {
    max-width: 100%;
    max-height: 250px; /* 增加高度限制，讓圖片更清晰 */
    height: auto;
    object-fit: contain;
    margin-bottom: 15px;
    border-radius: 4px;
}

.placeholder {
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    background: #f5f5f5;
    border-radius: 4px;
    margin-bottom: 15px;
    font-size: 14px;
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

.slot-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
    position: relative;
    z-index: 2;
    margin-top: auto;
}




.btn-sm {
    padding: 4px 12px;
    font-size: 12px;
}
</style>
