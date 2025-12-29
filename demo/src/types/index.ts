// Core type definitions for B9 Website Recreation

export interface NavigationItem {
  id: string
  label: string
  href: string
  isExternal: boolean
}

export interface CallToAction {
  text: string
  href: string
  variant: 'primary' | 'secondary'
}

export interface FooterLink {
  label: string
  href: string
}

export interface SocialMediaLink {
  platform: string
  url: string
  icon: string
}

export interface FooterConfig {
  links: FooterLink[]
  socialMedia: SocialMediaLink[]
  copyright: string
}

export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
    accent: string
  }
  fonts: {
    heading: string
    body: string
  }
  breakpoints: {
    mobile: number
    tablet: number
    desktop: number
  }
}

export interface SiteConfig {
  title: string
  description: string
  baseUrl: string
  navigation: NavigationItem[]
  footer: FooterConfig
  theme: ThemeConfig
}

export interface HeroContent {
  title: string
  subtitle?: string
  backgroundImage: string
  cta?: CallToAction
}

export type LayoutType = 'single' | 'two-column' | 'three-column' | 'grid'

export interface SectionStyle {
  backgroundColor?: string
  padding?: string
  textAlign?: 'left' | 'center' | 'right'
}

export interface ContentBlock {
  type: 'text' | 'image' | 'card'
  data: any
}

export interface Section {
  id: string
  type: 'text' | 'features' | 'gallery' | 'contact'
  title?: string
  content: any
  layout: LayoutType
  style?: SectionStyle
}

export interface PageContent {
  hero: HeroContent
  sections: Section[]
}

export interface ImageAsset {
  id: string
  originalUrl: string
  localPath: string
  filename: string
  format: string
  width: number
  height: number
  size: number
}

export interface FontAsset {
  family: string
  localPath: string
  weights: number[]
  formats: string[]
}

export interface IconAsset {
  name: string
  localPath: string
  format: 'svg' | 'png'
}

export interface AssetManifest {
  images: ImageAsset[]
  fonts: FontAsset[]
  icons: IconAsset[]
}

// Component Props Interfaces
export interface HeaderProps {
  logo?: string
  navigationItems: NavigationItem[]
}

export interface HeroProps {
  title: string
  subtitle?: string
  backgroundImage?: string
  ctaButton?: CallToAction
}

export interface ContentSectionProps {
  id: string
  title?: string
  content: string | ContentBlock[]
  layout: LayoutType
  backgroundColor?: string
}

export interface FooterProps {
  links: FooterLink[]
  socialMedia?: SocialMediaLink[]
  copyright: string
}

export interface ImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  lazy?: boolean
  fallback?: string
}

export interface AppState {
  isLoading: boolean
  hasError: boolean
}
