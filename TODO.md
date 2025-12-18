# Pouched Hydrogen - Gap Analysis & TODO

> **Generated:** 2024-12-18
> **Status:** Comprehensive gap analysis comparing `mission.md` requirements vs current implementation

## Summary

The Pouched storefront has a solid foundation with most core Shopify Hydrogen features implemented.
However, several critical features from `mission.md` are missing or incomplete.

### Implementation Status Overview

| Category | Implemented | Missing/Incomplete |
|----------|-------------|-------------------|
| Core Routes | 95% | Gift cards, wishlist page |
| Components | 95% | - |
| Integrations | 75% | Bundles builder, back-in-stock |
| SEO | 80% | Some structured data |
| Testing | 45% | Many critical components |
| Performance | 70% | SWR caching, CWV tracking |

---

## Priority 1: Compliance & Legal (CRITICAL)

### 1.1 Cookie Consent Banner (GDPR/Consent Mode v2)

**Status:** ✅ IMPLEMENTED (2024-12-18)

**Implementation:**

- Custom implementation using Radix UI primitives (no external package)
- Configurable per-market via Weaverse theme settings
- Full Google Consent Mode v2 integration
- i18n translations for EN and DE

**Files created:**

- `app/components/compliance/cookie-consent-banner.tsx`
- `app/hooks/use-cookie-consent.ts`
- `app/utils/consent-mode.ts`
- `app/utils/consent-mode.test.ts` (19 tests)
- `app/hooks/use-cookie-consent.test.ts` (17 tests)
- `app/components/compliance/cookie-consent-banner.test.tsx` (14 tests)

**Files modified:**

- `app/weaverse/schema.server.ts` - Added Cookie Consent and Age Verification groups
- `app/root.tsx` - Integrated CookieConsentBanner component
- `app/locales/en/common.json` - Added cookieConsent translations
- `app/locales/de/common.json` - Added cookieConsent translations

**Acceptance Criteria:**

- [x] Banner appears on first visit before any tracking
- [x] Granular controls for each cookie category (Functional, Analytics, Marketing)
- [x] Persists consent in localStorage with 365-day expiry (GDPR recommended)
- [x] Integrates with Google Tag Manager consent mode (Consent Mode v2)
- [x] Complies with German DSGVO requirements
- [x] Has comprehensive tests (50 tests total)

---

### 1.2 Age Verification Gate Tests

**Status:** ✅ IMPLEMENTED

---

## Priority 2: Core Commerce Features

### 2.1 Shopify Bundles - "Build Your Own" Interface

**Status:** ❌ NOT IMPLEMENTED

**Required from mission.md:**

- Fixed (pre-packaged) bundles support
- "Build Your Own" bundle builder interface
- Step-by-step selection UI

**Current state:**

- Combined listings support exists (`app/utils/combined-listings.ts`)
- Bundled variants component exists (`app/components/product/bundled-variants.tsx`)
- No "Build Your Own" builder interface

**Files to create:**

- `app/components/bundles/bundle-builder.tsx`
- `app/components/bundles/bundle-step.tsx`
- `app/components/bundles/bundle-summary.tsx`
- `app/sections/bundle-builder/index.tsx`
- `app/hooks/use-bundle-builder.ts`

**Acceptance Criteria:**

- [ ] Step-by-step product selection interface
- [ ] Visual progress indicator
- [ ] Bundle price calculation with discounts
- [ ] Add complete bundle to cart
- [ ] Integration with Shopify Bundles API
- [ ] Mobile-friendly design
- [ ] Has comprehensive tests

**Priority:** P1 - Major revenue feature

---

### 2.2 Back-in-Stock Notifications

**Status:** ❌ NOT IMPLEMENTED

**Required from mission.md:**

- Email request form for out-of-stock items

**Files to create:**

- `app/components/product/back-in-stock-form.tsx`
- `app/routes/api/back-in-stock.ts`

**Acceptance Criteria:**

- [ ] Form appears when product/variant is out of stock
- [ ] Collects email and variant information
- [ ] Integrates with Klaviyo for notification triggers
- [ ] Confirmation message on submission
- [ ] Rate limiting to prevent abuse
- [ ] Has tests

