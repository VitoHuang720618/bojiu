<template>
    <div v-if="show" class="cropper-modal-overlay">
        <div class="cropper-modal-content">
            <div class="cropper-header">
                <h3>裁切圖片 - {{ deviceLabel }}</h3>
                <button @click="close" class="close-btn">&times;</button>
            </div>

            <div class="cropper-container">
                <vue-cropper ref="cropper" :img="imageUrl" :outputSize="option.size" :outputType="option.outputType"
                    :info="true" :full="option.full" :canMove="option.canMove" :canMoveBox="option.canMoveBox"
                    :fixedBox="option.fixedBox" :original="option.original" :autoCrop="option.autoCrop"
                    :autoCropWidth="option.autoCropWidth" :autoCropHeight="option.autoCropHeight"
                    :centerBox="option.centerBox" :high="option.high" :fixed="isFixed" :fixedNumber="aspectRatio"
                    mode="cover"></vue-cropper>
            </div>

            <div class="cropper-footer">
                <div class="hint">建議比例: {{ ratioLabel }}</div>
                <div class="actions">
                    <button @click="close" class="btn btn-secondary">取消</button>
                    <button @click="finish" class="btn btn-primary" :disabled="processing">
                        {{ processing ? '處理中...' : '確認裁切' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import 'vue-cropper/dist/index.css'
import { VueCropper } from "vue-cropper"

const props = defineProps<{
    show: boolean
    imageUrl: string
    device: 'pc' | 'tablet' | 'mobile'
}>()

const emit = defineEmits(['close', 'confirm'])

const cropper = ref<any>(null)
const processing = ref(false)

const deviceLabel = computed(() => {
    switch (props.device) {
        case 'pc': return '電腦版'
        case 'tablet': return '平板版'
        case 'mobile': return '手機版'
        default: return ''
    }
})

const aspectRatio = computed(() => {
    switch (props.device) {
        case 'pc': return [1920, 500]
        case 'tablet':
        case 'mobile':
            // For mobile/tablet, we want initial box to be roughly the old ratio but NOT fixed
            return [1, 1]
        default: return [1, 1]
    }
})

const isFixed = computed(() => {
    // Only lock ratio for PC. Allow free crop (fitting) for mobile/tablet.
    return props.device === 'pc'
})

const ratioLabel = computed(() => {
    if (!isFixed.value) return '自由比例 (Free)'
    const [w, h] = aspectRatio.value
    return `${w} x ${h}`
})

const option = reactive({
    size: 1,
    full: true,
    outputType: 'png',
    canMove: true,
    fixedBox: false,
    original: false,
    canMoveBox: true,
    autoCrop: true,
    autoCropWidth: 400,
    autoCropHeight: 200,
    centerBox: true,
    high: true,
    cropData: {},
    enlarge: 1,
    mode: 'contain'
})

const close = () => {
    emit('close')
}

const finish = () => {
    if (!cropper.value) return

    processing.value = true
    cropper.value.getCropBlob((data: Blob) => {
        const file = new File([data], `banner-${props.device}.png`, { type: 'image/png' })
        emit('confirm', file)
        processing.value = false
    })
}
</script>

<style scoped>
.cropper-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.cropper-modal-content {
    background: white;
    width: 90%;
    max-width: 1000px;
    height: 85vh;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.cropper-header {
    padding: 1.25rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.cropper-header h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #333;
}

.close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    color: #999;
}

.cropper-container {
    flex: 1;
    background: #f8f8f8;
    padding: 20px;
}

.cropper-footer {
    padding: 1.25rem;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.hint {
    color: #666;
    font-size: 0.9rem;
}

.actions {
    display: flex;
    gap: 12px;
}

.btn {
    padding: 8px 24px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover {
    background: #0056b3;
}

.btn-secondary {
    background: #f0f0f0;
    color: #333;
}

.btn-secondary:hover {
    background: #e0e0e0;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
