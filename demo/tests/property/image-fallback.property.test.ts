import { describe, it, expect, vi, beforeEach } from 'vitest'
import fc from 'fast-check'
import { mount } from '@vue/test-utils'
import ImageComponent from '../../src/components/ImageComponent.vue'

// Feature: b9-website-recreation, Property 3: Image fallback display
describe('Image Fallback Display Properties', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }))
  })
  it('should display fallback for any invalid image src', async () => {
    fc.assert(
      fc.asyncProperty(
        fc.string().filter(s => !s.startsWith('http') && s.length > 0),
        fc.webPath().filter(s => s.length > 0),
        fc.string(),
        async (invalidSrc, fallbackSrc, alt) => {
          const wrapper = mount(ImageComponent, {
            props: {
              src: `/invalid/${invalidSrc}`,
              fallback: fallbackSrc,
              alt,
              lazy: false
            }
          })
          
          const img = wrapper.find('img')
          
          // Trigger error event
          await img.trigger('error')
          await wrapper.vm.$nextTick()
          
          // After error, src should switch to fallback
          const currentSrc = img.attributes('src')
          expect(currentSrc).toBe(fallbackSrc)
          
          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should handle missing fallback gracefully', async () => {
    fc.assert(
      fc.asyncProperty(
        fc.string(),
        fc.string(),
        async (invalidSrc, alt) => {
          const wrapper = mount(ImageComponent, {
            props: {
              src: `/invalid/${invalidSrc}`,
              alt,
              lazy: false
            }
          })
          
          const img = wrapper.find('img')
          
          // Trigger error event
          await img.trigger('error')
          await wrapper.vm.$nextTick()
          
          // Component should still exist and have error class
          expect(img.exists()).toBe(true)
          expect(img.classes()).toContain('has-error')
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not use fallback for valid images', async () => {
    fc.assert(
      fc.asyncProperty(
        fc.webPath(),
        fc.webPath(),
        fc.string(),
        async (validSrc, fallbackSrc, alt) => {
          const wrapper = mount(ImageComponent, {
            props: {
              src: validSrc,
              fallback: fallbackSrc,
              alt,
              lazy: false
            }
          })
          
          const img = wrapper.find('img')
          
          // Trigger successful load
          await img.trigger('load')
          await wrapper.vm.$nextTick()
          
          // Should still use original src, not fallback
          const currentSrc = img.attributes('src')
          expect(currentSrc).toBe(validSrc)
          expect(img.classes()).toContain('is-loaded')
          expect(img.classes()).not.toContain('has-error')
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle fallback chain correctly', async () => {
    // Test that if fallback also fails, it doesn't loop infinitely
    fc.assert(
      fc.asyncProperty(
        fc.string(),
        fc.string(),
        fc.string(),
        async (invalidSrc, invalidFallback, alt) => {
          const wrapper = mount(ImageComponent, {
            props: {
              src: `/invalid/${invalidSrc}`,
              fallback: `/invalid/${invalidFallback}`,
              alt,
              lazy: false
            }
          })
          
          const img = wrapper.find('img')
          
          // Trigger first error
          await img.trigger('error')
          await wrapper.vm.$nextTick()
          
          // Should switch to fallback
          let currentSrc = img.attributes('src')
          expect(currentSrc).toBe(`/invalid/${invalidFallback}`)
          
          // Trigger second error on fallback
          await img.trigger('error')
          await wrapper.vm.$nextTick()
          
          // Should not change again (prevents infinite loop)
          currentSrc = img.attributes('src')
          expect(currentSrc).toBe(`/invalid/${invalidFallback}`)
          
          return true
        }
      ),
      { numRuns: 50 }
    )
  })
})
