import { ref, computed } from 'vue'
import { assetManifest } from '../config/assetManifest'
import {
    recommendedRoutes,
    carouselSlides,
    videoThumbnails,
    programThumbnails,
    recommendedTools,
    floatAdButtons,
    routeLinksImages,
    banner,
    assetsState,
    siteConfig
} from '../config/siteConfig'
import { carouselService } from '../services/carouselService'
import { apiService } from '../services/apiService'
import type { ButtonLinkConfig, BannerConfig } from '../types'

export function useSiteData() {
    // Cloud API Data Refs
    const apiLogo = ref<string | undefined>(undefined)
    const apiCarouselSlides = ref<{ image: string, href: string, alt: string }[]>([])
    const apiBanner = ref<string | BannerConfig | undefined>(undefined)
    const apiBackgroundImage = ref<string | undefined>(undefined)
    const apiVideoThumbnails = ref<({ image: string, href: string, alt: string, title: string } | null)[]>([])
    const apiProgramThumbnails = ref<({ image: string, href: string, alt: string, title: string } | null)[]>([])
    const apiButtonLinks = ref<(ButtonLinkConfig | null)[]>([])
    const apiToolIcons = ref<({ id: string, default: string, hover: string, alt: string, href: string } | null)[]>([])
    const apiFloatAdButtons = ref<({ href: string, default: string, hover: string, tablet?: string, mobile?: string } | null)[]>([])
    const apiRouteLinks = ref<Array<{ default: string, hover: string, href: string }> | null>(null)
    const dynamicHostnames = ref<string[]>([]) // 存放從 /api/hostnames 得到的動態網址

    // Computed Properties: Priority Logic (API vs Local)
    const effectiveLogo = computed(() => {
        if (siteConfig.useApi) {
            return apiLogo.value !== undefined ? apiLogo.value : assetManifest.logo
        }
        return assetsState.logo !== undefined ? assetsState.logo : assetManifest.logo
    })

    const effectiveCarouselSlides = computed(() => {
        if (siteConfig.useApi) {
            return apiCarouselSlides.value.map((slide, index) => ({
                id: `api-slide-${index}`,
                alt: slide.alt,
                href: slide.href,
                image: slide.image
            }))
        }
        return carouselSlides.map((slide, index) => ({
            id: slide.id,
            alt: slide.alt,
            href: slide.href || '#',
            image: slide.image || assetManifest.carouselSlides[index] || ''
        }))
    })

    const effectiveBanner = computed(() => {
        if (siteConfig.useApi) {
            return apiBanner.value || ''
        }
        // 優先返回 siteConfig 裡的響應式 banner 物件
        return banner
    })

    const effectiveBackgroundImage = computed(() => {
        if (siteConfig.useApi) {
            return apiBackgroundImage.value !== undefined ? apiBackgroundImage.value : ''
        }
        return assetsState.backgroundImage !== undefined ? assetsState.backgroundImage : assetManifest.backgroundImage
    })

    const effectiveVideoThumbnails = computed(() => {
        if (siteConfig.useApi) {
            return apiVideoThumbnails.value
        }
        return videoThumbnails.map((video) => ({
            image: video.image || '',
            href: video.href || '#',
            alt: video.title || '',
            title: video.title || ''
        }))
    })

    const effectiveProgramThumbnails = computed(() => {
        if (siteConfig.useApi) {
            return apiProgramThumbnails.value
        }
        return programThumbnails.map((program) => ({
            image: program.image || '',
            href: program.href || '#',
            alt: program.title || '',
            title: program.title || ''
        }))
    })

    const effectiveButtonLinks = computed(() => {
        if (siteConfig.useApi) {
            return apiButtonLinks.value.map((button, index) => ({
                id: `api-button-${index}`,
                text: button?.text || '',
                href: button?.href || '#',
                target: button?.target || '_blank',
                defaultImage: button?.defaultImage || '',
                hoverImage: button?.hoverImage || ''
            }))
        }
        // 映射 navigation
        return siteConfig.navigation.map((button) => ({
            id: button.id,
            text: button.label,
            href: button.href,
            target: button.isExternal ? '_blank' : '_self',
            defaultImage: button.default,
            hoverImage: button.hover
        }))
    })

    const effectiveToolIcons = computed(() => {
        if (siteConfig.useApi) {
            return apiToolIcons.value.map((tool, index) => ({
                id: tool?.id || `api-tool-${index}`,
                default: tool?.default || '',
                hover: tool?.hover || '',
                alt: tool?.alt || '',
                href: tool?.href || '#'
            }))
        }
        return recommendedTools.map((tool) => ({
            id: tool.id,
            default: tool.default,
            hover: tool.hover,
            alt: tool.name,
            href: tool.href
        }))
    })

    const effectiveFloatAdButtons = computed(() => {
        if (siteConfig.useApi) {
            return apiFloatAdButtons.value.map((button, index) => ({
                id: `api-floatad-${index}`,
                href: button?.href || '#',
                default: button?.default || '',
                hover: button?.hover || '',
                tablet: button?.tablet || '',
                mobile: button?.mobile || ''
            }))
        }
        return floatAdButtons.map((button) => ({
            id: button.id,
            href: button.href,
            default: button.default,
            hover: button.hover,
            tablet: button.tablet || '',
            mobile: button.mobile || ''
        }))
    })

    const effectiveRouteLinks = computed(() => {
        // 強制機制：線路 1-6 連結僅依賴動態獲取的主機名 (Dynamic Hostnames)
        // 不再使用 siteConfig.useApi 或任何寫死的 Fallback 連結
        return recommendedRoutes.map((_route, index) => {
            const dynamicHref = dynamicHostnames.value[index]
            const staticImages = routeLinksImages[index]
            return {
                default: staticImages?.default || '',
                hover: staticImages?.hover || '',
                // 僅使用動態網址，若 API 尚未抓到或抓取失敗，則連結為空 (避免連到舊站)
                href: dynamicHref || ''
            }
        })
    })

    // Data Loading Action
    const loadConfig = async () => {
        // 非同步背景執行獲取動態線路 (非阻塞)
        apiService.getHostnames().then(hostnames => {
            if (hostnames && hostnames.length > 0) {
                dynamicHostnames.value = hostnames
                console.log('useSiteData: 背景獲取動態線路成功')
            }
        }).catch(() => {
            console.warn('useSiteData: 背景獲取動態線路失敗')
        })

        // 核心配置加載 (保持同步以確保基本畫面)
        try {
            const config = await carouselService.getConfig()
            apiLogo.value = config.logo !== undefined ? config.logo : ''
            apiCarouselSlides.value = config.carouselSlides
            apiBanner.value = config.banner
            apiBackgroundImage.value = config.backgroundImage
            apiVideoThumbnails.value = config.videoThumbnails
            apiProgramThumbnails.value = config.programThumbnails
            apiButtonLinks.value = config.buttonLinks
            apiToolIcons.value = config.toolIcons
            apiFloatAdButtons.value = config.floatAdButtons || []
            apiRouteLinks.value = config.routeLinks || null
        } catch (error: any) {
            if (error?.message !== 'API is disabled via config') {
                console.error('Failed to load config:', error)
            }
        }
    }

    return {
        // State (exposed for debugging if needed, but mostly internal)
        apiCarouselSlides,

        // Computed (Read-only for template)
        effectiveLogo,
        effectiveCarouselSlides,
        effectiveBanner,
        effectiveBackgroundImage,
        effectiveVideoThumbnails,
        effectiveProgramThumbnails,
        effectiveButtonLinks,
        effectiveToolIcons,
        effectiveFloatAdButtons,
        effectiveRouteLinks,

        // Actions
        loadConfig
    }
}
