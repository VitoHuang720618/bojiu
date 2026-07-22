<template>
    <div class="config-panel">
        <div class="panel-header">
            <h3>背景圖設置</h3>
            <p class="subtitle">設定全站的背景圖片或底紋</p>
        </div>

        <div class="form-group">
            <div class="uploader-container background-uploader">
                <ImageUploader :preview-url="backgroundImage ? getImageUrl(backgroundImage) : ''"
                    alt-text="Background" placeholder="點擊上傳背景圖" @upload="handleUpload" @clear="$emit('clear')" />
            </div>
        </div>

        <div class="settings-card">
            <div class="setting-row">
                <div>
                    <label>背景顯示方式</label>
                    <p>平鋪適合小型底紋；單張背景圖可選完整顯示或等比適應寬度。</p>
                </div>
                <div class="mode-buttons">
                    <button type="button" :class="{ active: backgroundSettings.displayMode === 'repeat' }"
                        @click="updateSettings({ displayMode: 'repeat' })">平鋪重複</button>
                    <button type="button" :class="{ active: backgroundSettings.displayMode === 'contain' }"
                        @click="updateSettings({ displayMode: 'contain' })">完整顯示</button>
                    <button type="button" :class="{ active: backgroundSettings.displayMode === 'fit-width' }"
                        @click="updateSettings({ displayMode: 'fit-width' })">適應寬度</button>
                </div>
            </div>

            <div class="setting-row">
                <div>
                    <label>上框線</label>
                    <p>位於主內容區最上方。</p>
                </div>
                <label class="toggle-control">
                    <input type="checkbox" :checked="backgroundSettings.topBorderEnabled"
                        @change="updateSettings({ topBorderEnabled: ($event.target as HTMLInputElement).checked })" />
                    <span>顯示上框線</span>
                </label>
            </div>

            <div v-if="backgroundSettings.topBorderEnabled" class="setting-row border-color-row">
                <label>上框線顏色</label>
                <ColorInput :model-value="backgroundSettings.topBorderColor"
                    @update:model-value="updateSettings({ topBorderColor: $event })" />
            </div>
            <div v-if="backgroundSettings.topBorderEnabled" class="setting-row border-color-row">
                <label for="top-border-width">上框線粗細</label>
                <div class="width-control">
                    <input id="top-border-width" type="number" min="0" max="20" step="1"
                        :value="backgroundSettings.topBorderWidth"
                        @input="updateSettings({ topBorderWidth: Math.min(20, Math.max(0, Number(($event.target as HTMLInputElement).value) || 0)) })" />
                    <span>px</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ImageUploader from '../common/ImageUploader.vue'
import ColorInput from '../common/ColorInput.vue'
import type { BackgroundSettingsConfig } from '../../services/configService'

const props = defineProps<{
    backgroundImage: string | undefined
    backgroundSettings: BackgroundSettingsConfig
    getImageUrl: (path: string) => string
}>()

const emit = defineEmits<{
    (e: 'upload', event: Event): void
    (e: 'clear'): void
    (e: 'update:backgroundSettings', value: BackgroundSettingsConfig): void
}>()

const handleUpload = (file: File) => {
    emit('upload', { target: { files: [file] } } as unknown as Event)
}

const updateSettings = (updates: Partial<BackgroundSettingsConfig>) => {
    emit('update:backgroundSettings', { ...props.backgroundSettings, ...updates })
}
</script>

<style scoped>
.panel-header {
    margin-bottom: 2rem;
}

.subtitle {
    font-size: 0.9rem;
    color: #666;
    margin: 0.25rem 0 0 0;
}

.background-uploader {
    width: 100%;
    max-width: 600px;
    height: 300px;
    border-radius: 12px;
    overflow: hidden;
}

.settings-card {
    max-width: 600px;
    margin-top: 1.5rem;
    padding: 1.25rem;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #f8fafc;
}

.setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.9rem 0;
    border-bottom: 1px solid #e2e8f0;
}

.setting-row:first-child { padding-top: 0; }
.setting-row:last-child { padding-bottom: 0; border-bottom: 0; }
.setting-row label { font-weight: 600; color: #334155; }
.setting-row p { margin: 0.25rem 0 0; font-size: 0.8rem; color: #64748b; }

.mode-buttons { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: flex-end; }
.mode-buttons button { border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.45rem 0.75rem; background: #fff; color: #475569; cursor: pointer; }
.mode-buttons button.active { border-color: #2563eb; background: #eff6ff; color: #1d4ed8; }
.toggle-control { display: flex; align-items: center; gap: 0.5rem; white-space: nowrap; }
.border-color-row { align-items: center; }
.width-control { display: flex; align-items: center; gap: 0.5rem; color: #64748b; }
.width-control input { width: 72px; padding: 0.45rem 0.55rem; border: 1px solid #cbd5e1; border-radius: 6px; }

@media (max-width: 640px) {
    .setting-row { align-items: flex-start; flex-direction: column; }
    .mode-buttons { justify-content: flex-start; }
}

/* 舊有的樣式已由 ImageUploader 內部管理 */
</style>
