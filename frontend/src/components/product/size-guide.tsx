import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const measurements = [
  { size: "S", bust: "34", waist: "28", hip: "38", length: "42" },
  { size: "M", bust: "36", waist: "30", hip: "40", length: "43" },
  { size: "L", bust: "38", waist: "32", hip: "42", length: "44" },
  { size: "XL", bust: "40", waist: "34", hip: "44", length: "45" },
  { size: "XXL", bust: "42", waist: "36", hip: "46", length: "46" },
]

export function SizeGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Size Guide</CardTitle>
        <CardDescription>All measurements are in inches</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-medium">Size</th>
                <th className="text-left py-2 pr-4 font-medium">Bust</th>
                <th className="text-left py-2 pr-4 font-medium">Waist</th>
                <th className="text-left py-2 pr-4 font-medium">Hip</th>
                <th className="text-left py-2 font-medium">Length</th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((row) => (
                <tr key={row.size} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{row.size}</td>
                  <td className="py-2 pr-4 text-zinc-600">{row.bust}</td>
                  <td className="py-2 pr-4 text-zinc-600">{row.waist}</td>
                  <td className="py-2 pr-4 text-zinc-600">{row.hip}</td>
                  <td className="py-2 text-zinc-600">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-400 mt-3">
          This is a general guide. Fit may vary by style. For the best fit, compare with a similar garment that fits you well.
        </p>
      </CardContent>
    </Card>
  )
}
