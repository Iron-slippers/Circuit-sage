import { Calculator } from "@/components/calculator"

export default function CalculatorExample() {
  // Mock formulas for demonstration
  const mockFormulas = [
    {
      id: "1",
      name: "Ohm's Law",
      formula: "I * R",
      description: "Calculates voltage from current and resistance",
      category: "Basic Electronics",
      variables: ["I", "R"]
    },
    {
      id: "2", 
      name: "Power Calculation",
      formula: "V * I",
      description: "Calculates power from voltage and current",
      category: "Power Calculations",
      variables: ["V", "I"]
    },
    {
      id: "3",
      name: "RC Time Constant",
      formula: "R * C",
      description: "Time constant for RC circuit",
      category: "AC Analysis",
      variables: ["R", "C"]
    }
  ]

  const handleCalculate = (result: any) => {
    console.log("Calculation performed:", result)
  }

  return (
    <div className="p-4 max-w-4xl">
      <h2 className="text-lg font-semibold mb-4">Calculator Demo</h2>
      <Calculator 
        formulas={mockFormulas}
        onCalculate={handleCalculate}
      />
    </div>
  )
}