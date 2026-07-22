<template>
    <div class="config-panel">
        <div class="panel-header">
            <h3>基本設置</h3>
            <p class="subtitle">管理網站的全局基本配置項目</p>
        </div>

        <!-- Logo 設置 -->
        <div class="form-section">
            <div class="section-title">
                <h4>網站 Logo</h4>
                <p>顯示在頁面頂部的品牌標誌</p>
            </div>

            <div class="uploader-container logo-uploader">
                <ImageUploader :preview-url="logo ? getImageUrl(logo) : ''" alt-text="Logo" placeholder="點擊上傳 Logo"
                    @upload="(file) => handleUpload(file, 'logo')" @clear="$emit('clear', 'logo')" />
            </div>
        </div>


        <!-- Header 樣式設置 (Pro Designer Mode) -->
        <div class="form-section designer-section">
            <div class="section-title">
                <h4>頁首 (Header) 專業設計工具</h4>
                <p>參照設計稿欄位進行填寫，前端將自動生成對應效果</p>
            </div>

            <div class="designer-card">
                <!-- 幾何與佈局 -->
                <div class="designer-group">
                    <div class="group-header">📏 幾何與佈局</div>
                    <div class="controls-grid">
                        <div class="field-item">
                            <label>高度 (H)</label>
                            <div class="input-with-unit">
                                <input type="number" :value="headerStyles.height"
                                    @input="updateHeaderStyle({ height: Number(($event.target as HTMLInputElement).value) })" />
                                <span>px</span>
                            </div>
                        </div>
                        <div class="field-item">
                            <label>不透明度 (Opacity)</label>
                            <div class="input-with-unit">
                                <input type="number" step="0.1" min="0" max="1" :value="headerStyles.opacity"
                                    @input="updateHeaderStyle({ opacity: Number(($event.target as HTMLInputElement).value) })" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 背景填充 -->
                <div class="designer-group">
                    <div class="group-header">🎨 背景填充 (Fill)</div>
                    <div class="mode-selector">
                        <button class="mode-btn" :class="{ active: headerStyles.backgroundMode === 'solid' }"
                            @click="setHeaderBackgroundMode('solid')">純色</button>
                        <button class="mode-btn" :class="{ active: headerStyles.backgroundMode === 'gradient' }"
                            @click="setHeaderBackgroundMode('gradient')">線性漸層</button>
                    </div>

                    <!-- 純色模式 -->
                    <div v-if="headerStyles.backgroundMode === 'solid'" class="controls-grid single-row">
                        <div class="field-item">
                            <label>顏色</label>
                            <ColorInput :model-value="headerStyles.solidColor"
                                @update:model-value="updateHeaderStyle({ solidColor: $event })" />
                        </div>
                    </div>

                    <!-- 漸層模式 -->
                    <div v-else class="controls-grid">
                        <div class="field-item">
                            <label>起始色 (C1)</label>
                            <ColorInput :model-value="headerStyles.gradient.color1"
                                @update:model-value="updateHeaderStyle({ gradient: { ...headerStyles.gradient, color1: $event } })" />
                        </div>
                        <div class="field-item">
                            <label>結束色 (C2)</label>
                            <ColorInput :model-value="headerStyles.gradient.color2"
                                @update:model-value="updateHeaderStyle({ gradient: { ...headerStyles.gradient, color2: $event } })" />
                        </div>
                        <div class="field-item">
                            <label>角度 (Angle)</label>
                            <div class="input-with-unit">
                                <input type="number" :value="headerStyles.gradient.angle"
                                    @input="updateHeaderStyle({ gradient: { ...headerStyles.gradient, angle: Number(($event.target as HTMLInputElement).value) } })" />
                                <span>deg</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 預覽區域 -->
                <div class="designer-preview-section">
                    <div class="preview-title">即時預覽 (Live Preview)</div>
                    <div class="checkerboard-bg">
                        <div class="preview-element" :style="headerPreviewStyle"></div>
                    </div>
                </div>
            </div>

        </div>

        <!-- 推薦區域 樣式設置 (Pro Designer Mode) -->
        <div class="form-section designer-section">
            <div class="section-title">
                <h4>推薦區域 專業設計工具</h4>
                <p>設定推薦內容區塊的背景與陰影</p>
            </div>

            <div class="designer-card">
                <!-- 幾何與佈局 -->
                <div class="designer-group">
                    <div class="group-header">📏 幾何與佈局</div>
                    <div class="controls-grid">
                        <div class="field-item">
                            <label>高度 (H)</label>
                            <div class="input-with-unit">
                                <input type="number" :value="recommendStyles.height"
                                    @input="updateRecommendStyle({ height: Number(($event.target as HTMLInputElement).value) })" />
                                <span>px</span>
                            </div>
                        </div>
                        <div class="field-item">
                            <label>不透明度 (Opacity)</label>
                            <div class="input-with-unit">
                                <input type="number" step="0.1" min="0" max="1" :value="recommendStyles.opacity"
                                    @input="updateRecommendStyle({ opacity: Number(($event.target as HTMLInputElement).value) })" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 背景填充 -->
                <div class="designer-group">
                    <div class="group-header">🎨 背景填充 (Fill)</div>
                    <div class="mode-selector">
                        <button class="mode-btn" :class="{ active: recommendStyles.backgroundMode === 'solid' }"
                            @click="setRecommendBackgroundMode('solid')">純色</button>
                        <button class="mode-btn" :class="{ active: recommendStyles.backgroundMode === 'gradient' }"
                            @click="setRecommendBackgroundMode('gradient')">線性漸層</button>
                    </div>

                    <div v-if="recommendStyles.backgroundMode === 'solid'" class="controls-grid single-row">
                        <div class="field-item">
                            <label>顏色</label>
                            <ColorInput :model-value="recommendStyles.solidColor"
                                @update:model-value="updateRecommendStyle({ solidColor: $event })" />
                        </div>
                    </div>
                    <div v-else class="controls-grid">
                        <div class="field-item">
                            <label>起始色</label>
                            <ColorInput :model-value="recommendStyles.gradient.color1"
                                @update:model-value="updateRecommendStyle({ gradient: { ...recommendStyles.gradient, color1: $event } })" />
                        </div>
                        <div class="field-item">
                            <label>結束色</label>
                            <ColorInput :model-value="recommendStyles.gradient.color2"
                                @update:model-value="updateRecommendStyle({ gradient: { ...recommendStyles.gradient, color2: $event } })" />
                        </div>
                        <div class="field-item">
                            <label>角度</label>
                            <input type="number" :value="recommendStyles.gradient.angle"
                                @input="updateRecommendStyle({ gradient: { ...recommendStyles.gradient, angle: Number(($event.target as HTMLInputElement).value) } })" />
                        </div>
                    </div>
                </div>

                <!-- 預覽區域 -->
                <div class="designer-preview-section">
                    <div class="preview-title">即時預覽 (Live Preview)</div>
                    <div class="checkerboard-bg">
                        <div class="preview-element recommend-preview" :style="recommendPreviewStyle"></div>
                    </div>
                </div>
            </div>

        </div>

        <!-- 推薦工具列色彩設置 -->
        <div class="form-section designer-section">
            <div class="section-title">
                <h4>推薦工具列色彩設定</h4>
                <p>設定推薦工具列的底色與滑過底色</p>
            </div>

            <div class="designer-card">
                <div class="designer-group">
                    <div class="group-header">🎨 推薦工具列色彩</div>
                    <div class="controls-grid">
                        <div class="field-item">
                            <label>推薦工具左側底色</label>
                            <ColorInput :model-value="sectionColors.recommendFooterTitleBackground"
                                @update:model-value="updateSectionColors({ recommendFooterTitleBackground: $event })" />
                        </div>
                        <div class="field-item">
                            <label>推薦工具底色</label>
                            <ColorInput :model-value="sectionColors.recommendFooterItemBackground"
                                @update:model-value="updateSectionColors({ recommendFooterItemBackground: $event })" />
                        </div>
                        <div class="field-item">
                            <label>推薦工具 Hover 底色</label>
                            <ColorInput :model-value="sectionColors.recommendFooterItemHoverBackground"
                                @update:model-value="updateSectionColors({ recommendFooterItemHoverBackground: $event })" />
                        </div>
                        <div class="field-item">
                            <label>推薦工具上框線顏色</label>
                            <ColorInput :model-value="sectionColors.recommendFooterTopBorderColor"
                                @update:model-value="updateSectionColors({ recommendFooterTopBorderColor: $event })" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 標題圖片設置 -->
        <div class="form-section">
            <div class="section-title">
                <h4>標題圖片設定</h4>
                <p>設定各區塊標題所使用的圖示圖片</p>
            </div>

            <div class="title-images-grid">
                <div class="title-image-card is-disabled" title="此圖片目前固定使用，不提供修改">
                    <label>推薦優質線路標題（固定）</label>
                    <div class="uploader-container title-uploader">
                        <ImageUploader :preview-url="titles.recommendedRoutes ? getImageUrl(titles.recommendedRoutes) : ''"
                            placeholder="固定圖示" disabled />
                    </div>
                </div>

                <div class="title-image-card is-disabled" title="此圖片目前固定使用，不提供修改">
                    <label>推薦瀏覽器標題（固定）</label>
                    <div class="uploader-container title-uploader">
                        <ImageUploader :preview-url="titles.recommendedBrowsers ? getImageUrl(titles.recommendedBrowsers) : ''"
                            placeholder="固定圖示" disabled />
                    </div>
                </div>

                <div class="title-image-card">
                    <label>左側影片區標題</label>
                    <div class="uploader-container title-uploader">
                        <ImageUploader :preview-url="titles.selectedVideos ? getImageUrl(titles.selectedVideos) : ''"
                            placeholder="上傳標題圖片" @upload="(file) => handleTitleUpload(file, 'selectedVideos')"
                            @clear="$emit('clearTitleImage', 'selectedVideos')" />
                    </div>
                </div>

                <div class="title-image-card">
                    <label>右側影片區標題</label>
                    <div class="uploader-container title-uploader">
                        <ImageUploader :preview-url="titles.hotPrograms ? getImageUrl(titles.hotPrograms) : ''"
                            placeholder="上傳標題圖片" @upload="(file) => handleTitleUpload(file, 'hotPrograms')"
                            @clear="$emit('clearTitleImage', 'hotPrograms')" />
                    </div>
                </div>
            </div>
        </div>

        <!-- 影片縮圖色彩設定 -->
        <div class="form-section designer-section">
            <div class="section-title">
                <h4>影片縮圖底色</h4>
                <p>設定娛樂直播與賽事精選影片縮圖的底色與框線顏色</p>
            </div>

            <div class="designer-card">
                <div class="designer-group">
                    <div class="group-header">🎨 影片縮圖色彩</div>
                    <div class="controls-grid">
                        <div class="field-item">
                            <label>影片縮圖底色</label>
                            <ColorInput :model-value="sectionColors.thumbnailTitleBackground"
                                @update:model-value="updateSectionColors({ thumbnailTitleBackground: $event })" />
                        </div>
                        <div class="field-item">
                            <label>影片縮圖框線顏色</label>
                            <ColorInput :model-value="sectionColors.thumbnailBorderColor"
                                @update:model-value="updateSectionColors({ thumbnailBorderColor: $event })" />
                        </div>
                        <div class="field-item">
                            <label>影片縮圖文字顏色</label>
                            <ColorInput :model-value="sectionColors.thumbnailTextColor"
                                @update:model-value="updateSectionColors({ thumbnailTextColor: $event })" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 頁尾色彩設定 -->
        <div class="form-section designer-section">
            <div class="section-title">
                <h4>頁尾色彩設定</h4>
                <p>設定最底部 Copyright 區域的背景底色</p>
            </div>

            <div class="designer-card">
                <div class="designer-group">
                    <div class="group-header">🎨 頁尾底色</div>
                    <div class="controls-grid single-row">
                        <div class="field-item">
                            <label>背景色</label>
                            <ColorInput :model-value="sectionColors.footerBackground"
                                @update:model-value="updateSectionColors({ footerBackground: $event })" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ImageUploader from '../common/ImageUploader.vue'
