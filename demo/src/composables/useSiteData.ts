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
import type { ButtonLinkConfig, BannerConfig } from '../types'

export function useSiteData() {
    // Cloud API Data Refs
    const apiLogo = ref<string>('')
    const apiCarouselSlides = ref<{ image: string, href: string, alt: string }[]>([])
    const apiBanner = ref<string | BannerConfig>('')
    const apiBackgroundImage = ref<string>('')
    const apiVideoThumbnails = ref<({ image: string, href: string, alt: string, title: string } | null)[]>([])
    const apiProgramThumbnails = ref<({ image: string, href: string, alt: string, title: string } | null)[]>([])
    const apiButtonLinks = ref<(ButtonLinkConfig | null)[]>([])
    const apiToolIcons = ref<({ id: string, default: string, hover: string, alt: string, href: string } | null)[]>([])
    const apiFloatAdButtons = ref<({ href: string, default: string, hover: string } | null)[]>([])
    const apiRouteLinks = ref<Array<{ default: string, hover: string, href: string }> | null>(null)

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
        return videoThumbnails.map((video, index) => ({
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
        return programThumbnails.map((program, index) => ({
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
                hover: button?.hover || ''
            }))
        }
        return floatAdButtons.map((button) => ({
            id: button.id,
            href: button.href,
            default: button.default,
            hover: button.hover
        }))
    })

    const effectiveRouteLinks = computed(() => {
        if (siteConfig.useApi) {
            const apiData = apiRouteLinks.value || []
            return recommendedRoutes.map((route, index) => {
                const apiItem = apiData[index]
                return {
                    default: apiItem?.default || '',
                    hover: apiItem?.hover || '',
                    href: apiItem?.href || route.href
                }
            })
        }
        return routeLinksImages.map((link, index) => ({
            default: link.default,
            hover: link.hover,
            href: link.href || recommendedRoutes[index]?.href || '#'
        }))
    })

    // Data Loading Action
    const loadConfig = async () => {
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
