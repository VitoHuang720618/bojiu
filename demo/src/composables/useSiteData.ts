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
    siteConfig,
    titles,
    pageLayout,
    programmeLayout,
    banner,
    assetsState,
    sectionColors
} from '../config/siteConfig'
import { carouselService } from '../services/carouselService'
import { apiService } from '../services/apiService'
import type { ButtonLinkConfig, BannerConfig } from '../types'

type HeaderStylesConfig = {
    height?: number
    backgroundMode: 'solid' | 'gradient'
    solidColor: string
    opacity: number
    gradient: { color1: string, color2: string, angle: number }
    boxShadow: { enabled: boolean, x: number, y: number, blur: number, spread: number, color: string, opacity: number }
}

const defaultHeaderStyles: HeaderStylesConfig = {
    height: 75,
    backgroundMode: 'gradient',
    solidColor: '#3041b9',
    opacity: 1,
    gradient: { color1: '#3041b9', color2: '#081fb3', angle: 0 },
    boxShadow: { enabled: true, x: 0, y: 0, blur: 20, spread: 0, color: '#000000', opacity: 0.3 }
}

// Global (shared) refs for API data
const dynamicHostnames = ref<string[]>([])
const apiLogo = ref<string | undefined>(undefined)
const apiCarouselSlides = ref<{ image: string, href: string, alt: string }[]>([])
const apiBanner = ref<string | BannerConfig | undefined>(undefined)
const apiBackgroundImage = ref<string | undefined>(undefined)
const apiBackgroundSettings = ref<{
    displayMode: 'repeat' | 'contain' | 'fit-width'
    topBorderEnabled: boolean
    topBorderColor: string
    topBorderWidth: number
} | undefined>(undefined)
const apiHeaderCss = ref<string | undefined>(undefined)
const apiHeaderBackgroundRgba = ref<string | undefined>(undefined)
const apiHeaderStyles = ref<HeaderStylesConfig | undefined>(undefined)
const apiRecommendContentBackground = ref<string | undefined>(undefined)
const apiRecommendContentCss = ref<string | undefined>(undefined)
const apiSectionColors = ref<{
    recommendFooterTitleBackground: string
    recommendFooterItemBackground: string
    recommendFooterItemHoverBackground: string
    recommendFooterTopBorderColor: string
    thumbnailTitleBackground: string
    thumbnailBorderColor: string
    thumbnailTextColor: string
    footerBackground: string
} | undefined>(undefined)
const apiTitles = ref<{
    recommendedRoutes: string
    recommendedBrowsers: string
    selectedVideos: string
    hotPrograms: string
} | undefined>(undefined)
const apiVideoThumbnails = ref<({ image: string, href: string, alt: string, title: string } | null)[]>([])
const apiProgramThumbnails = ref<({ image: string, href: string, alt: string, title: string } | null)[]>([])
const apiButtonLinks = ref<(ButtonLinkConfig | null)[]>([])
const apiToolIcons = ref<({ id: string, default: string, hover: string, alt: string, href: string } | null)[]>([])
const apiFloatAdButtons = ref<({ href: string, default: string, hover: string, tablet?: string, mobile?: string } | null)[]>([])
const apiRouteLinks = ref<Array<{ default: string, hover: string, href: string }> | null>(null)
const apiPageLayout = ref<string[] | undefined>(undefined)
const apiProgrammeLayout = ref<string[] | undefined>(undefined)

