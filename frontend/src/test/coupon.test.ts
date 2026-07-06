import { describe, it, expect } from "vitest"

describe("Coupon logic", () => {
  function applyCoupon(
    couponCode: string | null,
    subtotal: number
  ): { discount: number; code: string | null } {
    if (!couponCode) return { discount: 0, code: null }
    const code = couponCode.toUpperCase()

    if (code === "VIRASAT10") {
      if (subtotal < 500) return { discount: 0, code: null }
      const raw = subtotal * 0.1
      const discount = Math.min(raw, 500)
      return { discount: Math.round(discount * 100) / 100, code }
    }

    if (code === "FLAT200") {
      if (subtotal < 1000) return { discount: 0, code: null }
      return { discount: 200, code }
    }

    return { discount: 0, code: null }
  }

  it("returns 0 for no coupon", () => {
    expect(applyCoupon(null, 1000)).toEqual({ discount: 0, code: null })
  })

  it("returns 0 for unknown coupon", () => {
    expect(applyCoupon("INVALID", 1000)).toEqual({ discount: 0, code: null })
  })

  it("applies VIRASAT10 percentage discount", () => {
    const result = applyCoupon("VIRASAT10", 2000)
    expect(result.discount).toBe(200)
    expect(result.code).toBe("VIRASAT10")
  })

  it("caps VIRASAT10 at max 500", () => {
    const result = applyCoupon("VIRASAT10", 10000)
    expect(result.discount).toBe(500)
  })

  it("rejects VIRASAT10 below min cart value", () => {
    const result = applyCoupon("VIRASAT10", 499)
    expect(result.discount).toBe(0)
    expect(result.code).toBeNull()
  })

  it("applies FLAT200 fixed discount", () => {
    const result = applyCoupon("FLAT200", 1000)
    expect(result.discount).toBe(200)
    expect(result.code).toBe("FLAT200")
  })

  it("rejects FLAT200 below min cart value", () => {
    const result = applyCoupon("FLAT200", 999)
    expect(result.discount).toBe(0)
    expect(result.code).toBeNull()
  })

  it("is case insensitive", () => {
    expect(applyCoupon("virasat10", 2000).discount).toBe(200)
    expect(applyCoupon("Virasat10", 2000).discount).toBe(200)
    expect(applyCoupon("VIRASAT10", 2000).discount).toBe(200)
  })
})