**Priority:** P1 - Reduces lost sales

---

### 2.3 Stock Urgency Indicators

**Status:** ✅ IMPLEMENTED (2024-12-18)

**Implementation:**

- Reusable `StockUrgency` component with CVA variants
- Integrated into product cards (grid/featured layouts)
- Weaverse section `mp--stock-urgency` for product page
- Uses existing i18n translations (`product.onlyXLeft`)
- Uses existing Weaverse theme settings (`lowStockBadgeEnabled`, `lowStockThreshold`, `lowStockBadgeColor`)

**Files created:**

- `app/components/product/stock-urgency.tsx`
- `app/components/product/stock-urgency.test.tsx` (17 tests)
- `app/sections/main-product/product-stock-urgency.tsx`
- `app/sections/main-product/product-stock-urgency.test.tsx` (12 tests)

**Files modified:**

- `app/components/product/product-card.tsx` - Added stock urgency to grid/featured variants
- `app/components/product/product-card.test.tsx` - Added 6 integration tests for stock urgency
- `app/sections/main-product/index.tsx` - Added `mp--stock-urgency` to childTypes
- `app/weaverse/components.ts` - Registered ProductStockUrgency component
- `tests/mocks/weaverse.tsx` - Added stock urgency settings to mock

**Acceptance Criteria:**

- [x] Shows "Only X left" when inventory < threshold
- [x] Configurable threshold via Weaverse settings
- [x] Different visual treatments (low stock, very low stock with pulse animation)
- [x] Hidden when stock is adequate
- [x] Has tests (35 tests: 17 component + 12 section + 6 product-card integration)

**Priority:** P1 - Drives urgency and conversions

---

### 2.4 Cart Gift Wrapping Option

**Status:** ⚠️ PARTIAL (Notes exist, no gift wrapping)

**Required from mission.md:**

- Gift wrapping option in cart
- Order notes/instructions

**Current state:**

- Cart notes functionality exists
- No gift wrapping checkbox or option

**Files to create/modify:**

- `app/components/cart/cart-gift-wrap.tsx`
- Modify `app/components/cart/cart-summary.tsx`

**Acceptance Criteria:**

- [ ] Gift wrap checkbox in cart
- [ ] Additional fee shown when selected
- [ ] Custom gift message field
- [ ] Cart line item attribute for gift wrap
- [ ] Has tests

**Priority:** P2 - Nice to have feature

---

### 2.5 Dynamic Cart Upsells (Intelligent Cross-sells)

**Status:** ⚠️ BASIC IMPLEMENTATION EXISTS

**Current state:**

- `app/components/cart/cart-upsells.tsx` exists
- Basic product recommendations

**Required from mission.md:**

- Intelligent cross-sells (e.g., "Pairs well with")
- Personalized recommendations

**Files to modify:**

- `app/components/cart/cart-upsells.tsx`
- `app/routes/api/cart-upsells.ts`

**Acceptance Criteria:**

- [ ] Recommendations based on cart contents
- [ ] "Pairs well with" product relationships
- [ ] Excludes products already in cart
- [ ] One-click add to cart
- [ ] A/B testing capability
- [ ] Has tests

**Priority:** P2 - Increases AOV

---

### 2.6 Wishlist Public Sharing

**Status:** ⚠️ PARTIAL (Guest wishlist works, no sharing)

**Required from mission.md:**

- Public link generation for wishlists

**Current state:**

- Wishlist with localStorage persistence (`app/components/product/wishlist-store.ts`)
- No sharing functionality

**Files to create:**

- `app/routes/wishlist/index.tsx` (dedicated wishlist page)
- `app/routes/wishlist/[id].tsx` (shared wishlist view)
- `app/routes/api/wishlist.ts` (wishlist API for sharing)

**Acceptance Criteria:**

- [ ] Dedicated wishlist page
- [ ] Generate shareable link
- [ ] View shared wishlists without login
- [ ] Merge guest wishlist on login
- [ ] Social sharing buttons
- [ ] Has tests

