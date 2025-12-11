# Agent Mission

**Objective:** Build a B2C Shopify Hydrogen Storefront selling Swedish tobacco-free snus (all-white snus) to the German market.

## Description

We're building a direct to consumer e-commerce store named "Pouched" selling Swedish tobacco-free snus (all-white snus) to the German market. The store will be built using Shopify Hydrogen with the `@weaverse/pilot` template as a starting point. Our primary goal is to build a storefront that ranks the highest possible in Google and other search engines while also being the best experience possible for the customer.

## Success Criteria

### Core Functionality
- ALL Shopify hydrogen routes are implemented.
- Components are modular, reusable, and strictly typed.
- Common code is extracted into shared utilities and hooks.
- Theming is completely user-configurable via Weaverse (not hardcoded).
- Fully internationalized (i18n) text content.

### Critical Features
- **Integrations**:
  - Judge.me Product Reviews.
  - Shopify Bundles.
  - Subscription Selling Plans (Shopify/Recharge compatible).
  - Quantity-based price breaks (visualized & functional).
- **Commerce**:
  - Wishlist feature with sharing capabilities.
  - Advanced Search with filtering and real-time suggestions.
  - Product recommendation components.

### Performance & Security
- **Core Web Vitals**: Achieve 'Good' status (LCP < 2.5s, INP < 200ms, CLS < 0.1).
- **Caching**: Implement Stale-While-Revalidate strategy for high-traffic routes.
- **Security**: Strict Content Security Policy (CSP) implementation.

### Quality Assurance
- **Testing**: 100% Critical Path Coverage (E2E) and Unit Tests for complex business logic.
- **Accessibility**: WCAG 2.1 AA Compliance (Keyboard navigation, Screen reader support, Color contrast).
- **Resilience**: Global error boundaries and graceful degradation.

### SEO & Design
- **SEO**: Public pages feature comprehensive structured data (JSON-LD) and perfect semantic HTML.
- **UX/UI**: Mobile-first, responsive, and premium design suitable for a top-tier e-commerce brand.
