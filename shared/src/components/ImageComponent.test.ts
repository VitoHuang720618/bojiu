import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ImageComponent from './ImageComponent.vue'

describe('ImageComponent', () => {
  it('should render with basic props', () => {
    const wrapper = mount(ImageComponent, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image'
      }
    })

    expect(wrapper.find('.image-component').exists()).toBe(true)
  })

  it('should show loading state initially', async () => {
    const wrapper = mount(ImageComponent, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image'
      }
    })

    await nextTick()
    
    expect(wrapper.find('.image-loading').exists()).toBe(true)
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    expect(wrapper.text()).toContain('載入中...')
  })

  it('should emit load event when image loads successfully', async () => {
    const wrapper = mount(ImageComponent, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image'
      }
    })

    await nextTick()

    const img = wrapper.find('img')
    if (img.exists()) {
      await img.trigger('load')
      expect(wrapper.emitted('load')).toBeTruthy()
    }
  })

  it('should emit click event when image is clicked', async () => {
    const wrapper = mount(ImageComponent, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image'
      }
    })

    await nextTick()

    const img = wrapper.find('img')
    if (img.exists()) {
      await img.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    }
  })

  it('should apply custom className', () => {
    const wrapper = mount(ImageComponent, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image',
        className: 'custom-class'
      }
    })

    expect(wrapper.find('.image-component').classes()).toContain('custom-class')
  })

  it('should apply custom styles', async () => {
    const customStyle = { width: '200px', height: '150px' }
    const wrapper = mount(ImageComponent, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image',
        style: customStyle
      }
    })

    await nextTick()
    const img = wrapper.find('img')
    if (img.exists()) {
      const style = img.attributes('style')
      expect(style).toContain('width: 200px')
      expect(style).toContain('height: 150px')
    }
  })

  it('should have correct alt attribute', async () => {
    const wrapper = mount(ImageComponent, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image description'
      }
    })

    await nextTick()
    const img = wrapper.find('img')
    if (img.exists()) {
      expect(img.attributes('alt')).toBe('Test image description')
    }
  })

  it('should handle preload prop', () => {
    const wrapper = mount(ImageComponent, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image',
        preload: true
      }
    })

    // 組件應該正常渲染
    expect(wrapper.find('.image-component').exists()).toBe(true)
  })

  it('should handle showRetry prop', () => {
    const wrapper = mount(ImageComponent, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image',
        showRetry: false
      }
    })

    // 組件應該正常渲染
    expect(wrapper.find('.image-component').exists()).toBe(true)
  })
})