<script setup lang="ts">
import ImageComponent from './ImageComponent.vue'

interface ImageButtonProps {
  defaultSrc: string
  hoverSrc: string
  alt: string
  href?: string
  target?: string
  dataIndex?: string | number
  dataTitle?: string
}

withDefaults(defineProps<ImageButtonProps>(), {
  target: '_blank'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<template>
  <a v-if="href" :href="href" :target="target" :rel="target === '_blank' ? 'noopener noreferrer' : undefined"
    class="img-button" :data-index="dataIndex" :data-title="dataTitle" @click="handleClick">
    <ImageComponent :src="defaultSrc" :alt="alt" class="img-button--default" />
    <ImageComponent :src="hoverSrc" :alt="alt" class="img-button--hover" />
  </a>
  <div v-else class="img-button" :data-index="dataIndex" :data-title="dataTitle" @click="handleClick">
    <ImageComponent :src="defaultSrc" :alt="alt" class="img-button--default" />
    <ImageComponent :src="hoverSrc" :alt="alt" class="img-button--hover" />
  </div>
</template>

<style scoped>
.img-button {
  display: block;
  position: relative;
  cursor: pointer;
}

.img-button img {
  display: block;
  width: 100%;
}

.img-button .img-button--default {
  opacity: 1;
  transition: opacity 0.1s ease-in-out;
}

.img-button .img-button--hover {
  left: 0;
  opacity: 0;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  transition: opacity 0.1s ease-in-out;
}

.img-button:hover .img-button--default {
  opacity: 0;
}

.img-button:hover .img-button--hover {
  opacity: 1;
}
</style>
