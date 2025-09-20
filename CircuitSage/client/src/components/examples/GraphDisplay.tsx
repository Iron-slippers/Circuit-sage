import { GraphDisplay } from "@/components/graph-display"

export default function GraphDisplayExample() {
  // Mock formulas for demonstration
  const mockFormulas = [
    {
      id: "1",
      name: "Linear Relationship",
      formula: "m * x + b",
      description: "Linear equation y = mx + b",
      category: "Basic Mathematics",
      variables: ["m", "x", "b"]
    },
    {
      id: "2",
      name: "Quadratic Function",
      formula: "a * x^2 + b * x + c",
      description: "Quadratic equation",
      category: "Basic Mathematics", 
      variables: ["a", "x", "b", "c"]
    },
    {
      id: "3",
      name: "Exponential Growth",
      formula: "a * exp(b * x)",
      description: "Exponential function",
      category: "Advanced Mathematics",
      variables: ["a", "b", "x"]
    }
  ]

  return (
    <div className="p-4 max-w-6xl">
      <h2 className="text-lg font-semibold mb-4">Graph Display Demo</h2>
      <GraphDisplay formulas={mockFormulas} />
    </div>
  )
}