**Priority:** P2 - Social commerce feature

---

### 2.7 Post-Purchase Upsells

**Status:** ❌ NOT IMPLEMENTED

**Required from mission.md:**

- One-click upsells on "Thank You" page
- Account creation prompts
- Survey integration

**Files to create:**

- `app/sections/post-purchase/index.tsx`
- `app/sections/post-purchase/upsell-offer.tsx`
- `app/sections/post-purchase/create-account.tsx`

**Note:** May require Shopify Plus for checkout extensions

**Priority:** P3 - Requires checkout customization

---

## Priority 3: Search & Navigation

### 3.1 Popular & Recent Searches

**Status:** ⚠️ PARTIAL

**Required from mission.md:**

- "Popular Searches" suggestions
- "Recent Searches" history

**Current state:**

- Predictive search exists (`app/components/layout/predictive-search/`)
- `popular-keywords.tsx` exists but may not be dynamic

**Files to modify:**

- `app/components/layout/predictive-search/popular-keywords.tsx`
- `app/hooks/use-predictive-search.ts`

**Acceptance Criteria:**

- [ ] Track and display user's recent searches
- [ ] Show trending/popular searches
- [ ] Clear recent searches option
- [ ] localStorage persistence
- [ ] Has tests

**Priority:** P2 - Improves search UX

---

### 3.2 Advanced Filter Swatches

**Status:** ✅ IMPLEMENTED

Filter swatches are implemented in `app/sections/collection-filters/filter-item.tsx`

---

## Priority 4: SEO & Performance

### 4.1 Dynamic Shipping Estimates

**Status:** ⚠️ PARTIAL

**Required from mission.md:**

- Dynamic delivery dates based on user location/IP

**Current state:**

- `app/sections/main-product/product-shipping-estimate.tsx` exists
- `app/utils/date.ts` has business day calculations

**Files to modify:**

- `app/sections/main-product/product-shipping-estimate.tsx`
- May need geolocation API integration

**Acceptance Criteria:**

- [ ] Detect user location (IP-based or explicit)
- [ ] Calculate shipping time based on location
- [ ] Show estimated delivery date range
- [ ] Account for holidays and weekends
- [ ] Has tests

**Priority:** P2 - Builds trust and reduces cart abandonment

---

### 4.2 Core Web Vitals Optimization

**Status:** ⚠️ NEEDS VERIFICATION

**Required from mission.md:**

- LCP < 2.5s
- INP < 200ms
- CLS < 0.1

**Actions needed:**

- [ ] Add CWV monitoring (web-vitals library)
- [ ] Audit and optimize LCP (hero images, fonts)
- [ ] Audit INP (interaction handlers)
- [ ] Audit CLS (layout shifts)
- [ ] Image optimization audit

**Priority:** P1 - Critical for SEO rankings

---

### 4.3 Stale-While-Revalidate Caching

**Status:** ✅ IMPLEMENTED (2024-12-18)

**Implementation:**

- Comprehensive SWR cache utility system with pre-configured strategies
- Integrates with Hydrogen's built-in caching utilities (`CacheNone`, `CacheShort`, `CacheLong`, `CacheCustom`)
- Route-specific cache strategies optimized for different content types

**Cache Strategies:**

| Strategy   | max-age | stale-while-revalidate | stale-if-error | Use Case                    |
| ---------- | ------- | ---------------------- | -------------- | --------------------------- |
| homepage   | 2 min   | 10 min                 | 1 hour         | Home page with promotions   |
| product    | 5 min   | 1 hour                 | 1 day          | Product detail pages        |
| collection | 3 min   | 30 min                 | 1 hour         | Collection/category pages   |
| search     | 1 min   | 5 min                  | 30 min         | Search results              |
| api        | 1 hour  | 23 hours               | 1 day          | API endpoints (countries)   |

**Files created:**

- `app/utils/cache.test.ts` (38 tests)

**Files modified:**

