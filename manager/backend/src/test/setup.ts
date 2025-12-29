import { beforeAll, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'

// 測試配置路徑
export const TEST_CONFIG_PATH = path.join(__dirname, '../test-data/config.json')
export const TEST_UPLOADS_DIR = path.join(__dirname, '../test-uploads')

beforeAll(() => {
  // 建立測試目錄
  if (!fs.existsSync(path.dirname(TEST_CONFIG_PATH))) {
    fs.mkdirSync(path.dirname(TEST_CONFIG_PATH), { recursive: true })
  }
  
  if (!fs.existsSync(TEST_UPLOADS_DIR)) {
    fs.mkdirSync(TEST_UPLOADS_DIR, { recursive: true })
  }
  
  // 建立測試配置檔案
  const testConfig = {
    logo: "/assets/images/logo.png",
    banner: "/assets/images/banner.png",
    buttonLinks: [
      {
        id: "test-button",
        default: "/assets/images/button-default.png",
        hover: "/assets/images/button-hover.png",
        alt: "測試按鈕"
      }
    ],
    carouselSlides: [
      "/assets/images/slide1.png",
      "/assets/images/slide2.png"
    ],
    titles: {
      recommendedRoutes: "/assets/images/title1.png",
      recommendedBrowsers: "/assets/images/title2.png",
      selectedVideos: "/assets/images/title3.png",
      hotPrograms: "/assets/images/title4.png"
    },
    routeLinks: {
      default: "/assets/images/route-default.png",
      hover: "/assets/images/route-hover.png"
    },
    toolIcons: [],
    videoThumbnails: [],
    programThumbnails: [],
    floatAdButtons: []
  }
  
  fs.writeFileSync(TEST_CONFIG_PATH, JSON.stringify(testConfig, null, 2))
})

afterAll(() => {
  // 清理測試檔案
  try {
    if (fs.existsSync(TEST_CONFIG_PATH)) {
      fs.unlinkSync(TEST_CONFIG_PATH)
    }
    if (fs.existsSync(path.dirname(TEST_CONFIG_PATH))) {
      fs.rmSync(path.dirname(TEST_CONFIG_PATH), { recursive: true, force: true })
    }
    if (fs.existsSync(TEST_UPLOADS_DIR)) {
      fs.rmSync(TEST_UPLOADS_DIR, { recursive: true, force: true })
    }
  } catch (error) {
    console.warn('清理測試檔案時發生錯誤:', error)
  }
})