import ColorInput from '../common/ColorInput.vue'
import { SectionColorsConfig, VisualStylesConfig } from '../../services/configService'

const props = defineProps<{
    logo: string | undefined
    headerStyles: VisualStylesConfig
    recommendStyles: VisualStylesConfig
    sectionColors: SectionColorsConfig
    titles: {
        recommendedRoutes: string
        recommendedBrowsers: string
        selectedVideos: string
        hotPrograms: string
    }
    getImageUrl: (path: string) => string
}>()

const emit = defineEmits<{
    (e: 'upload', event: Event, field: string): void
    (e: 'clear', field: string): void
    (e: 'update:headerStyles', value: VisualStylesConfig): void
    (e: 'update:recommendStyles', value: VisualStylesConfig): void
    (e: 'update:sectionColors', value: SectionColorsConfig): void
    (e: 'uploadTitleImage', event: Event, field: string): void
    (e: 'clearTitleImage', field: string): void
}>()

const handleUpload = (file: File, field: string) => {
    emit('upload', { target: { files: [file] } } as unknown as Event, field)
}

const handleTitleUpload = (file: File, field: string) => {
    emit('uploadTitleImage', { target: { files: [file] } } as unknown as Event, field)
}

// 通用樣式更新函式
const updateHeaderStyle = (updates: Partial<VisualStylesConfig>) => {
    emit('update:headerStyles', { ...props.headerStyles, ...updates })
}

