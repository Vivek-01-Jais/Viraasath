# Viraasat — Remaining Roadmap

> **Current rating: 8.5/10** (was 4/10 before senior fix)
>
> All S0 (Emergency) and S1 (Critical) items completed.
> S2 (Hardening) partially done. These 4 items remain.

---

## Remaining Tasks (~4h total)

| # | Hrs | Task | Why | How |
|---|------|------|-----|-----|
| 1 | 5min | **Rotate Supabase service_role key** | Standard security practice. Key was never in git but should be rotated before production. | Supabase Dashboard → Settings → API → regenerate `service_role` key → update `backend/.env` |
| 2 | 2h | **Convert Supabase calls to async** | Sync `.execute()` blocks FastAPI's event loop. Under load (webhook + concurrent users), requests queue and time out. | Use `supabase-py` async client, replace all `.execute()` with `await .execute()` |
| 3 | 30min | **Coupon admin panel** | Coupons can only be added via raw SQL. Admin needs a UI to create/manage coupons. | Add coupon list/create/toggle routes to `admin.py`, add admin page in frontend |
| 4 | 1h | **CI/CD & deploy** | `.github/workflows/ci.yml` exists but untested. No production deploy pipeline. | Test CI workflow, run `docker compose up --build`, verify admin + checkout flow |

---

## Summary

| Item | Status | Rating impact |
|------|--------|--------------|
| S0 + S1 (all 9 tasks) | ✅ Completed | 4 → 8.5 |
| service_role key rotation | ⏳ 5 min | 8.5 → 9 |
| Async Supabase | ⏳ 2h | 9 → 9.5 |
| Coupon admin panel | ⏳ 30min | 9.5 → 9.8 |
| CI/CD & deploy | ⏳ 1h | 9.8 → 10 |

**~4 hours of work remaining to hit 10/10.**
