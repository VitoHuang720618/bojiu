const fs = require('fs');
const path = require('path');

// Paths
const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIG_JSON_PATH = path.join(ROOT_DIR, 'manager/backend/data/config.json');
const SOURCE_UPLOADS_DIR = path.join(ROOT_DIR, 'manager/backend/uploads');
const TARGET_DEFAULTS_DIR = path.join(ROOT_DIR, 'demo/public/defaults');
const TARGET_SITE_CONFIG_PATH = path.join(ROOT_DIR, 'demo/src/config/siteConfig.ts');

// Ensure target defaults directory exists
if (!fs.existsSync(TARGET_DEFAULTS_DIR)) {
  fs.mkdirSync(TARGET_DEFAULTS_DIR, { recursive: true });
}

// Read config.json
let config = {};
try {
  const data = fs.readFileSync(CONFIG_JSON_PATH, 'utf8');
  config = JSON.parse(data);
  console.log('✅ Loaded config.json');
} catch (err) {
  console.error('❌ Failed to read config.json:', err);
  process.exit(1);
}

// Helper to copy image and return new path
function processImage(url) {
  if (!url || !url.includes('/uploads/')) return '';

  const filename = url.split('/uploads/').pop();
  const sourcePath = path.join(SOURCE_UPLOADS_DIR, filename);
  const targetPath = path.join(TARGET_DEFAULTS_DIR, filename);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    // console.log(`Copied: ${filename}`);
  } else {
    console.warn(`⚠️ Warning: Image source not found: ${sourcePath}`);
  }

  return `/defaults/${filename}`;
}

// --- Process Data ---

// 1. Banner
const banner = {
  pc: processImage(config.banner.pc),
  tablet: processImage(config.banner.tablet),
  mobile: processImage(config.banner.mobile)
};

// 2. Background
const backgroundImage = processImage(config.backgroundImage);

// 3. Navigation (Button Links)
const navigation = (config.buttonLinks || []).map((btn, index) => ({
  id: `btn-${index}`,
  label: btn.text || '',
  href: btn.href || '#',
  isExternal: btn.target === '_blank',
  default: processImage(btn.defaultImage),
  hover: processImage(btn.hoverImage)
}));

// 4. Route Links
// Split into images and data
const routeLinksImages = (config.routeLinks || []).map((link, index) => ({
  default: processImage(link.default) || `/assets/images/Lineweb-btn-${index + 1}.webp`, // Fallback to asset if empty? Or keep empty? Keeping empty might break layout if not careful, but manager allows empty. Let's use what's in config.
  hover: processImage(link.hover) || `/assets/images/Lineweb-btn-${index + 1}-hover.webp`,
  href: link.href || ''
}));

// We need to reconstruct recommendedRoutes. `config.json` lacks titles, so we use generic ones or keep existing logic? 
// The implementation plan implies using manager data as default.
const recommendedRoutes = (config.routeLinks || []).map((link, index) => ({
  id: `route-${index + 1}`,
  index: index + 1,
  title: `线路 ${index + 1}`, // Generic title since JSON doesn't have it
  href: link.href || ''
}));


// 5. Tool Icons (Recommended Tools)
const recommendedTools = (config.toolIcons || []).map((tool, index) => ({
  id: `tool-${index}`,
  name: `Tool ${index}`, // Manager JSON doesn't seem to have name/title for tools? Wait, let's check config.json again.
  // Viewing config.json: It has href, default, hover. NO name/title.
  // siteConfig.ts has name: '小紅書' etc.
  // Using generic names if key is missing.
  href: tool.href || '#',
  default: processImage(tool.default),
  hover: processImage(tool.hover)
}));
// Fix: Attempt to map known domains to names? Or just use generic? 
// User request is to use Manager data. If Manager doesn't have names, default shouldn't have specific names potentially.
// But let's check if I can keep existing names if URL matches? Too complex.
// Let's stick to generic or empty.


// 6. Video Thumbnails
const videoThumbnails = (config.videoThumbnails || []).map((video, index) => ({
  id: `video-${index}`,
  title: video.title || `Video ${index}`,
  href: video.href || '#',
  image: processImage(video.image),
  alt: video.alt || ''
}));

// 7. Program Thumbnails
const programThumbnails = (config.programThumbnails || []).map((program, index) => ({
  id: `program-${index}`,
  title: program.title || `Program ${index}`,
  href: program.href || '#',
  image: processImage(program.image),
  alt: program.alt || ''
}));

// 8. Carousel Slides
const carouselSlides = (config.carouselSlides || []).map((slide, index) => ({
  id: `slide-${index}`,
  image: processImage(slide.image),
  href: slide.href || '',
  alt: slide.title || `Carousel ${index}`
}));