const updateRecommendStyle = (updates: Partial<VisualStylesConfig>) => {
    emit('update:recommendStyles', { ...props.recommendStyles, ...updates })
}

const setHeaderBackgroundMode = (backgroundMode: VisualStylesConfig['backgroundMode']) => {
    if (props.headerStyles.backgroundMode !== backgroundMode) {
        updateHeaderStyle({ backgroundMode })
    }
}

const setRecommendBackgroundMode = (backgroundMode: VisualStylesConfig['backgroundMode']) => {
    if (props.recommendStyles.backgroundMode !== backgroundMode) {
        updateRecommendStyle({ backgroundMode })
    }
}

const updateSectionColors = (updates: Partial<SectionColorsConfig>) => {
    emit('update:sectionColors', { ...props.sectionColors, ...updates })
}

// 輔助函式：將 Hex + Opacity 轉為 RGBA
const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

// 生成預覽樣式
const getPreviewStyle = (config: VisualStylesConfig) => {
    let background = ''
    if (config.backgroundMode === 'solid') {
        background = hexToRgba(config.solidColor, config.opacity)
    } else {
        background = `linear-gradient(${config.gradient.angle}deg, ${config.gradient.color1} 0%, ${config.gradient.color2} 100%)`
    }

    return {
        background,
        // 預覽採固定畫布高度，避免 Header 與推薦區塊因實際高度設定不同而難以比較色彩效果。
        height: '96px'
    }
}

