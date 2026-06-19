# Viraasat — Development Protocol

## Core Principles

1. **One step at a time** — Never write multiple features before testing. Complete one piece before moving to the next.
2. **No hallucination** — Every file, function, and config is explicitly planned before writing. No guessing.
3. **Security by design** — Every feature is reviewed for vulnerabilities before being marked done.
4. **Verify before continue** — Each step must pass verification (lint, type check, basic test) before the next begins.
5. **You are the decider** — I propose, you approve. Nothing gets coded without your sign-off on the plan.

---

## Development Phases

### Phase 0: Setup & Scaffold
- Initialize Next.js frontend + FastAPI backend in monorepo
- Configure Supabase project (DB, Auth, Storage)
- Set up environment variables, linting, type checking
- Verify project boots successfully

### Phase 1: Database & Auth
- Design Supabase schema (users, products, categories, orders, etc.)
- Set up Supabase Auth (email/password or OTP)
- Write FastAPI models and migrations
- Verify: can register, login, and query empty tables

### Phase 2: Product Catalog
- Seed sample products (kurtis with images, sizes, colors, prices)
- Build public product listing page (Next.js)
- Build product detail page with size guide
- Verify: browse products, filter, view details

### Phase 3: Cart & Wishlist
- Add to cart (local or DB-backed)
- Wishlist (persisted per user)
- Cart page with quantity updates
- Verify: add/remove items, wishlist toggle

### Phase 4: Checkout & Payments
- Razorpay integration
- Order creation flow
- Address management
- Order confirmation page
- Verify: end-to-end payment flow in test mode

### Phase 5: Order Tracking
- Order status updates (placed, shipped, delivered)
- Customer order history page
- Track order by order ID (no login required for tracking)
- Verify: status updates reflect correctly

### Phase 6: Admin Panel
- Product CRUD (add/edit/delete kurtis)
- Order management (view, update status)
- Customer management
- Dashboard with basic analytics
- Verify: admin actions reflected on storefront

### Phase 7: Customer Reviews
- Review submission per product
- Average rating display
- Moderation queue in admin panel
- Verify: reviews appear after approval

### Phase 8: Polish & Deploy
- Responsive design audit
- SEO meta tags for all product pages
- Error boundaries and loading states
- Deploy frontend to Vercel, backend to Render/Railway
- Verify: live site works end-to-end

---

## Security Checklist (every feature)

- [ ] No SQL injection (use parameterized queries / ORM)
- [ ] No XSS (escape user input, use CSP headers)
- [ ] Auth required for protected routes
- [ ] API rate limiting considered
- [ ] Environment variables for secrets (never hardcoded)
- [ ] File upload validation (type, size, scan)
- [ ] Payment flow uses server-side verification
- [ ] CORS configured correctly
- [ ] Error messages don't leak internals

---

## How We Work

1. I **propose** the next step with a clear plan
2. You **review** and **approve** or **adjust**
3. I **write code** for that step only
4. You **test / verify** (or I run verification commands)
5. Once verified, we **commit** and move to next step

No step is too small. If something is unclear, we stop and clarify.

---

## File Structure (agreed)

```
viraasat/
├── frontend/          # Next.js + Tailwind
├── backend/           # FastAPI + Python
└── PROTOCOL.md        # This file
```
