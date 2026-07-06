# Viraasath — Complete Production Roadmap

**Current score: 7.5/10 → Target: 10/10**

---

## Phase A — Current System Verified ✅

| Check | Status |
|-------|--------|
| TypeScript (0 errors) | ✅ |
| Lint (0 errors, 0 warnings) | ✅ |
| Build (23 routes) | ✅ |
| Backend tests (20 passing) | ✅ |
| Security audit (60+ issues found, critical fixed) | ✅ |
| Vercel frontend live | ✅ `https://viraasath.vercel.app` |
| Render backend live | ✅ `https://viraasath.onrender.com` |
| Coupon system (VIRASAT10) | ✅ Working |
| JWT auth on all routes | ✅ |
| Rate limiting (signup/login/checkout) | ✅ |
| Sentry error tracking | ✅ Configured |

---

## Phase B — Critical Fixes (Do First, ~6h)

### B1. Inventory / Stock Tracking (3h)
**Why:** Customers can buy out-of-stock items. Money collected, order confirmed, no stock to ship.
**How:**
- Add `stock` column to `product_variants` table
- Add `track_inventory` boolean to `products` table
- On order placement: decrement stock, raise error if insufficient
- Show stock status on product page ("Only 2 left!")
- Admin panel: show/edit stock per variant

### B2. Frontend Tests (2h)
**Why:** One bad deploy can break checkout silently — no safety net.
**How:**
- Set up Vitest + React Testing Library
- Test: cart store (add/remove/merge), auth context, checkout flow
- Test: coupon calculation, shipping logic
- Target: 20+ frontend tests

### B3. Backend Error Handling (1h)
**Why:** Admin CRUD endpoints have no try/except — any Supabase failure returns generic 500.
**How:**
- Add try/except to all admin endpoints (18 endpoints)
- Add proper error logging
- Add try/except to auth signup/login

---

## Phase C — Feature Completion (~10h)

### C4. Order Status Workflow (3h)
**Why:** Orders stuck at "confirmed" forever — no "shipped/delivered/cancelled" flow.
**How:**
- Add status list: `pending → confirmed → shipped → delivered`
- Add cancelled/returned statuses
- Admin: change order status from admin panel
- User: see status timeline on order page
- Email/SMS notification on status change

### C5. Tax Calculation (1h)
**Why:** ₹0 tax is not legally compliant for India (GST 5%/12%/18%).
**How:**
- Add GST slab to products (`tax_rate` field)
- Calculate tax on order placement
- Show GST breakdown in order summary and invoice

### C6. Custom 404 & Error Pages (1h)
**Why:** Users see Vercel's default error page — looks unprofessional.
**How:**
- Create `not-found.tsx` (404) and `error.tsx` (500) pages
- Add proper styling matching brand
- Redirect broken links gracefully

### C7. Loading Skeletons (1h)
**Why:** Pages flash empty → content (bad UX, feels slow).
**How:**
- Add skeleton components for: product grid, product detail, cart, orders
- Add to checkout page during address/cart loading

### C8. Order Confirmation Email (1h)
**Why:** Basic email — no branding, no item images, no tracking link.
**How:**
- Improve email template with product thumbnails
- Add order tracking link
- Add brand colors and logo
- Add delivery estimate

### C9. Contact / Support Channel (1h)
**Why:** No way for customers to reach you.
**How:**
- Add "Contact Us" page with form
- Send inquiries to your email
- Add WhatsApp button (wa.me link)
- Add phone number to footer

### C10. Analytics (2h)
**Why:** You're flying blind — no idea what sells, conversion rate, etc.
**How:**
- Add Google Analytics 4 (GA4) or PostHog (free)
- Track: page views, add-to-cart, checkout start, purchase
- Track: coupon usage, search queries
- Dashboard: basic sales metrics in admin

---

## Phase D — Production Polish (~8h)

### D11. Abandoned Cart Recovery (2h)
**Why:** Recover ~15% of lost sales automatically.
**How:**
- Track cart abandonment (items in cart > 30 min, no checkout)
- Send email reminder after 1 hour
- Offer small discount to complete purchase

### D12. Wishlist Notifications (1h)
**Why:** Notify users when wishlisted item goes on sale or back in stock.
**How:**
- Backend: track price changes on wishlisted products
- Email/push notification on price drop or stock arrival

### D13. Product Reviews with Photos (2h)
**Why:** Photo reviews increase conversion by 30%.
**How:**
- Allow image upload in review form
- Display review photos in product gallery
- Moderate photos in admin panel

### D14. Search Autocomplete (1h)
**Why:** Users expect instant search suggestions.
**How:**
- Use Supabase full-text search (already set up in migration 001)
- Add debounced search dropdown to header
- Show product names + prices + images

### D15. Size Chart on Product Page (1h)
**Why:** Reduces returns from wrong size selection.
**How:**
- Add size chart modal on product page
- Store size chart per category or product
- Show measurements table

### D16. Bulk Order / Wholesale (1h)
**Why:** Wholesale buyers want quantity pricing.
**How:**
- Add "Enquire for bulk orders" button
- Send inquiry to admin email
- Track inquiries in admin panel

---

## Phase E — Advanced Features (~8h)

### E17. Multi-Language Support (3h)
**Why:** Reach Hindi/regional language customers.
**How:**
- Set up next-intl for i18n
- Translate: product names, descriptions, checkout flow
- Language switcher in header

### E18. PWA / Offline Support (2h)
**Why:** Mobile users get app-like experience.
**How:**
- Register service worker (next-pwa or workbox)
- Cache product pages for offline viewing
- Add "Add to Home Screen" prompt

### E19. Return / Refund Flow (2h)
**Why:** Customers need to know they can return items.
**How:**
- Add return policy page
- Self-service return request in user account
- Admin panel to approve/reject returns
- Refund via Razorpay API

### E20. PhonePe / UPI Payments (1h)
**Why:** Indian users prefer UPI over card/NetBanking.
**How:**
- Add PhonePe/GPay as payment option
- Generate UPI QR code at checkout
- Verify payment via webhook

---

## Timeline

| Phase | Hours | Rating | Deadline |
|-------|-------|--------|----------|
| A — Verified | 0h | 7.5/10 | ✅ Done |
| B — Critical | 6h | 8.5/10 | This week |
| C — Features | 10h | 9.2/10 | Next week |
| D — Polish | 8h | 9.7/10 | Next sprint |
| E — Advanced | 8h | 10/10 | Future |

**Total: ~32h to 10/10**

---

## Current Deployment

| Service | URL | Status |
|---------|-----|--------|
| Frontend | `https://viraasath.vercel.app` | ✅ Live |
| Backend | `https://viraasath.onrender.com` | ✅ Live |
| Database | Supabase `tzdkydvsqqktdjbidzjs` | ✅ Live |
| CI/CD | `.github/workflows/ci.yml` | ✅ Configured |
| Backend sleep | UptimeRobot (setup later) | ⏳ Pending |
