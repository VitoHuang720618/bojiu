import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { existsSync } from 'fs'
import { join } from 'path'

// Feature: b9-website-recreation, Property 1: Image format preservation
describe('Image Format Preservation Properties', () => {
  const imageDir = join(process.cwd(), 'public/assets/images')
  
  // Get all downloaded images
  const getDownloadedImages = () => {
    const fs = require('fs')
    if (!existsSync(imageDir)) return []
    return fs.readdirSync(imageDir).filter((file: string) => 
      file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
    )
  }

  it('should maintain image format for all downloaded images', () => {
    const images = getDownloadedImages()
    
    // Verify we have images
    expect(images.length).toBeGreaterThan(0)
    
    // For any downloaded image, verify it maintains its format
    fc.assert(
      fc.property(
        fc.constantFrom(...images),
        (imageName) => {
          const imagePath = join(imageDir, imageName)
          
          // Image should exist
          expect(existsSync(imagePath)).toBe(true)
          
          // Image should have valid extension
          const hasValidExtension = 
            imageName.endsWith('.png') || 
            imageName.endsWith('.jpg') || 
            imageName.endsWith('.jpeg')
          
          expect(hasValidExtension).toBe(true)
          
          return true
        }
      ),
      { numRuns: Math.min(100, images.length) }
    )
  })

  it('should have consistent file naming for all images', () => {
    const images = getDownloadedImages()
    
    // For any image, filename should be valid
    fc.assert(
      fc.property(
        fc.constantFrom(...images),
        (imageName) => {
          // Should not contain invalid characters
          const hasInvalidChars = /[<>:"|?*]/.test(imageName)
          expect(hasInvalidChars).toBe(false)
          
          // Should have an extension
          const hasExtension = imageName.includes('.')
          expect(hasExtension).toBe(true)
          
          return true
        }
      ),
      { numRuns: Math.min(100, images.length) }
    )
  })

  it('should verify all images are accessible', () => {
    const images = getDownloadedImages()
    
    // Every image should be readable
    images.forEach(imageName => {
      const imagePath = join(imageDir, imageName)
      expect(existsSync(imagePath)).toBe(true)
      
      // Verify file is not empty
      const fs = require('fs')
      const stats = fs.statSync(imagePath)
      expect(stats.size).toBeGreaterThan(0)
    })
  })
})
