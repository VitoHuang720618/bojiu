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
@import "/src/assets/styles/components/ImageButton.css";
</style>
