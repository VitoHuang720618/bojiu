# B9 Website Recreation

A faithful recreation of the B9 website using Vue 3, Vite, and TypeScript.

## Project Structure

```
b9-website-recreation/
├── public/
│   └── assets/
│       ├── images/      # Local image assets
│       ├── fonts/       # Local font files
│       └── icons/       # Local icon files
├── src/
│   ├── assets/
│   │   └── styles/      # Global styles and CSS
│   ├── components/      # Vue components
│   ├── composables/     # Vue composables (reusable logic)
│   ├── config/          # Configuration files
│   ├── types/           # TypeScript type definitions
│   ├── App.vue          # Root component
│   └── main.ts          # Application entry point
├── tests/
│   ├── unit/            # Unit tests
│   └── property/        # Property-based tests
├── package.json
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

## Development

### Prerequisites

- Node.js 22.3.0+
- Yarn package manager

### Installation

```bash
yarn install
```

### Development Server

```bash
yarn dev
```

The application will be available at `http://localhost:5173/`

### Build

```bash
yarn build
```

### Preview Production Build

```bash
yarn preview
```

### Testing

Run all tests:
```bash
yarn test
```

Run tests in watch mode:
```bash
yarn test:watch
```

## Testing Strategy

This project uses two complementary testing approaches:

1. **Unit Tests** (Vitest + @vue/test-utils)
   - Test specific functionality and edge cases
   - Located in `tests/unit/`

2. **Property-Based Tests** (fast-check)
   - Verify universal properties across many inputs
   - Each test runs 100+ iterations with random data
   - Located in `tests/property/`

## Technology Stack

- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite 5.x
- **Package Manager**: Yarn
- **Language**: TypeScript (strict mode)
- **Testing**: Vitest + fast-check
- **Styling**: CSS3 with scoped styles

## Features

- ✅ Vue 3 with TypeScript
- ✅ Vite for fast development and optimized builds
- ✅ Strict TypeScript configuration
- ✅ Unit and property-based testing
- ✅ Component-based architecture
- ✅ Local asset management
- ✅ Responsive design support

## License

Private project
