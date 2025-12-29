# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
yarn dev          # Start development server at http://localhost:5173
yarn build        # Type check and build for production
yarn preview      # Preview production build locally
```

### Testing
```bash
yarn test         # Run all tests once
yarn test:watch   # Run tests in watch mode for development
```

## Architecture Overview

This is a Vue 3 recreation of the B9 entertainment website with a configuration-driven architecture.

### Core Structure
- **Entry Point**: `src/main.ts` - Vue app initialization with global error handler
- **Root Layout**: `src/App.vue` - Implements header/main/footer structure
- **Main Page**: `src/components/HomePage.vue` - Carousel with content sections and floating ads

### Key Architectural Patterns

1. **Configuration-Driven Design**
   - All site content and navigation defined in `src/config/siteConfig.ts`
   - Asset mappings managed in `src/config/assetManifest.ts`
   - Images use UUID-based filenames stored in `/public/assets/images/`

2. **Component System**
   - `ImageComponent.vue`: Base image with loading states and fallbacks
   - `ImageButton.vue`: Interactive buttons with hover effects
   - `HeaderComponent.vue`: Top navigation with logo and menu
   - `FooterComponent.vue`: Copyright information

3. **Composables Pattern**
   - `useImageLoader.ts`: Handles image loading with retry logic
   - Uses Vue 3 Composition API with `<script setup>` syntax

4. **Asset Management**
   - All images pre-downloaded locally
   - Centralized path mapping via asset manifest
   - Support for default/hover states and lazy loading

### Content Organization
- Navigation links external sites (Universal Browser, App, FUN Park, Partners)
- Carousel auto-rotates through 5 promotional slides (3s interval)
- Routes array provides 6 alternative URLs with rotation
- Tools section links to 6 platform-specific sites
- Floating ads provide quick access to customer service and social media

### Testing Strategy
Two complementary approaches:
1. **Unit Tests** (`/tests/unit/`): Standard component testing with Vue Test Utils
2. **Property-Based Tests** (`/tests/property/`): Advanced testing with fast-check running 100+ iterations

### Theme System
- CSS custom properties in `src/assets/styles/global.css`
- Dark theme by default (background: #16181b, primary text: #ffd08c)
- Brand colors: #ba081f (red), #8b0012 (dark red)
- Responsive breakpoints at 480px, 768px, 1024px

### TypeScript Configuration
- Strict mode enabled with comprehensive checks
- ES2020 target with bundler module resolution
- Vue JSX support configured