import { ref, Ref } from 'vue'

export type ImageLoadState = 'idle' | 'loading' | 'loaded' | 'error'

export interface UseImageLoaderOptions {
  maxRetries?: number
  retryDelay?: number
}

export interface UseImageLoaderReturn {
  state: Ref<ImageLoadState>
  currentSrc: Ref<string>
  error: Ref<Error | null>
  load: (src: string) => Promise<void>
  retry: () => Promise<void>
}

export function useImageLoader(
  options: UseImageLoaderOptions = {}
): UseImageLoaderReturn {
  const { maxRetries = 3, retryDelay = 1000 } = options

  const state = ref<ImageLoadState>('idle')
  const currentSrc = ref<string>('')
  const error = ref<Error | null>(null)
  const retryCount = ref(0)

  const load = async (src: string): Promise<void> => {
    if (!src) {
      state.value = 'error'
      error.value = new Error('Image source is required')
      return
    }

    currentSrc.value = src
    state.value = 'loading'
    error.value = null
    retryCount.value = 0

    await attemptLoad(src)
  }

  const attemptLoad = async (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        state.value = 'loaded'
        resolve()
      }

      img.onerror = async () => {
        if (retryCount.value < maxRetries) {
          retryCount.value++
          console.warn(
            `Failed to load image: ${src}. Retry ${retryCount.value}/${maxRetries}`
          )

          await new Promise((resolve) => setTimeout(resolve, retryDelay))
          await attemptLoad(src)
          resolve()
        } else {
          state.value = 'error'
          error.value = new Error(`Failed to load image after ${maxRetries} retries: ${src}`)
          console.error(`Failed to load image: ${src}`)
          reject(error.value)
        }
      }

      img.src = src
    })
  }

  const retry = async (): Promise<void> => {
    if (currentSrc.value) {
      retryCount.value = 0
      await load(currentSrc.value)
    }
  }

  return {
    state,
    currentSrc,
    error,
    load,
    retry
  }
}
