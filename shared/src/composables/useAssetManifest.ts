import { ref, reactive, Ref } from 'vue'
import type { AssetManifest } from '../types'
import { API_ENDPOINTS } from '../utils/constants'

export interface UseAssetManifestOptions {
  apiBaseUrl?: string
  autoFetch?: boolean
}

export interface UseAssetManifestReturn {
  manifest: AssetManifest
  loading: Ref<boolean>
  error: Ref<Error | null>
  fetchManifest: () => Promise<void>
  updateManifest: (updates: Partial<AssetManifest>) => void
  resetManifest: () => void
}

const createEmptyManifest = (): AssetManifest => ({
  logo: '',
  banner: '',
  buttonLinks: [],
  carouselSlides: [],
  titles: {
    recommendedRoutes: '',
    recommendedBrowsers: '',
    selectedVideos: '',
    hotPrograms: ''
  },
  routeLinks: {
    default: '',
    hover: ''
  },
  toolIcons: [],
  videoThumbnails: [],
  programThumbnails: [],
  floatAdButtons: []
})

export function useAssetManifest(
  options: UseAssetManifestOptions = {}
): UseAssetManifestReturn {
  const { 
    apiBaseUrl = 'http://localhost:3003', 
    autoFetch = true 
  } = options

  const manifest = reactive<AssetManifest>(createEmptyManifest())
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchManifest = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${apiBaseUrl}${API_ENDPOINTS.CONFIG}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      Object.assign(manifest, data)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error occurred')
      console.error('Failed to fetch asset manifest:', err)
    } finally {
      loading.value = false
    }
  }

  const updateManifest = (updates: Partial<AssetManifest>): void => {
    Object.assign(manifest, updates)
  }

  const resetManifest = (): void => {
    Object.assign(manifest, createEmptyManifest())
  }

  // 自動獲取配置
  if (autoFetch) {
    fetchManifest()
  }

  return {
    manifest,
    loading,
    error,
    fetchManifest,
    updateManifest,
    resetManifest
  }
}