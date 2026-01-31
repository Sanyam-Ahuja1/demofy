# Farmer-Dairy

## Overview

This is a production-grade, SEO-first e-commerce frontend built with Next.js 14 (App Router), TypeScript, and Tailwind CSS. The architecture emphasizes:

- **SEO Excellence**: Server-side rendering, JSON-LD structured data, semantic HTML
- **Modularity**: Clear separation between UI primitives, business logic, and web-specific code
- **Backend-Agnosticism**: Mock data layer easily swappable with real APIs
- **Expo Migration Ready**: Platform-agnostic hooks and components designed for React Native portability

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: React Context + Hooks (no Redux)
- **Fonts**: Inter (body), Outfit (display)

## Architecture Philosophy

### 1. **Three-Layer Architecture**

```
┌─────────────────────────────────────────┐
│         Pages (App Router)              │ ← Web-specific, SEO-optimized
├─────────────────────────────────────────┤
│         UI Components                   │ ← Compose primitives
├─────────────────────────────────────────┤
│         UI Primitives                   │ ← Platform-agnostic
├─────────────────────────────────────────┤
│         Business Logic (Hooks)          │ ← No UI dependencies
├─────────────────────────────────────────┤
│         Data Layer                      │ ← Abstraction for API
└─────────────────────────────────────────┘
```

### 2. **Platform-Agnostic Patterns**

**UI Primitives** (`src/ui/primitives/`):

- Use React Native-compatible prop names (`onPress` instead of `onClick`, `onChangeText` instead of `onChange`)
- Avoid DOM-specific APIs
- Can be ported to React Native with implementation changes but same interface

**Business Logic** (`src/core/hooks/`):

- Pure business logic with zero UI dependencies
- Cart management, search, filtering
- Can be reused verbatim in React Native

**Data Layer** (`src/core/data/`):

- Abstraction layer between UI and data source
- Currently uses JSON files
- Swap with API calls by modifying `dataService.ts` only

### 3. **SEO Strategy**

| Page Type              | Rendering                   | SEO Features                        |
| ---------------------- | --------------------------- | ----------------------------------- |
| Homepage               | Client (with data fetching) | Dynamic title, product count        |
| Product Detail         | Client (with SSR patterns)  | JSON-LD Product schema, Breadcrumbs |
| Category               | SSR                         | Dynamic metadata, canonical URLs    |
| Cart/Checkout          | Client-side                 | No indexing needed                  |
| About/Contact/Policies | SSG                         | Static, fully indexed               |

**JSON-LD Schemas Implemented**:

- `Organization` (site-wide in layout)
- `WebSite` (with search functionality)
- `Product` (on product pages)
- `BreadcrumbList` (on product pages)

## Directory Structure

```
Website/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Homepage (product listing)
│   │   ├── product/[slug]/page.tsx   # Product detail page
│   │   ├── category/[slug]/page.tsx  # Category pages
│   │   ├── cart/page.tsx             # Shopping cart
│   │   ├── checkout/page.tsx         # Checkout form
│   │   ├── about/page.tsx            # About page (SSG)
│   │   ├── contact/page.tsx          # Contact form (SSG)
│   │   └── policies/                 # Policy pages (SSG)
│   │
│   ├── ui/
│   │   ├── primitives/               # Platform-agnostic components
│   │   │   ├── Button.tsx            # Button with onPress
│   │   │   ├── Card.tsx              # Container component
│   │   │   ├── Input.tsx             # Input with onChangeText
│   │   │   ├── Badge.tsx             # Status badges
│   │   │   └── Image.tsx             # Next.js Image wrapper
│   │   │
│   │   └── components/               # Web-specific components
│   │       ├── Header.tsx            # Site header
│   │       ├── Footer.tsx            # Site footer
│   │       ├── FilterBar.tsx         # Category filter
│   │       ├── ProductCard.tsx       # Product display card
│   │       └── ProductGrid.tsx       # Product grid layout
│   │
│   ├── core/
│   │   ├── hooks/                    # Business logic hooks
│   │   │   ├── useCart.ts            # Cart management
│   │   │   ├── useSearch.ts          # Search with debouncing
│   │   │   └── useLocalStorage.ts    # Storage abstraction
│   │   │
│   │   ├── data/                     # Data layer
│   │   │   ├── types.ts              # TypeScript interfaces
│   │   │   ├── products.json         # Mock product data
│   │   │   ├── categories.json       # Mock category data
│   │   │   └── dataService.ts        # Data access layer
│   │   │
│   │   ├── lib/                      # Utilities
│   │   │   └── formatting.ts         # Price, date formatters
│   │   │
│   │   └── config/                   # Configuration
│   │       ├── env.ts                # Environment variables
│   │       ├── seo.ts                # SEO config
│   │       └── metadata.ts           # Metadata generators
│   │
│   └── styles/
│       └── globals.css               # Tailwind + custom styles
│
├── public/
│   ├── robots.txt                    # SEO robots file
│   └── sitemap.xml                   # Static sitemap
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## Key Features

### Cart Management

- Context-based state management
- LocalStorage persistence
- Add, remove, update quantity operations
- Automatic total calculation

### Search & Filtering

- Real-time product search with 300ms debouncing
- Category-based filtering with URL state
- Empty state handling

### Performance & Accessibility

- Image lazy loading with Next.js Image
- Skeleton loaders prevent layout shift
- Focus states on all interactive elements
- Minimum 44px touch targets
- Semantic HTML throughout

## Expo Migration Guide

To port this to React Native (Expo):

### 1. **Primitives** (Requires Implementation Changes)

Replace web implementations with React Native equivalents:

```typescript
// Web: src/ui/primitives/Button.tsx
<button onClick={onPress} />

