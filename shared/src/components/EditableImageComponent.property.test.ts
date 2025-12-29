import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import fc from 'fast-check'
import EditableImageComponent from './EditableImageComponent.vue'

// Mock fetch for upload testing
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('EditableImageComponent Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: { path: '/uploads/new-image.jpg' }
      })
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  /**
   * 屬性 4: 點擊觸發一致性
   * 對於任何可編輯的圖片區域，點擊操作應該觸發檔案選擇對話框
   * 驗證需求: Requirements 2.1
   */
  it('Property 4: Click trigger consistency - any editable image area should trigger file selection on click', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        src: fc.webUrl(),
        alt: fc.string({ minLength: 1, maxLength: 100 }),
        assetPath: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z][a-zA-Z0-9.]*$/.test(s)),
        uploadEndpoint: fc.webUrl()
      }),
      async (props) => {
        const wrapper = mount(EditableImageComponent, {
          props: {
            ...props,
            editable: true,
            assetType: 'single' as const
          }
        })

        // 模擬檔案輸入的 click 方法
        const fileInput = wrapper.find('input[type="file"]')
        const clickSpy = vi.spyOn(fileInput.element as HTMLInputElement, 'click').mockImplementation(() => {})

        // 先觸發 hover 以顯示覆蓋層
        await wrapper.trigger('mouseenter')
        await nextTick()

        // 現在點擊編輯覆蓋層
        const editOverlay = wrapper.find('.edit-overlay')
        expect(editOverlay.exists()).toBe(true)
        
        await editOverlay.trigger('click')
        await nextTick()

        // 驗證檔案選擇對話框被觸發
        expect(clickSpy).toHaveBeenCalled()
        
        clickSpy.mockRestore()
        wrapper.unmount()
      }
    ), { numRuns: 15 })
  })

  /**
   * 屬性 20: 編輯提示顯示
   * 對於任何可編輯圖片的滑鼠懸停操作，系統應該顯示編輯提示覆蓋層
   * 驗證需求: Requirements 6.1
   */
  it('Property 20: Edit hint display - any editable image should show edit overlay on hover', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        src: fc.webUrl(),
        alt: fc.string({ minLength: 1, maxLength: 100 }),
        assetPath: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z][a-zA-Z0-9.]*$/.test(s)),
        uploadEndpoint: fc.webUrl()
      }),
      async (props) => {
        const wrapper = mount(EditableImageComponent, {
          props: {
            ...props,
            editable: true,
            assetType: 'single' as const
          }
        })

        // 初始狀態：覆蓋層不應該顯示
        let editOverlay = wrapper.find('.edit-overlay')
        expect(editOverlay.exists()).toBe(false)

        // 觸發滑鼠懸停
        await wrapper.trigger('mouseenter')
        await nextTick()

        // 驗證編輯覆蓋層顯示
        editOverlay = wrapper.find('.edit-overlay')
        expect(editOverlay.exists()).toBe(true)
        if (editOverlay.exists()) {
          expect(editOverlay.classes()).toContain('edit-overlay--hovered')
        }

        // 驗證編輯提示內容
        const editHint = wrapper.find('.edit-hint')
        expect(editHint.exists()).toBe(true)
        
        const editIcon = wrapper.find('.edit-icon')
        const editText = wrapper.find('.edit-text')
        expect(editIcon.exists()).toBe(true)
        expect(editText.exists()).toBe(true)
        expect(editText.text()).toContain('點擊更換圖片')

        // 觸發滑鼠離開
        await wrapper.trigger('mouseleave')
        await nextTick()

        // 驗證覆蓋層隱藏（通過檢查類別而不是內部狀態）
        editOverlay = wrapper.find('.edit-overlay')
        if (editOverlay.exists()) {
          expect(editOverlay.classes()).not.toContain('edit-overlay--hovered')
        }

        wrapper.unmount()
      }
    ), { numRuns: 15 })
  })

  /**
   * 屬性 21: 上傳進度顯示
   * 對於任何正在進行的圖片上傳，系統應該顯示上傳進度指示器
   * 驗證需求: Requirements 6.2
   */
  it('Property 21: Upload progress display - any ongoing upload should show progress indicator', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        src: fc.webUrl(),
        alt: fc.string({ minLength: 1, maxLength: 100 }),
        assetPath: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z][a-zA-Z0-9.]*$/.test(s)),
        uploadEndpoint: fc.webUrl()
      }),
      async (props) => {
        const wrapper = mount(EditableImageComponent, {
          props: {
            ...props,
            editable: true,
            assetType: 'single' as const
          }
        })

        // 直接設置上傳狀態來測試 UI 元素（通過內部狀態訪問）
        const componentInstance = wrapper.vm as any
        componentInstance.isUploading = true
        componentInstance.uploadProgress = 50
        await nextTick()

        // 驗證上傳進度覆蓋層顯示
        const editOverlay = wrapper.find('.edit-overlay')
        expect(editOverlay.exists()).toBe(true)
        expect(editOverlay.classes()).toContain('edit-overlay--uploading')

        // 驗證上傳進度元素
        const uploadProgress = wrapper.find('.upload-progress')
        expect(uploadProgress.exists()).toBe(true)

        const progressSpinner = wrapper.find('.progress-spinner')
        const progressText = wrapper.find('.progress-text')
        const progressBar = wrapper.find('.progress-bar')
        const progressFill = wrapper.find('.progress-fill')

        expect(progressSpinner.exists()).toBe(true)
        expect(progressText.exists()).toBe(true)
        expect(progressBar.exists()).toBe(true)
        expect(progressFill.exists()).toBe(true)

        // 驗證進度文字包含百分比
        expect(progressText.text()).toContain('上傳中...')
        expect(progressText.text()).toContain('50%')

        // 驗證進度條寬度
        expect(progressFill.attributes('style')).toContain('width: 50%')

        // 重置狀態
        componentInstance.isUploading = false
        await nextTick()

        // 驗證上傳完成後狀態
        expect(componentInstance.isUploading).toBe(false)

        wrapper.unmount()
      }
    ), { numRuns: 10 })
  })

  /**
   * 屬性測試：編輯模式一致性
   * 對於任何 editable 屬性的變化，組件應該正確切換編輯功能
   */
  it('Property: Edit mode consistency - component should correctly toggle edit functionality based on editable prop', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        src: fc.webUrl(),
        alt: fc.string({ minLength: 1, maxLength: 100 }),
        assetPath: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z][a-zA-Z0-9.]*$/.test(s)),
        uploadEndpoint: fc.webUrl()
      }),
      fc.boolean(),
      async (props, editable) => {
        const wrapper = mount(EditableImageComponent, {
          props: {
            ...props,
            editable,
            assetType: 'single' as const
          }
        })

        // 驗證容器類別
        const container = wrapper.find('.editable-image-component')
        if (editable) {
          expect(container.classes()).toContain('editable-image-component--editable')
        } else {
          expect(container.classes()).not.toContain('editable-image-component--editable')
        }

        // 驗證檔案輸入存在
        const fileInput = wrapper.find('input[type="file"]')
        expect(fileInput.exists()).toBe(true)

        // 測試滑鼠懸停行為
        await wrapper.trigger('mouseenter')
        await nextTick()
        
        if (editable) {
          // 檢查是否有 hovered 類別
          const container = wrapper.find('.editable-image-component')
          expect(container.classes()).toContain('editable-image-component--hovered')
        } else {
          // 非編輯模式下不應該有 hovered 類別
          const container = wrapper.find('.editable-image-component')
          expect(container.classes()).not.toContain('editable-image-component--hovered')
        }

        wrapper.unmount()
      }
    ), { numRuns: 20 })
  })

  /**
   * 屬性測試：事件發送一致性
   * 對於任何有效的事件觸發，組件應該發送對應的事件
   */
  it('Property: Event emission consistency - component should emit appropriate events for valid triggers', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        src: fc.webUrl(),
        alt: fc.string({ minLength: 1, maxLength: 100 }),
        assetPath: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z][a-zA-Z0-9.]*$/.test(s)),
        uploadEndpoint: fc.webUrl()
      }),
      async (props) => {
        const wrapper = mount(EditableImageComponent, {
          props: {
            ...props,
            editable: true,
            assetType: 'single' as const
          }
        })

        // 測試 editClick 事件
        await wrapper.trigger('mouseenter')
        await nextTick()
        
        const editOverlay = wrapper.find('.edit-overlay')
        if (editOverlay.exists()) {
          await editOverlay.trigger('click')
          
          const editClickEvents = wrapper.emitted('editClick')
          expect(editClickEvents).toBeDefined()
          expect(editClickEvents![0]).toEqual([props.assetPath])
        }

        wrapper.unmount()
      }
    ), { numRuns: 15 })
  })
})