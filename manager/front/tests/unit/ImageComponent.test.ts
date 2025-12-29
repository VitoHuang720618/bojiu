import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ImageComponent from '../../src/components/ImageComponent.vue'

describe('ImageComponent', () => {
  it('renders with required props', () => {
    const wrapper = mount(ImageComponent, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image'
      }
    })
    
    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.find('img').attributes('alt')).toBe('Test image')
  })

  it('applies lazy loading by default', () => {
    const wrapper = mount(ImageComponent, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image'
      }
    })
    
    // Initially should not have src when lazy loading
    expect(wrapper.find('img').attributes('src')).toBe('')
  })

  it('loads immediately when lazy is false', () => {
    const wrapper = mount(ImageComponent, {
      props: {
        src: '/test-image.jpg',
        alt: 'Test image',
        lazy: false
      }
    })
    
    expect(wrapper.find('img').attributes('src')).toBe('/test-image.jpg')
  })
})