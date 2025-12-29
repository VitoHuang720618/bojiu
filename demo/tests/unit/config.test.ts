import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

describe('Project Configuration', () => {
  it('should have package.json with Vue 3', () => {
    const packageJsonPath = join(process.cwd(), 'package.json')
    expect(existsSync(packageJsonPath)).toBe(true)
    
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    
    expect(packageJson.dependencies).toBeDefined()
    expect(packageJson.dependencies.vue).toBeDefined()
    expect(packageJson.dependencies.vue).toMatch(/^\^3\./)
  })

  it('should have package.json with Vite', () => {
    const packageJsonPath = join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    
    expect(packageJson.devDependencies).toBeDefined()
    expect(packageJson.devDependencies.vite).toBeDefined()
  })

  it('should have yarn.lock file', () => {
    const yarnLockPath = join(process.cwd(), 'yarn.lock')
    expect(existsSync(yarnLockPath)).toBe(true)
  })

  it('should have correct npm scripts', () => {
    const packageJsonPath = join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    
    expect(packageJson.scripts).toBeDefined()
    expect(packageJson.scripts.dev).toBeDefined()
    expect(packageJson.scripts.build).toBeDefined()
    expect(packageJson.scripts.preview).toBeDefined()
  })

  it('should have TypeScript configuration', () => {
    const tsconfigPath = join(process.cwd(), 'tsconfig.json')
    expect(existsSync(tsconfigPath)).toBe(true)
    
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'))
    expect(tsconfig.compilerOptions).toBeDefined()
    expect(tsconfig.compilerOptions.strict).toBe(true)
  })
})