export function useSiteData() {

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

    const effectiveBackgroundSettings = computed(() => {
        if (siteConfig.useApi) {
            return apiBackgroundSettings.value || {
                displayMode: 'repeat' as const,
                topBorderEnabled: true,
                topBorderColor: '#dfb082',
                topBorderWidth: 4
            }
        }
        return assetsState.backgroundSettings
    })

    const effectiveHeaderCss = computed(() => {
        if (siteConfig.useApi) {
            return apiHeaderCss.value
        }
        return assetsState.headerCss
    })

    const effectiveRecommendContentBackground = computed(() => {
        if (siteConfig.useApi) {
            return apiRecommendContentBackground.value !== undefined ? apiRecommendContentBackground.value : ''
        }
        return assetsState.recommendContentBackground !== undefined ? assetsState.recommendContentBackground : 'rgba(20, 10, 104, 1.0)'
    })

    const effectiveHeaderBackgroundRgba = computed(() => {
        if (siteConfig.useApi) {
            return apiHeaderBackgroundRgba.value !== undefined ? apiHeaderBackgroundRgba.value : ''
        }
        return assetsState.headerBackgroundRgba !== undefined ? assetsState.headerBackgroundRgba : ''
    })

    const effectiveHeaderStyle = computed(() => {
        const styles = (siteConfig.useApi ? apiHeaderStyles.value : assetsState.headerStyles) || defaultHeaderStyles
        const hexToRgba = (hex: string, opacity: number) => {
            const normalized = hex.replace('#', '')
            if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return hex
            const red = parseInt(normalized.slice(0, 2), 16)
            const green = parseInt(normalized.slice(2, 4), 16)
            const blue = parseInt(normalized.slice(4, 6), 16)
            return `rgba(${red}, ${green}, ${blue}, ${opacity})`
        }
        const opacity = styles.opacity ?? 1
        const background = styles.backgroundMode === 'solid'
            ? hexToRgba(styles.solidColor, opacity)
            : `linear-gradient(${styles.gradient.angle}deg, ${hexToRgba(styles.gradient.color1, opacity)} 0%, ${hexToRgba(styles.gradient.color2, opacity)} 100%)`
        return {
            background,
            height: styles.height ? `${styles.height}px` : undefined
        }
    })

    const effectiveRecommendContentCss = computed(() => {
        if (siteConfig.useApi) {
            return apiRecommendContentCss.value !== undefined ? apiRecommendContentCss.value : ''
        }
        return assetsState.recommendContentCss !== undefined ? assetsState.recommendContentCss : ''
    })

    const effectiveSectionColors = computed(() => {
        if (siteConfig.useApi) {
            return apiSectionColors.value || sectionColors
        }
        return sectionColors
    })

    const effectiveTitles = computed(() => {
        if (siteConfig.useApi) {
            return apiTitles.value || {
                recommendedRoutes: '',
                recommendedBrowsers: '',
                selectedVideos: '',
                hotPrograms: ''
            }
        }
        return {
            recommendedRoutes: titles.recommendedRoutes || assetManifest.titles.recommendedRoutes,
            recommendedBrowsers: titles.recommendedBrowsers || assetManifest.titles.recommendedBrowsers,
            // 影片區標題可刻意留空，前台會保留標題區高度而不回退為舊的內建圖片。
            selectedVideos: titles.selectedVideos,
            hotPrograms: titles.hotPrograms
        }
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

    const effectivePageLayout = computed(() => {
        if (siteConfig.useApi && apiPageLayout.value) {
            return apiPageLayout.value
        }
        return pageLayout
    })

    const effectiveProgrammeLayout = computed(() => {
        if (siteConfig.useApi && apiProgrammeLayout.value) {
            return apiProgrammeLayout.value
        }
        return programmeLayout
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

        try {
            const config = await carouselService.getConfig()
            apiLogo.value = config.logo !== undefined ? config.logo : ''
            apiCarouselSlides.value = config.carouselSlides
            apiBanner.value = config.banner
            apiBackgroundImage.value = config.backgroundImage
            apiBackgroundSettings.value = config.backgroundSettings
            apiHeaderCss.value = config.headerCss
            apiHeaderBackgroundRgba.value = config.headerBackgroundRgba
            apiHeaderStyles.value = config.headerStyles
            apiRecommendContentBackground.value = config.recommendContentBackground
            apiRecommendContentCss.value = config.recommendContentCss
            apiSectionColors.value = config.sectionColors
            apiTitles.value = config.titles
            apiVideoThumbnails.value = config.videoThumbnails
            apiProgramThumbnails.value = config.programThumbnails
            apiButtonLinks.value = config.buttonLinks
            apiToolIcons.value = config.toolIcons
            apiFloatAdButtons.value = config.floatAdButtons || []
            apiRouteLinks.value = config.routeLinks || null
            apiPageLayout.value = config.pageLayout
            apiProgrammeLayout.value = config.programmeLayout
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
        effectiveBackgroundSettings,
        effectiveHeaderCss,
        effectiveHeaderBackgroundRgba,
        effectiveHeaderStyle,
        effectiveRecommendContentBackground,
        effectiveRecommendContentCss,
        effectiveSectionColors,
        effectiveTitles,
        effectiveVideoThumbnails,
        effectiveProgramThumbnails,
        effectiveButtonLinks,
        effectiveToolIcons,
        effectiveFloatAdButtons,
        effectiveRouteLinks,
        effectivePageLayout,
        effectiveProgrammeLayout,

        // Actions
        loadConfig
    }
}