// React Native: mobile/src/ui/primitives/Button.tsx
<Pressable onPress={onPress} />
```

Keep the same prop interfaces (`ButtonProps`, `CardProps`, etc.)

### 2. **Hooks** (Can Reuse Directly)

Copy these verbatim:

- `useCart.ts` ✅
- `useSearch.ts` ✅

Update storage:

- Replace `useLocalStorage` with `useAsyncStorage` from `@react-native-async-storage/async-storage`

### 3. **Business Logic** (Can Reuse Directly)

- `src/core/lib/formatting.ts` ✅
- `src/core/data/types.ts` ✅
- `src/core/data/dataService.ts` ✅ (just change API URLs)

### 4. **Navigation**

Replace Next.js `<Link>` with React Navigation:

```typescript
// Web
<Link href="/product/tomatoes">

// React Native
<Pressable onPress={() => navigation.navigate('Product', { slug: 'tomatoes' })}>
```

## Backend Integration

To replace mock data with a real backend:

### 1. Update `src/core/data/dataService.ts`:

```typescript
export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${env.apiUrl}/products`);
  return response.json();
}
```

### 2. Set `NEXT_PUBLIC_API_URL` in `.env.local`

### 3. All UI and business logic remains unchanged! ✅

## Environment Variables

Required variables (set in `.env.local`):

```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Running the Project

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

## SEO Checklist

- [x] Dynamic `<title>` per page
- [x] Meta descriptions
- [x] Canonical URLs
- [x] JSON-LD structured data (Organization, Product, Breadcrumb)
- [x] Semantic HTML (`<header>`, `<main>`, `<footer>`, `<article>`)
- [x] Image `alt` attributes enforced
- [x] `robots.txt`
- [x] `sitemap.xml`
- [x] OpenGraph metadata
- [x] Twitter Card metadata

## Design Tokens

The design system uses a vibrant agricultural theme:

**Colors**:

- Primary: Green (#22c55e - organic/natural)
- Secondary: Yellow (#eab308 - sunshine/warmth)
- Neutral: Stone grays

**Typography**:

- Display: Outfit (headings)
- Body: Inter (content)

**Spacing**: Based on 4px grid (Tailwind defaults)

## Future Enhancements

1. **Dynamic Sitemap**: Generate sitemap from product/category data
2. **Image Optimization**: Add local image assets or CDN
3. **Analytics**: Add Google Analytics / Plausible
4. **PWA**: Service worker for offline cart
5. **Internationalization**: i18n support for multiple languages
6. **Reviews**: Product review system
7. **Wishlist**: Save products for later

## Testing Recommendations

### Manual Testing Checklist

- [ ] All pages load without errors
- [ ] Search filters products correctly
- [ ] Category navigation works
- [ ] Add to cart increments count
- [ ] Cart persistence across page reloads
- [ ] Checkout form validation
- [ ] Mobile responsiveness
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

### Automated Testing (To Add)

- Unit tests for hooks (`useCart`, `useSearch`)
- Component tests for primitives
- E2E tests with Playwright/Cypress

## License

This is a demonstration project for Farmer-Dairy e-commerce platform.

## Support

For questions or issues, contact: support@Farmer-Dairy.com
