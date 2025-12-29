import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { useImageLoader } from '../../src/composables/useImageLoader'

describe('useImageLoader property tests', () => {
  it('should handle various image URLs', () => {
    fc.assert(fc.property(
      fc.webUrl(),
      async (url) => {
        const { load, state, currentSrc } = useImageLoader()
        
        // Should start in idle state
        expect(state.value).toBe('idle')
        
        // Should update currentSrc when loading
        await load(url).catch(() => {
          // Expected to fail for random URLs
        })
        
        expect(currentSrc.value).toBe(url)
        expect(['loading', 'loaded', 'error']).toContain(state.value)
      }
    ))
  })

  it('should handle empty and invalid URLs', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.constant(''),
        fc.constant(null),
        fc.constant(undefined),
        fc.string().filter(s => !s.startsWith('http'))
      ),
      async (invalidUrl) => {
        const { load, state, error } = useImageLoader()
        
        await load(invalidUrl as string).catch(() => {
          // Expected to fail
        })
        
        if (!invalidUrl) {
          expect(state.value).toBe('error')
          expect(error.value).toBeTruthy()
        }
      }
    ))
  })
})