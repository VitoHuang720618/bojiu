<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const isHexColor = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value)
const textValue = ref(props.modelValue || '')

watch(() => props.modelValue, (value) => {
  textValue.value = value || ''
})

const colorValue = computed(() => isHexColor(props.modelValue || '') ? props.modelValue : '#000000')

const commitTextValue = () => {
  const value = textValue.value.trim()
  if (isHexColor(value)) emit('update:modelValue', value)
  else textValue.value = props.modelValue || ''
}
</script>

<template>
  <div class="color-input">
    <input type="color" :value="colorValue" @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
    <input v-model="textValue" type="text" inputmode="text" maxlength="7" placeholder="#4d040d"
      aria-label="HEX 色碼" @blur="commitTextValue" @keyup.enter="commitTextValue" />
  </div>
</template>

<style scoped>
.color-input { display: flex; gap: 0.5rem; align-items: center; }
.color-input input[type='color'] { width: 42px; height: 32px; padding: 2px; cursor: pointer; }
.color-input input[type='text'] { width: 92px; padding: 0.45rem 0.55rem; border: 1px solid #cbd5e1; border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.8rem; text-transform: lowercase; }
</style>
