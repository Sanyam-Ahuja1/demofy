# Farmer-Dairy - Fresh Organic Farm Products E-Commerce

A production-grade, SEO-first e-commerce frontend built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## ✨ Features

- ✅ **SEO-Optimized**: JSON-LD structured data, dynamic metadata, semantic HTML
- ✅ **Cart Management**: Persistent cart with localStorage
- ✅ **Search & Filter**: Real-time product search with category navigation
- ✅ **Responsive Design**: Mobile-first, works on all screen sizes
- ✅ **Platform-Agnostic**: Designed for easy React Native (Expo) migration
- ✅ **Backend-Ready**: Mock data layer easily swappable with real APIs

## 📁 Project Structure

```
Website/
├── src/
│   ├── app/              # Next.js pages (App Router)
│   ├── ui/
│   │   ├── primitives/   # Platform-agnostic components
│   │   └── components/   # Web-specific components
│   ├── core/
│   │   ├── hooks/        # Business logic hooks
│   │   ├── data/         # Mock data layer
│   │   ├── lib/          # Utilities
│   │   └── config/       # SEO & environment config
│   └── styles/           # Global styles
└── public/               # Static assets
```

## 🎨 Design System

- **Colors**: Vibrant greens (primary), yellows (secondary)
- **Typography**: Inter (body), Outfit (headings)
- **Spacing**: Tailwind defaults (4px grid)

## 📖 Documentation

- **[ARCHITECTURE.md](file:///home/samito/Downloads/Farmer-Dairy/ARCHITECTURE.md)** - Complete architecture guide
- **[Walkthrough](file:///home/samito/.gemini/antigravity/brain/de1df98b-5d8d-4834-9b58-1b47a670c9c8/walkthrough.md)** - Project summary and implementation details

## 🔌 Backend Integration

1. Set up your API backend
2. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```
3. Modify `src/core/data/dataService.ts` to use real endpoints

## 📱 Expo Migration

See [ARCHITECTURE.md](file:///home/samito/Downloads/Farmer-Dairy/ARCHITECTURE.md#expo-migration-guide) for step-by-step guide to port to React Native.

## 🛠️ Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm start          # Start production server
npm run lint       # Run ESLint
```

## 📝 Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=
```

## 🎯 Tech Stack

- Next.js 14+ (App Router)
- TypeScript (Strict Mode)
- Tailwind CSS
- React Context (State Management)

## 📄 License

Private project - Farmer-Dairy E-Commerce Platform

## 💬 Support

For questions: support@Farmer-Dairy.com