const headerPreviewStyle = computed(() => getPreviewStyle(props.headerStyles))
const recommendPreviewStyle = computed(() => getPreviewStyle(props.recommendStyles))
</script>

<style scoped>
.designer-section {
    max-width: 800px !important;
}

.designer-card {
    background: #fdfdfe;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.designer-group {
    background: #fff;
    border: 1px solid #f1f5f9;
    border-radius: 10px;
    padding: 1.2rem;
}

.group-header {
    font-size: 0.9rem;
    font-weight: 700;
    color: #475569;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.group-header input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

.controls-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
}

.controls-grid.single-row {
    grid-template-columns: 1fr 1fr;
}

.field-item {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.field-item label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
}

.field-item input[type="number"],
.field-item input[type="text"],
.field-item select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 0.85rem;
    outline: none;
    transition: border-color 0.2s;
}

.field-item input:focus {
    border-color: #3b82f6;
}

.field-item input[type="color"] {
    width: 100%;
    height: 36px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    cursor: pointer;
    background: #fff;
    padding: 2px;
}

.input-with-unit {
    position: relative;
    display: flex;
    align-items: center;
}

.input-with-unit input {
    padding-right: 30px !important;
}

.input-with-unit span {
    position: absolute;
    right: 8px;
    font-size: 0.7rem;
    color: #94a3b8;
    pointer-events: none;
}

.mode-selector {
    display: flex;
    background: #f1f5f9;
    padding: 4px;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.mode-btn {
    flex: 1;
    padding: 6px 12px;
    border: none;
    background: transparent;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
}

.mode-btn.active {
    background: #fff;
    color: #0f172a;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.designer-preview-section {
    margin-top: 1rem;
}

.preview-title {
    font-size: 0.8rem;
    font-weight: 700;
    color: #475569;
    margin-bottom: 0.8rem;
}

.checkerboard-bg {
    width: 100%;
    min-height: 120px;
    background-image: 
        linear-gradient(45deg, #f1f5f9 25%, transparent 25%),
        linear-gradient(-45deg, #f1f5f9 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #f1f5f9 75%),
        linear-gradient(-45deg, transparent 75%, #f1f5f9 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border: 1px solid #e2e8f0;
}

.preview-element {
    width: 100%;
    max-width: 600px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
}

.recommend-preview {
    max-width: 600px;
    min-height: 40px;
    border-radius: 4px;
}

.form-section {
    background: #fff;
    border: 1px solid #eef0f2;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.logo-uploader {
    width: 240px;
    height: 120px;
}

.title-uploader {
    width: 100%;
    height: 80px;
}

.title-images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
}

.title-image-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    background: #f8fafc;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #f1f5f9;
}

.title-image-card label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #475569;
}

/* 移除舊有的 preview 樣式，統一由 ImageUploader 處理 */

.css-editor-card {
    background: #f8fafc;
    border-radius: 10px;
    padding: 1.2rem;
    border: 1px solid #e2e8f0;
}

.css-textarea {
    width: 100%;
    height: 150px;
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 0.9rem;
    padding: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #fff;
    resize: vertical;
    outline: none;
}

.mt-4 { margin-top: 1.5rem; }
.mb-2 { margin-bottom: 0.5rem; }
.d-block { display: block; }

.btn-danger {
    background: #ef4444;
    color: #fff;
    border: none;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
}
</style>
