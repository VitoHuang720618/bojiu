<template>
    <div class="layout-config-panel">
        <div class="section-card">
            <div class="card-header">
                <h3>首頁區塊排序</h3>
                <p class="subtitle">拖拽以下區塊來更改 Demo 首頁的顯示順序</p>
            </div>
            <div class="card-body">
                <draggable v-model="localPageLayout" item-key="id" class="draggable-list" ghost-class="ghost"
                    @change="onLayoutChange">
                    <template #item="{ element }">
                        <div class="drag-item">
                            <div class="drag-handle">⠿</div>
                            <div class="item-content">
                                <span class="item-icon">{{ getIcon(element) }}</span>
                                <span class="item-label">{{ getLabel(element) }}</span>
                            </div>
                        </div>
                    </template>
                </draggable>
            </div>
        </div>

        <div class="section-card mt-4">
            <div class="card-header">
                <h3>節目區塊內部排序</h3>
                <p class="subtitle">調整「娛樂直播」與「賽事精選」在頁面中的順序</p>
            </div>
            <div class="card-body">
                <draggable v-model="localProgrammeLayout" item-key="id" class="draggable-list" ghost-class="ghost"
                    @change="onLayoutChange">
                    <template #item="{ element }">
                        <div class="drag-item secondary">
                            <div class="drag-handle">⠿</div>
                            <div class="item-content">
                                <span class="item-icon">{{ getIcon(element) }}</span>
                                <span class="item-label">{{ getLabel(element) }}</span>
                            </div>
                        </div>
                    </template>
                </draggable>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps<{
    pageLayout: string[]
    programmeLayout: string[]
}>()

const emit = defineEmits<{
    (e: 'update:pageLayout', val: string[]): void
    (e: 'update:programmeLayout', val: string[]): void
    (e: 'change'): void
}>()

const localPageLayout = ref([...props.pageLayout])
const localProgrammeLayout = ref([...props.programmeLayout])

// 同步 props 變更
watch(() => props.pageLayout, (newVal) => {
    localPageLayout.value = [...newVal]
}, { deep: true })

watch(() => props.programmeLayout, (newVal) => {
    localProgrammeLayout.value = [...newVal]
}, { deep: true })

const onLayoutChange = () => {
    emit('update:pageLayout', localPageLayout.value)
    emit('update:programmeLayout', localProgrammeLayout.value)
    emit('change')
}

const getLabel = (id: string) => {
    const labels: Record<string, string> = {
        'banner': '頂部橫幅 (Banner)',
        'buttonLinks': '頂部連結按鈕',
        'recommend': '推薦線路與瀏覽器',
        'programme': '節目與視頻區塊 (容器)',
        'floatAd': '浮動廣告',
        'footer': '頁尾資訊',
        'selectedVideos': '娛樂直播 (精選短視頻)',
        'hotPrograms': '賽事精選 (火熱預告)'
    }
    return labels[id] || id
}

const getIcon = (id: string) => {
    const icons: Record<string, string> = {
        'banner': '🖼️',
        'buttonLinks': '🔗',
        'recommend': '🛣️',
        'programme': '📦',
        'floatAd': '📢',
        'footer': '🏁',
        'selectedVideos': '🎬',
        'hotPrograms': '🏆'
    }
    return icons[id] || '📄'
}
</script>

<style scoped>
.layout-config-panel {
    max-width: 800px;
}

.section-card {
    background: #fff;
    border-radius: 12px;
    border: 1px solid #eef0f2;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.card-header {
    background: #fcfdfe;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #eef0f2;
}

.card-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
}

.subtitle {
    margin: 0.25rem 0 0 0;
    font-size: 0.85rem;
    color: #666;
}

.card-body {
    padding: 1.5rem;
}

.draggable-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.drag-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    cursor: grab;
    transition: all 0.2s;
}

.drag-item:hover {
    background: #fff;
    border-color: #007bff;
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.1);
}

.drag-item.secondary {
    background: #f0f7ff;
    border-color: #cfe2ff;
}

.drag-handle {
    color: #adb5bd;
    margin-right: 15px;
    font-size: 1.2rem;
    user-select: none;
}

.item-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.item-icon {
    font-size: 1.2rem;
}

.item-label {
    font-weight: 500;
    color: #495057;
}

.ghost {
    opacity: 0.5;
    background: #c8e6c9 !important;
    border-color: #4caf50 !important;
}

.mt-4 {
    margin-top: 2rem;
}
</style>