- `app/utils/cache.ts` - Added comprehensive SWR utilities, strategy configs, and helper functions
- `app/routes/home.tsx` - Integrated SWR caching with `homepage` strategy
- `app/routes/products/product.tsx` - Integrated SWR caching with `product` strategy
- `app/routes/collections/collection.tsx` - Integrated SWR caching with `collection` strategy

**Acceptance Criteria:**

- [x] Implement SWR headers for product pages (5 min fresh, 1 hour SWR)
- [x] Implement SWR for collection pages (3 min fresh, 30 min SWR)
- [x] Implement SWR for homepage (2 min fresh, 10 min SWR)
- [x] Cache invalidation strategy (stale-if-error fallback)
- [x] CDN cache headers optimization (public mode with SWR directives)
- [x] Has comprehensive tests (38 tests)

**Priority:** P2 - Performance improvement

---

### 4.4 Content Security Policy

**Status:** ⚠️ BASIC EXISTS

**Current state:**

- `app/weaverse/csp.ts` exists

**Required from mission.md:**

- Strict CSP implementation

**Actions needed:**

- [ ] Audit current CSP directives
- [ ] Add missing third-party sources
- [ ] Test for CSP violations
- [ ] Report-only mode testing

**Priority:** P2 - Security best practice

---

## Priority 5: Test Coverage

### 5.1 Critical Components Missing Tests

**Compliance:**

- [ ] `app/components/compliance/age-verification-gate.test.tsx` (HIGH)

**Cart:**

- [ ] `app/components/cart/cart-container.test.tsx` (exists but verify)

**Product:**

- [ ] `app/components/product/add-to-cart-button.test.tsx`
- [ ] `app/components/product/variant-selector.test.tsx`
- [ ] `app/components/product/quick-shop.test.tsx`

**Layout:**

- [ ] `app/components/layout/predictive-search/index.test.tsx`
- [ ] `app/components/layout/footer.test.tsx`

**Root:**

- [ ] `app/components/root/newsletter-popup.test.tsx` (HIGH)
- [ ] `app/components/root/generic-error.test.tsx`

---

### 5.2 Utilities Missing Tests

- [ ] `app/utils/judgeme.test.ts`
- [ ] `app/utils/structured-data.test.ts`
- [ ] `app/utils/weaverse.test.ts`
- [ ] `app/utils/misc.test.ts`
- [ ] `app/utils/featured-products.test.ts`
- [ ] `app/utils/combined-listings.test.ts`
- [x] `app/utils/cache.test.ts` (38 tests)
- [ ] `app/utils/locale.test.ts`

---

### 5.3 Hooks Missing Tests

- [ ] `app/hooks/use-animation.test.ts`
- [ ] `app/hooks/use-recently-viewed.test.ts`
- [ ] `app/hooks/use-shop-menu.test.ts`
- [ ] `app/hooks/use-prefix-path-with-locale.test.ts`
- [ ] `app/hooks/use-predictive-search.test.ts`
- [ ] `app/hooks/use-weaverse-studio-check.test.ts`
- [ ] `app/hooks/use-closest-weaverse-item.test.ts`

---

### 5.4 E2E Test Coverage

**Current state:** Basic E2E tests exist in `tests/e2e/`

**Missing scenarios:**

- [ ] Age verification flow
- [ ] Add to wishlist flow
- [ ] Newsletter signup flow
- [ ] Filter and sort products
- [ ] Search functionality
- [ ] Account creation and login
- [ ] Subscription product purchase
- [ ] Quantity break pricing

---

## Priority 6: Nice-to-Have Features

### 6.1 Product Comparison

- [ ] Compare products side-by-side
- [ ] Compare up to 3-4 products
- [ ] Feature comparison table

### 6.2 Gift Cards

- [ ] Gift card purchase
- [ ] Gift card balance check
- [ ] Gift card redemption

### 6.3 Loyalty Program

- [ ] Points system
- [ ] Rewards tiers
- [ ] Points redemption

### 6.4 Referral Program

- [ ] Referral links
- [ ] Referral rewards
- [ ] Referral tracking

### 6.5 Product Reviews - Photo/Video Upload

