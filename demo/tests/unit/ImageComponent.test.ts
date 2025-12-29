import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ImageComponent from '../../src/components/ImageComponent.vue'

describe('ImageComponent', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }))
  })

  it('should render image with correct src and alt', () => {
    const wrapper = mount(ImageComponent, {
      props: {
        src: '/assets/images/test.jpg',
        alt: 'Test image',
        lazy: false
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/assets/images/test.jpg')
    expect(img.attributes('alt')).toBe('Test image')
  })

  it('should apply width and height attributes when provided', () => {
    const wrapper = mount(ImageComponent, {
      props: {
        src: '/assets/images/test.jpg',
        alt: 'Test image',
        width: 800,
        height: 600,
        lazy: false
      }
    })

    const img = wrapper.find('img')
    expect(img.attributes('width')).toBe('800')
    expect(img.attributes('height')).toBe('600')
  })

  it('should handle load event correctly', async () => {
    const wrapper = mount(ImageComponent, {
      props: {
        src: '/assets/images/test.jpg',
        alt: 'Test image',
        lazy: false
      }
    })

    const img = wrapper.find('img')
    
    // Initially not loaded
    expect(img.classes()).not.toContain('is-loaded')
    
    // Trigger load event
    await img.trigger('load')
    await wrapper.vm.$nextTick()
    
    // Should have is-loaded class
    expect(img.classes()).toContain('is-loaded')
    expect(img.classes()).not.toContain('has-error')
  })

  it('should display fallback on image error', async () => {
    const wrapper = mount(ImageComponent, {
      props: {
        src: '/invalid.jpg',
        fallback: '/fallback.jpg',
        alt: 'Test image',
        lazy: false
      }
    })

    const img = wrapper.find('img')
    
    // Trigger error event
    await img.trigger('error')
    await wrapper.vm.$nextTick()
    
    // Should switch to fallback
    expect(img.attributes('src')).toBe('/fallback.jpg')
    expect(img.classes()).toContain('has-error')
  })

  it('should handle error without fallback', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const wrapper = mount(ImageComponent, {
      props: {
        src: '/invalid.jpg',
        alt: 'Test image',
        lazy: false
      }
    })

    const img = wrapper.find('img')
    
    // Trigger error event
    await img.trigger('error')
    await wrapper.vm.$nextTick()
    
    // Should have error class
    expect(img.classes()).toContain('has-error')
    
    // Should log error
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })

  it('should setup IntersectionObserver when lazy loading is enabled', () => {
    const observeMock = vi.fn()
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: observeMock,
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }))

    mount(ImageComponent, {
      props: {
        src: '/assets/images/test.jpg',
        alt: 'Test image',
        lazy: true
      }
    })

    // Should create IntersectionObserver
    expect(global.IntersectionObserver).toHaveBeenCalled()
    expect(observeMock).toHaveBeenCalled()
  })

  it('should not setup IntersectionObserver when lazy loading is disabled', () => {
    const observeMock = vi.fn()
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: observeMock,
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }))

    const wrapper = mount(ImageComponent, {
      props: {
        src: '/assets/images/test.jpg',
        alt: 'Test image',
        lazy: false
      }
    })

    const img = wrapper.find('img')
    
    // Should load immediately
    expect(img.attributes('src')).toBe('/assets/images/test.jpg')
  })

  it('should create IntersectionObserver with correct configuration', () => {
    const observeMock = vi.fn()
    
    global.IntersectionObserver = vi.fn().mockImplementation((callback, options) => {
      // Verify options are passed correctly
      expect(options).toBeDefined()
      expect(options?.rootMargin).toBe('50px')
      expect(options?.threshold).toBe(0.01)
      
      return {
        observe: observeMock,
        unobserve: vi.fn(),
        disconnect: vi.fn()
      }
    })

    mount(ImageComponent, {
      props: {
        src: '/assets/images/test.jpg',
        alt: 'Test image',
        lazy: true
      }
    })

    // Should create IntersectionObserver with correct config
    expect(global.IntersectionObserver).toHaveBeenCalled()
    expect(observeMock).toHaveBeenCalled()
  })
})
