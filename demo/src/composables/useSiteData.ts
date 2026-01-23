import { ref, computed } from 'vue'
import { assetManifest } from '../config/assetManifest'
import {
    recommendedRoutes,
    carouselSlides,
    videoContent,
    programContent,
    siteConfig
} from '../config/siteConfig'
import { carouselService } from '../services/carouselService'
import type { ButtonLinkConfig, BannerConfig } from '../types'

export function useSiteData() {
    // Cloud API Data Refs
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
            image: assetManifest.carouselSlides[index] || ''
        }))
    })

    const effectiveBanner = computed(() => {
        if (siteConfig.useApi) {
            return apiBanner.value || ''
        }
        return assetManifest.banner
    })

    const effectiveBackgroundImage = computed(() => {
        if (siteConfig.useApi) {
            return apiBackgroundImage.value || ''
        }
        const bgImage = apiBackgroundImage.value
        return bgImage || (assetManifest as any).backgroundImage
    })

    const effectiveVideoThumbnails = computed(() => {
        if (siteConfig.useApi) {
            return apiVideoThumbnails.value
        }
        return videoContent.map((video, index) => ({
            image: assetManifest.videoThumbnails[index] || '',
            href: '#',
            alt: video.title,
            title: video.title
        }))
    })

    const effectiveProgramThumbnails = computed(() => {
        if (siteConfig.useApi) {
            return apiProgramThumbnails.value
        }
        return programContent.map((program, index) => ({
            image: assetManifest.programThumbnails[index] || '',
            href: '#',
            alt: program.title,
            title: program.title
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
        return assetManifest.buttonLinks.map((button) => ({
            id: button.id,
            text: button.alt,
            href: '#',
            target: '_blank',
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
        return assetManifest.toolIcons.map((tool) => ({
            id: tool.id,
            default: tool.default,
            hover: tool.hover,
            alt: tool.alt,
            href: '#'
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
        return assetManifest.floatAdButtons.map((button) => ({
            id: button.id,
            href: '#',
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
        return recommendedRoutes.map((route, index) => {
            const defaultItem = assetManifest.routeLinks[index] || { default: '', hover: '' }
            return {
                default: defaultItem.default,
                hover: defaultItem.hover,
                href: route.href
            }
        })
    })

    // Data Loading Action
    const loadConfig = async () => {
        try {
            const config = await carouselService.getConfig()
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
