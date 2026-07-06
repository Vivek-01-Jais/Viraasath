// Build-time flag — Webpack replaces process.env.NEXT_PUBLIC_* at compile time
// This file conditionally loads demo data only when USE_DEMO=true.
// When false, the import is dead code and Webpack eliminates it from the bundle.

const IS_DEMO = process.env.NEXT_PUBLIC_USE_DEMO === "true"

type LazyModule = typeof import("@/lib/demo-data")

let _module: LazyModule | null = null

export async function getDemoModule(): Promise<LazyModule | null> {
  if (!IS_DEMO) return null
  if (!_module) {
    _module = await import("@/lib/demo-data")
  }
  return _module
}
