import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useImageLoader } from '../../src/composables/useImageLoader'

describe('useImageLoader', () => {
  let mockImage: any

  beforeEach(() => {
    mockImage = {
      onload: null as any,
      onerror: null as any,
      src: ''
    }
    
    global.Image = vi.fn(() => mockImage) as any
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with idle state', () => {
    const { state, currentSrc, error } = useImageLoader()

    expect(state.value).toBe('idle')
    expect(currentSrc.value).toBe('')
    expect(error.value).toBeNull()
  })

  it('should set error state when src is empty', async () => {
    const { state, error, load } = useImageLoader()

    await load('')

    expect(state.value).toBe('error')
    expect(error.value).toBeInstanceOf(Error)
    expect(error.value?.message).toBe('Image source is required')
  })

  it('should set loading state when load is called', () => {
    const { state, load } = useImageLoader()

    load('/test.jpg')
    
    expect(state.value).toBe('loading')
  })

  it('should update currentSrc when load is called', () => {
    const { currentSrc, load } = useImageLoader()

    const testSrc = '/test.jpg'
    load(testSrc)

    expect(currentSrc.value).toBe(testSrc)
  })

  it('should handle successful image load', async () => {
    const { state, load } = useImageLoader()

    const loadPromise = load('/test.jpg')

    // Trigger onload immediately
    if (mockImage.onload) {
      mockImage.onload()
    }

    await loadPromise

    expect(state.value).toBe('loaded')
  })

  it('should set error state after max retries', async () => {
    const { state, error, load } = useImageLoader({ maxRetries: 0, retryDelay: 10 })

    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const loadPromise = load('/test.jpg')

    // Trigger error immediately (no retries)
    if (mockImage.onerror) {
      mockImage.onerror()
    }

    await loadPromise.catch(() => {})

    expect(state.value).toBe('error')
    expect(error.value).toBeInstanceOf(Error)
  })

  it('should allow manual retry', async () => {
    const { currentSrc, state, load, retry } = useImageLoader()

    const loadPromise = load('/test.jpg')

    // Trigger success
    if (mockImage.onload) {
      mockImage.onload()
    }

    await loadPromise

    expect(currentSrc.value).toBe('/test.jpg')
    expect(state.value).toBe('loaded')

    // Retry should work
    const retryPromise = retry()

    if (mockImage.onload) {
      mockImage.onload()
    }

    await retryPromise

    expect(state.value).toBe('loaded')
  })
})