**Current state:** Judge.me integration exists
**Missing:** Photo/video upload in review form

---

## Implementation Checklist

### Phase 1: Compliance (Week 1)

- [x] Cookie consent banner with GDPR compliance
- [ ] Age verification tests
- [ ] CSP audit and hardening

### Phase 2: Core Commerce (Week 2-3)

- [ ] Back-in-stock notifications
- [x] Stock urgency indicators
- [ ] Cart gift wrapping
- [ ] Enhanced cart upsells

### Phase 3: SEO & Performance (Week 4)

- [ ] Core Web Vitals monitoring
- [x] SWR caching implementation
- [ ] Dynamic shipping estimates
- [ ] Structured data audit

### Phase 4: Test Coverage (Ongoing)

- [ ] Critical component tests
- [ ] Utility function tests
- [ ] Hook tests
- [ ] E2E test expansion

### Phase 5: Advanced Features (Future)

- [ ] Bundle builder interface
- [ ] Wishlist sharing
- [ ] Popular/Recent searches
- [ ] Post-purchase upsells

---

## Files Reference

### Existing Test Files

```text
app/components/button.test.tsx
app/components/cart/cart-container.test.tsx
app/components/cart/cart-content.test.tsx
app/components/cart/cart-drawer.test.tsx
app/components/cart/cart-line-item.test.tsx
app/components/cart/cart-line-qty-adjust.test.tsx
app/components/cart/cart-upsells.test.tsx
app/components/cart/free-shipping-progress.test.ts
app/components/compliance/cookie-consent-banner.test.tsx
app/components/filters/products-pagination.test.tsx
app/components/link.test.tsx
app/components/modal.test.tsx
app/components/product/product-card.test.tsx
app/components/product/product-facts-table.test.tsx
app/components/product/product-image.test.tsx
app/components/product/quantity-break-button.test.tsx
app/components/product/quantity-break-selector.test.tsx
app/components/product/quantity.test.tsx
app/components/product/selling-plan-selector.test.tsx
app/components/product/stock-urgency.test.tsx
app/components/product/wishlist-button.test.tsx
app/components/title.test.tsx
app/hooks/use-age-verification.test.ts
app/hooks/use-cookie-consent.test.ts
app/hooks/use-media-query.test.ts
app/utils/cache.test.ts
app/utils/cn.test.ts
app/utils/consent-mode.test.ts
app/utils/date.test.ts
app/utils/image.test.ts
app/utils/metafields.test.ts
app/utils/product.test.ts
app/utils/text.test.ts
```

### Key Files to Modify/Create

```text
DONE: app/components/compliance/cookie-consent-banner.tsx
DONE: app/components/compliance/cookie-consent-banner.test.tsx
DONE: app/hooks/use-cookie-consent.ts
DONE: app/hooks/use-cookie-consent.test.ts
DONE: app/utils/consent-mode.ts
DONE: app/utils/consent-mode.test.ts
NEW: app/components/compliance/age-verification-gate.test.tsx
NEW: app/components/product/back-in-stock-form.tsx
DONE: app/components/product/stock-urgency.tsx
DONE: app/components/product/stock-urgency.test.tsx
DONE: app/sections/main-product/product-stock-urgency.tsx
DONE: app/sections/main-product/product-stock-urgency.test.tsx
NEW: app/components/cart/cart-gift-wrap.tsx
NEW: app/components/bundles/bundle-builder.tsx
NEW: app/routes/wishlist/index.tsx
NEW: app/routes/api/back-in-stock.ts
MODIFY: app/components/cart/cart-upsells.tsx
MODIFY: app/components/layout/predictive-search/popular-keywords.tsx
MODIFY: app/sections/main-product/product-shipping-estimate.tsx
DONE: app/utils/cache.ts
DONE: app/utils/cache.test.ts
```

---

## Notes

- All new features must follow TDD approach (tests first)
- All components must be Weaverse-compatible with proper schema exports
- All text must be i18n-ready (DE/EN)
- Mobile-first responsive design required
- Accessibility (a11y) must be maintained with Radix UI primitives
