# Agent Mission

**Objective:** Build a B2C Shopify Hydrogen Storefront selling Swedish tobacco-free snus (all-white snus) to the German market.

## Description

We're building a direct to consumer e-commerce store named "Pouched" selling Swedish tobacco-free snus (all-white snus) to the German market. The store will be built using Shopify Hydrogen (v2025.7.0) with React Router v7, using the `@weaverse/pilot` template as a starting point. Our primary goal is to build a storefront that ranks the highest possible in Google and other search engines while also being the best experience possible for the customer.

## Success Criteria


### Core Functionality
- ALL Shopify hydrogen routes are implemented.
- Components are modular, reusable, and strictly typed (TypeScript).
- Styled with Tailwind CSS v4 using semantic class names and CVA (Class Variance Authority).
- Common code is extracted into shared utilities and hooks.
- Theming is completely user-configurable via Weaverse (not hardcoded).
- Fully internationalized (i18n) text content.

### Critical Features
- **Integrations**:
  - **Judge.me Product Reviews**:
    - Widgets: Review Carousel, Star Ratings on cards, Verified Badge.
    - Functionality: Review submission form with photo/video support.
  - **Shopify Bundles**:
    - Logic: Support for both Fixed (pre-packaged) and "Build Your Own" bundles.
    - UI: Bundle builder interface with step-by-step selection.
  - **Subscription Selling Plans** (Shopify/Recharge compatible):
    - Options: Delivery frequencies (e.g., Weekly, Monthly).
    - Incentives: Subscription-specific discounts (e.g., "Subscribe & Save 10%").
  - **Quantity-based price breaks**:
    - Visuals: Tiered pricing table on PDP (Buy 1, Buy 5, Buy 10).
    - Logic: Auto-apply best price in cart.
  - **Klaviyo** (Email/SMS Marketing & Flows):
    - Triggers: "Added to Cart", "Viewed Product", "Started Checkout".
    - Capture: Newsletter forms sync to specific lists (News, VIP).
- **Compliance & Trust**:
  - **Age Verification Gate (18+)**:
    - Behavior: Strict modal on first visit. Persist verification in session/cookie.
    - Compliance: Must block access to site content until verified.
  - **Cookie Consent** (GDPR/Consent Mode v2):
    - Granularity: Distinct opt-ins for Marketing, Analytics, and Functional cookies.
    - Interactivity: "Accept All", "Reject All", "Manage Preferences".
- **Cart & Conversion**:
  - **Cart**:
    - **Free Shipping Progress Bar**: Dynamic calculation based on cart subtotal vs threshold.
    - **Dynamic Upsells**: Intelligent cross-sells (e.g., "Pairs well with") inside the cart.
    - **Gift Wrapping/Notes**: Optional inputs for order instructions.
  - **Post-purchase experience**:
    - Offers: One-click upsells on the "Thank You" page.
    - Retention: Account creation prompts and survey integration.
- **Commerce**:
  - **Wishlist**:
    - Behavior: Guest wishlist (local storage) merging into Account wishlist on login.
    - Sharing: public link generation for lists.
  - **Advanced Search**:
    - Predictive: Real-time results for Products, Collections, and Articles as user types.
    - Suggestions: "Popular Searches" and "Recent Searches" history.
  - **Filtering & Navigation**:
    - Facets: Filter by Vendor, Price (Range slider), Availability, and Metafields.
    - Swatches: Visual color/pattern selectors for filter options.
  - **Product Experience**:
    - **Recommendation Engine**: "You may also like" and "Recently Viewed" carousels.
    - **Stock Urgency**: Visual indicators (e.g., "Only 3 left") for low-stock items.
    - **Shipping Estimates**: Dynamic delivery dates based on user location/IP.
    - **Back-in-stock**: Email request form for OOS items.
    - **Attribute Pills**: Dynamic metafield pills (e.g., "Strong", "Mint", "Slim").

### DevOps & Infrastructure
- **Deployment**:
  - Primary: Shopify Oxygen (Worker Runtime).
  - Secondary: Netlify Edge Functions (Deno Runtime).
- **Code Quality**:
  - Linting & Formatting: **Biome** (Strict rules).
  - Type Safety: TypeScript (Strict mode).
- **Testing**:
  - E2E: Playwright (Critical Path Coverage).
  - Unit: Vitest (Complex business logic).

### Performance & Security
- **Core Web Vitals**: Achieve 'Good' status (LCP < 2.5s, INP < 200ms, CLS < 0.1).
- **Optimization**:
  - Stale-While-Revalidate caching strategy for high-traffic routes.
  - Content sanitization to prevent hydration mismatches.
- **Security**: Strict Content Security Policy (CSP) implementation.

### SEO & Design
- **SEO**: Public pages feature comprehensive structured data (JSON-LD) and perfect semantic HTML.
- **UX/UI**: Mobile-first, premium design suitable for a top-tier e-commerce brand.
