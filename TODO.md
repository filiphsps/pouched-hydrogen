# Pouched Hydrogen - Gap Analysis & TODO

> **Generated:** 2024-12-18
> **Status:** Comprehensive gap analysis comparing `mission.md` requirements vs current implementation

## Summary

The Pouched storefront has a solid foundation with most core Shopify Hydrogen features implemented. However, several critical features from `mission.md` are missing or incomplete.

### Implementation Status Overview

| Category | Implemented | Missing/Incomplete |
|----------|-------------|-------------------|
| Core Routes | 95% | Gift cards, wishlist page |
| Components | 85% | Cookie consent, stock urgency |
| Integrations | 75% | Bundles builder, back-in-stock |
| SEO | 80% | Some structured data |
| Testing | 40% | Many critical components |
| Performance | 70% | SWR caching, CWV tracking |

---

## Priority 1: Compliance & Legal (CRITICAL)

### 1.1 Cookie Consent Banner (GDPR/Consent Mode v2)
**Status:** ❌ NOT IMPLEMENTED

**Required from mission.md:**
- Distinct opt-ins for Marketing, Analytics, and Functional cookies
- "Accept All", "Reject All", "Manage Preferences" buttons
- Google Consent Mode v2 integration

**Files to create:**
- `app/components/compliance/cookie-consent-banner.tsx`
- `app/hooks/use-cookie-consent.ts`
- `app/utils/consent-mode.ts`

**Acceptance Criteria:**
- [ ] Banner appears on first visit before any tracking
- [ ] Granular controls for each cookie category
- [ ] Persists consent in localStorage with appropriate expiry
- [ ] Integrates with Google Tag Manager consent mode
- [ ] Complies with German DSGVO requirements
- [ ] Has comprehensive tests

**Priority:** P0 - Legal requirement for EU/German market

---

### 1.2 Age Verification Gate Tests
**Status:** ⚠️ COMPONENT EXISTS, NO TESTS

**File:** `app/components/compliance/age-verification-gate.tsx`

**Required:**
- [ ] Add comprehensive unit tests for age verification
- [ ] Test localStorage persistence
- [ ] Test redirect on denial
- [ ] Test edge cases (expired verification, etc.)

**File to create:** `app/components/compliance/age-verification-gate.test.tsx`

**Priority:** P0 - Legal compliance requires reliable operation

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
**Status:** ❌ NOT IMPLEMENTED

**Required from mission.md:**
- Visual indicators (e.g., "Only 3 left") for low-stock items

**Files to create/modify:**
- `app/components/product/stock-urgency.tsx`
- Modify `app/components/product/product-card.tsx` to include urgency
- Modify `app/sections/main-product/index.tsx` to show urgency

**Acceptance Criteria:**
- [ ] Shows "Only X left" when inventory < threshold
- [ ] Configurable threshold via Weaverse settings
- [ ] Different visual treatments (low stock, very low stock)
- [ ] Hidden when stock is adequate
- [ ] Has tests

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
**Status:** ⚠️ BASIC CACHING EXISTS

**Current state:**
- Basic cache headers in `app/utils/cache.ts`
- React Router route headers

**Required from mission.md:**
- SWR caching strategy for high-traffic routes

**Files to modify:**
- `app/utils/cache.ts`
- Route loaders for collections, products, homepage

**Acceptance Criteria:**
- [ ] Implement SWR headers for product pages
- [ ] Implement SWR for collection pages
- [ ] Cache invalidation strategy
- [ ] CDN cache headers optimization

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
- [ ] `app/utils/cache.test.ts`
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
- [ ] Cookie consent banner with GDPR compliance
- [ ] Age verification tests
- [ ] CSP audit and hardening

### Phase 2: Core Commerce (Week 2-3)
- [ ] Back-in-stock notifications
- [ ] Stock urgency indicators
- [ ] Cart gift wrapping
- [ ] Enhanced cart upsells

### Phase 3: SEO & Performance (Week 4)
- [ ] Core Web Vitals monitoring
- [ ] SWR caching implementation
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
```
app/components/button.test.tsx
app/components/cart/cart-container.test.tsx
app/components/cart/cart-content.test.tsx
app/components/cart/cart-drawer.test.tsx
app/components/cart/cart-line-item.test.tsx
app/components/cart/cart-line-qty-adjust.test.tsx
app/components/cart/cart-upsells.test.tsx
app/components/cart/free-shipping-progress.test.ts
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
app/components/product/wishlist-button.test.tsx
app/components/title.test.tsx
app/hooks/use-age-verification.test.ts
app/hooks/use-media-query.test.ts
app/utils/cn.test.ts
app/utils/date.test.ts
app/utils/image.test.ts
app/utils/metafields.test.ts
app/utils/product.test.ts
app/utils/text.test.ts
```

### Key Files to Modify/Create
```
NEW: app/components/compliance/cookie-consent-banner.tsx
NEW: app/components/compliance/cookie-consent-banner.test.tsx
NEW: app/components/compliance/age-verification-gate.test.tsx
NEW: app/components/product/back-in-stock-form.tsx
NEW: app/components/product/stock-urgency.tsx
NEW: app/components/cart/cart-gift-wrap.tsx
NEW: app/components/bundles/bundle-builder.tsx
NEW: app/routes/wishlist/index.tsx
NEW: app/routes/api/back-in-stock.ts
NEW: app/hooks/use-cookie-consent.ts
MODIFY: app/components/cart/cart-upsells.tsx
MODIFY: app/components/layout/predictive-search/popular-keywords.tsx
MODIFY: app/sections/main-product/product-shipping-estimate.tsx
MODIFY: app/utils/cache.ts
```

---

## Notes

- All new features must follow TDD approach (tests first)
- All components must be Weaverse-compatible with proper schema exports
- All text must be i18n-ready (DE/EN)
- Mobile-first responsive design required
- Accessibility (a11y) must be maintained with Radix UI primitives
