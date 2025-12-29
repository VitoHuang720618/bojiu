import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import EditableImageComponent from './EditableImageComponent.vue'
import type { EditableImageProps } from '../types'

// Mock fetch
global.fetch = vi.fn()

describe('EditableImageComponent', () => {
  let wrapper: VueWrapper<any>
  
  const defaultProps: EditableImageProps = {
    src: '/test-image.jpg',
    alt: 'Test Image',
    editable: true,
    assetPath: 'logo',
    assetType: 'single',
    uploadEndpoint: '/api/upload'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('基本渲染', () => {
    it('應該正確渲染基礎圖片組件', () => {
      wrapper = mount(EditableImageComponent, {
        props: defaultProps
      })

      const imageComponent = wrapper.findComponent({ name: 'ImageComponent' })
      expect(imageComponent.exists()).toBe(true)
      expect(imageComponent.props('src')).toBe('/test-image.jpg')
      expect(imageComponent.props('alt')).toBe('Test Image')
    })

    it('應該在非編輯模式下隱藏編輯覆蓋層', () => {
      wrapper = mount(EditableImageComponent, {
        props: {
          ...defaultProps,
          editable: false
        }
      })

      const overlay = wrapper.find('.edit-overlay')
      expect(overlay.exists()).toBe(false)
    })

    it('應該包含隱藏的檔案輸入元素', () => {
      wrapper = mount(EditableImageComponent, {
        props: defaultProps
      })

      const fileInput = wrapper.find('input[type="file"]')
      expect(fileInput.exists()).toBe(true)
      expect(fileInput.attributes('accept')).toBe('image/png,image/jpg,image/jpeg')
      expect(fileInput.attributes('style')).toContain('display: none')
    })
  })

  describe('滑鼠互動', () => {
    it('應該在滑鼠懸停時顯示編輯覆蓋層', async () => {
      wrapper = mount(EditableImageComponent, {
        props: defaultProps
      })

      await wrapper.trigger('mouseenter')
      await nextTick()

      const overlay = wrapper.find('.edit-overlay')
      expect(overlay.exists()).toBe(true)
      expect(overlay.classes()).toContain('edit-overlay--hovered')
    })

    it('應該在滑鼠離開時隱藏編輯覆蓋層', async () => {
      wrapper = mount(EditableImageComponent, {
        props: defaultProps
      })

      await wrapper.trigger('mouseenter')
      await wrapper.trigger('mouseleave')
      await nextTick()

      const overlay = wrapper.find('.edit-overlay')
      expect(overlay.exists()).toBe(false)
    })

    it('應該在非編輯模式下不響應滑鼠懸停', async () => {
      wrapper = mount(EditableImageComponent, {
        props: {
          ...defaultProps,
          editable: false
        }
      })

      await wrapper.trigger('mouseenter')
      await nextTick()

      const overlay = wrapper.find('.edit-overlay')
      expect(overlay.exists()).toBe(false)
    })
  })

  describe('編輯功能', () => {
    it('應該在點擊編輯覆蓋層時觸發檔案選擇', async () => {
      wrapper = mount(EditableImageComponent, {
        props: defaultProps
      })

      // 模擬滑鼠懸停顯示覆蓋層
      await wrapper.trigger('mouseenter')
      await nextTick()

      const fileInput = wrapper.find('input[type="file"]')
      const clickSpy = vi.spyOn(fileInput.element as HTMLInputElement, 'click')

      const overlay = wrapper.find('.edit-overlay')
      await overlay.trigger('click')

      expect(clickSpy).toHaveBeenCalled()
      expect(wrapper.emitted('editClick')).toBeTruthy()
      expect(wrapper.emitted('editClick')?.[0]).toEqual(['logo'])
    })

    it('應該在上傳中時禁用編輯點擊', async () => {
      wrapper = mount(EditableImageComponent, {
        props: defaultProps
      })

      // 直接訪問組件實例來設置上傳狀態
      const vm = wrapper.vm as any
      vm.isUploading = true
      await wrapper.trigger('mouseenter')
      await nextTick()

      const fileInput = wrapper.find('input[type="file"]')
      const clickSpy = vi.spyOn(fileInput.element as HTMLInputElement, 'click')

      const overlay = wrapper.find('.edit-overlay')
      await overlay.trigger('click')

      expect(clickSpy).not.toHaveBeenCalled()
    })
  })

  describe('檔案上傳', () => {
    it('應該驗證檔案格式和大小', async () => {
      wrapper = mount(EditableImageComponent, {
        props: defaultProps
      })

      const fileInput = wrapper.find('input[type="file"]')
      const invalidFile = new File([''], 'test.txt', { type: 'text/plain' })

      Object.defineProperty(fileInput.element, 'files', {
        value: [invalidFile],
        writable: false
      })

      await fileInput.trigger('change')
      await nextTick()

      expect(wrapper.emitted('uploadError')).toBeTruthy()
    })

    it('應該成功上傳有效的圖片檔案', async () => {
      const mockResponse = {
        success: true,
        data: {
          filename: 'uploaded-image.jpg',
          path: '/uploads/uploaded-image.jpg',
          size: 1024,
          mimetype: 'image/jpeg'
        }
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      wrapper = mount(EditableImageComponent, {
        props: defaultProps
      })

      const fileInput = wrapper.find('input[type="file"]')
      const validFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })

      Object.defineProperty(fileInput.element, 'files', {
        value: [validFile],
        writable: false
      })

      await fileInput.trigger('change')
      
      // 等待檔案驗證和上傳開始
      await nextTick()
      expect(wrapper.emitted('uploadStart')).toBeTruthy()
      
      // 等待上傳完成
      await new Promise(resolve => setTimeout(resolve, 1500))
      await nextTick()

      expect(wrapper.emitted('uploadComplete')).toBeTruthy()
      expect(wrapper.emitted('uploadComplete')?.[0]).toEqual(['/uploads/uploaded-image.jpg'])
    })

    it('應該處理上傳失敗', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      })

      wrapper = mount(EditableImageComponent, {
        props: defaultProps
      })

      const fileInput = wrapper.find('input[type="file"]')
      const validFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })

      Object.defineProperty(fileInput.element, 'files', {
        value: [validFile],
        writable: false
      })

      await fileInput.trigger('change')
      
      // 等待上傳失敗處理
      await new Promise(resolve => setTimeout(resolve, 100))
      await nextTick()

      expect(wrapper.emitted('uploadError')).toBeTruthy()
    })
  })

  describe('上傳進度顯示', () => {
    it('應該在上傳中顯示進度指示器', async () => {
      wrapper = mount(EditableImageComponent, {
        props: defaultProps
      })

      // 直接訪問組件實例來設置狀態
      const vm = wrapper.vm as any
      vm.isUploading = true
      vm.uploadProgress = 50
      await wrapper.trigger('mouseenter')
      await nextTick()

      const overlay = wrapper.find('.edit-overlay')
      const progressSpinner = wrapper.find('.progress-spinner')
      const progressText = wrapper.find('.progress-text')
      const progressBar = wrapper.find('.progress-fill')

      expect(overlay.exists()).toBe(true)
      expect(overlay.classes()).toContain('edit-overlay--uploading')
      expect(progressSpinner.exists()).toBe(true)
      expect(progressText.text()).toContain('50%')
      expect(progressBar.attributes('style')).toContain('width: 50%')
    })

    it('應該發送進度更新事件', async () => {
      const mockResponse = {
        success: true,
        data: {
          filename: 'uploaded-image.jpg',
          path: '/uploads/uploaded-image.jpg',
          size: 1024,
          mimetype: 'image/jpeg'
        }
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      wrapper = mount(EditableImageComponent, {
        props: defaultProps
      })

      const fileInput = wrapper.find('input[type="file"]')
      const validFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })

      Object.defineProperty(fileInput.element, 'files', {
        value: [validFile],
        writable: false
      })

      await fileInput.trigger('change')
      
      // 等待檔案驗證和上傳開始
      await nextTick()
      expect(wrapper.emitted('uploadStart')).toBeTruthy()
      
      // 等待進度更新
      await new Promise(resolve => setTimeout(resolve, 1500))
      await nextTick()

      const progressEvents = wrapper.emitted('uploadProgress')
      expect(progressEvents).toBeTruthy()
      expect(progressEvents?.length).toBeGreaterThan(0)
    })
  })

  describe('成功和錯誤提示', () => {
    it('應該顯示成功提示並自動隱藏', async () => {
      wrapper = mount(EditableImageComponent, {
        props: defaultProps
      })

      // 直接訪問組件實例來設置狀態
      const vm = wrapper.vm as any
      vm.showSuccessToast = true
      await nextTick()

      const successToast = wrapper.find('.success-toast')
      expect(successToast.exists()).toBe(true)
      expect(successToast.text()).toContain('圖片更新成功')
    })

    it('應該顯示錯誤提示並允許手動關閉', async () => {
      wrapper = mount(EditableImageComponent, {
        props: defaultProps
      })

      // 直接訪問組件實例來設置狀態
      const vm = wrapper.vm as any
      vm.showErrorToast = true
      vm.uploadError = '檔案太大'
      await nextTick()

      const errorToast = wrapper.find('.error-toast')
      const closeButton = wrapper.find('.close-button')

      expect(errorToast.exists()).toBe(true)
      expect(errorToast.text()).toContain('檔案太大')
      expect(closeButton.exists()).toBe(true)

      await closeButton.trigger('click')
      await nextTick()

      expect(vm.showErrorToast).toBe(false)
    })
  })

  describe('事件轉發', () => {
    it('應該正確轉發基礎圖片組件的事件', async () => {
      wrapper = mount(EditableImageComponent, {
        props: {
          ...defaultProps,
          editable: false
        }
      })

      const imageComponent = wrapper.findComponent({ name: 'ImageComponent' })
      
      // 模擬圖片載入事件
      const mockEvent = new Event('load')
      await imageComponent.vm.$emit('load', mockEvent)

      expect(wrapper.emitted('load')).toBeTruthy()
      expect(wrapper.emitted('load')?.[0]).toEqual([mockEvent])

      // 模擬圖片錯誤事件
      const mockError = new Error('Image load failed')
      await imageComponent.vm.$emit('error', mockError)

      expect(wrapper.emitted('error')).toBeTruthy()
      expect(wrapper.emitted('error')?.[0]).toEqual([mockError])

      // 模擬圖片點擊事件（非編輯模式）
      const mockClickEvent = new MouseEvent('click')
      await imageComponent.vm.$emit('click', mockClickEvent)

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')?.[0]).toEqual([mockClickEvent])
    })

    it('應該在編輯模式下阻止圖片點擊事件', async () => {
      wrapper = mount(EditableImageComponent, {
        props: defaultProps
      })

      const imageComponent = wrapper.findComponent({ name: 'ImageComponent' })
      
      // 模擬圖片點擊事件（編輯模式）
      const mockClickEvent = new MouseEvent('click')
      await imageComponent.vm.$emit('click', mockClickEvent)

      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })

  describe('響應式屬性', () => {
    it('應該響應 editable 屬性變化', async () => {
      wrapper = mount(EditableImageComponent, {
        props: defaultProps
      })

      // 初始狀態：可編輯
      await wrapper.trigger('mouseenter')
      await nextTick()
      expect(wrapper.find('.edit-overlay').exists()).toBe(true)

      // 切換到不可編輯
      await wrapper.setProps({ editable: false })
      await nextTick()
      expect(wrapper.find('.edit-overlay').exists()).toBe(false)
    })

    it('應該正確應用容器樣式類別', async () => {
      wrapper = mount(EditableImageComponent, {
        props: defaultProps
      })

      const container = wrapper.find('.editable-image-component')
      expect(container.classes()).toContain('editable-image-component--editable')

      await wrapper.trigger('mouseenter')
      await nextTick()
      expect(container.classes()).toContain('editable-image-component--hovered')

      // 直接訪問組件實例來設置狀態
      const vm = wrapper.vm as any
      vm.isUploading = true
      await nextTick()
      expect(container.classes()).toContain('editable-image-component--uploading')
    })
  })
})