// 9. Float Ad Buttons
const floatAdButtons = (config.floatAdButtons || []).map((btn, index) => ({
  id: `float-${index}`,
  name: `Float ${index}`,
  href: btn.href || '#',
  default: processImage(btn.default),
  hover: processImage(btn.hover)
}));


// --- Generate File Content ---

const fileContent = `import { reactive } from 'vue'
import type { SiteConfig } from '../types'

// Get base URL from environment or use relative path for container deployment
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return import.meta.env.VITE_BASE_URL || ''
}

// Site configuration (Migrated from Manager)
export const siteConfig = reactive<SiteConfig>({
  title: '博九娱乐网',
  description: 'B9 Entertainment Website',
  baseUrl: getBaseUrl(),
  useApi: true, // Default to true, but assets below are used when API fails or is disabled

  navigation: ${JSON.stringify(navigation, null, 2)},

  footer: {
    links: [],
    socialMedia: [],
    copyright: 'Copyright © 博九娱乐网 Reserved'
  },

  theme: {
    colors: {
      primary: '#ba081f',
      secondary: '#8b0012',
      background: '#16181b',
      text: '#ffd08c',
      accent: '#dfb082'
    },
    fonts: {
      heading: 'Arial, Microsoft Yahei, PingFangSC, sans-serif',
      body: 'Arial, Microsoft Yahei, PingFangSC, sans-serif'
    },
    breakpoints: {
      mobile: 480,
      tablet: 768,
      desktop: 1024
    }
  }
})

// Function to update local assets for non-API mode
export const updateLocalAssets = (config: any) => {
  if (config.banner) Object.assign(banner, config.banner)
  if (config.backgroundImage) Object.assign(assetsState, { backgroundImage: config.backgroundImage })
  if (config.routeLinksImages) routeLinksImages.splice(0, routeLinksImages.length, ...config.routeLinksImages)
  if (config.recommendedRoutes) recommendedRoutes.splice(0, recommendedRoutes.length, ...config.recommendedRoutes)
  if (config.recommendedTools) recommendedTools.splice(0, recommendedTools.length, ...config.recommendedTools)
  if (config.videoThumbnails) videoThumbnails.splice(0, videoThumbnails.length, ...config.videoThumbnails)
  if (config.programThumbnails) programThumbnails.splice(0, programThumbnails.length, ...config.programThumbnails)
  if (config.carouselSlides) carouselSlides.splice(0, carouselSlides.length, ...config.carouselSlides)
  if (config.floatAdButtons) floatAdButtons.splice(0, floatAdButtons.length, ...config.floatAdButtons)
}

// Function to load runtime config
export const loadRuntimeConfig = async () => {
  try {
    const response = await fetch('/site-settings.json')
    if (response.ok) {
      const runtimeConfig = await response.json()
      
      // Update core site config
      if (runtimeConfig.siteConfig) {
        Object.assign(siteConfig, runtimeConfig.siteConfig)
      }
      
      // Update local assets if they exist in runtime config
      updateLocalAssets(runtimeConfig)
      
      console.log('✅ Runtime configuration loaded')
      return true
    }
  } catch (error) {
    // Silent fail - use built-in defaults
    console.log('ℹ️ Using built-in configuration')
  }
  return false
}

// --- Migrated Assets & Content ---

export const banner = reactive(${JSON.stringify(banner, null, 2)})

export const assetsState = reactive({
  backgroundImage: "${backgroundImage}"
})
export const backgroundImage = "${backgroundImage}"

export const routeLinksImages = reactive(${JSON.stringify(routeLinksImages, null, 2)})

export const recommendedRoutes = reactive(${JSON.stringify(recommendedRoutes, null, 2)})

export const recommendedTools = reactive(${JSON.stringify(recommendedTools, null, 2)})

export const videoThumbnails = reactive(${JSON.stringify(videoThumbnails, null, 2)})

export const programThumbnails = reactive(${JSON.stringify(programThumbnails, null, 2)})

export const carouselSlides = reactive(${JSON.stringify(carouselSlides, null, 2)})

export const floatAdButtons = reactive(${JSON.stringify(floatAdButtons, null, 2)})

export const videoContent = videoThumbnails
export const programContent = programThumbnails
export const buttonLinks = siteConfig.navigation
`;

// Write file
fs.writeFileSync(TARGET_SITE_CONFIG_PATH, fileContent, 'utf8');
console.log('✅ Generated siteConfig.ts');
console.log('🎉 Done! Manager config synced to Demo defaults.');
