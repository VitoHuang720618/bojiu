<script setup lang="ts">
import ImageComponent from './ImageComponent.vue'

const props = withDefaults(defineProps<{
  defaultSrc: string
  hoverSrc: string
  alt?: string
  href?: string
  target?: string
  dataIndex?: number
  dataTitle?: string
  lazy?: boolean
}>(), {
  lazy: true
})

const handleClick = (e: MouseEvent) => {
  if (!props.href) {
    e.preventDefault()
  }
}
</script>

<template>
  <component :is="href ? 'a' : 'div'" class="img-button" :href="href" :target="href ? target : undefined"
    :rel="href && target === '_blank' ? 'noopener noreferrer' : undefined" :data-index="dataIndex"
    :data-title="dataTitle" @click="handleClick">
    <ImageComponent :src="defaultSrc" :alt="alt" class="img-button--default" :lazy="lazy" />
    <ImageComponent :src="hoverSrc" :alt="alt" class="img-button--hover" :lazy="lazy" />
  </component>
</template>

<style scoped>
.img-button {
  display: block;
  position: relative;
  cursor: pointer;
}

.img-button :deep(img) {
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
