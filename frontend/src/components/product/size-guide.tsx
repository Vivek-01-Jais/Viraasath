const measurements = [
  { size: "S", bust: "34", waist: "28", hip: "38", length: "42" },
  { size: "M", bust: "36", waist: "30", hip: "40", length: "43" },
  { size: "L", bust: "38", waist: "32", hip: "42", length: "44" },
  { size: "XL", bust: "40", waist: "34", hip: "44", length: "45" },
  { size: "XXL", bust: "42", waist: "36", hip: "46", length: "46" },
]

export function SizeGuide() {
  return (
    <div className="border border-[#E5E0DB] dark:border-[#333] rounded-xl overflow-hidden">
      <div className="px-5 pt-5 pb-2">
        <h4 className="font-heading text-lg text-[#333] dark:text-[#F0EDE8]">Size Guide</h4>
        <p className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C] mt-1">All measurements are in inches</p>
      </div>
      <div className="overflow-x-auto px-5 pb-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E0DB] dark:border-[#333]">
              <th className="text-left py-2 pr-4 font-heading text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.1em]">Size</th>
              <th className="text-left py-2 pr-4 font-heading text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.1em]">Bust</th>
              <th className="text-left py-2 pr-4 font-heading text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.1em]">Waist</th>
              <th className="text-left py-2 pr-4 font-heading text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.1em]">Hip</th>
              <th className="text-left py-2 font-heading text-[#800020] dark:text-[#B8860B] text-xs tracking-[0.1em]">Length</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((row) => (
              <tr key={row.size} className="border-b border-[#E5E0DB] dark:border-[#333] last:border-0">
                <td className="py-2 pr-4 font-medium text-[#333] dark:text-[#F0EDE8]">{row.size}</td>
                <td className="py-2 pr-4 text-[#6B6B6B] dark:text-[#9C9C9C]">{row.bust}</td>
                <td className="py-2 pr-4 text-[#6B6B6B] dark:text-[#9C9C9C]">{row.waist}</td>
                <td className="py-2 pr-4 text-[#6B6B6B] dark:text-[#9C9C9C]">{row.hip}</td>
                <td className="py-2 text-[#6B6B6B] dark:text-[#9C9C9C]">{row.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 pb-5">
        <p className="text-xs text-[#6B6B6B] dark:text-[#9C9C9C]">
          This is a general guide. Fit may vary by style. For the best fit, compare with a similar garment that fits you well.
        </p>
      </div>
    </div>
  )
}
