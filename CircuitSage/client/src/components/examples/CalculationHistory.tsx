import { CalculationHistory } from "@/components/calculation-history"

export default function CalculationHistoryExample() {
  // Mock calculation history for demonstration
  const mockCalculations = [
    {
      id: "1",
      formulaId: "ohms-law",
      inputs: '{"I": 2, "R": 10}',
      result: 20,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      formula: {
        id: "ohms-law",
        name: "Ohm's Law",
        formula: "I * R",
        description: "Voltage calculation",
        category: "Basic Electronics",
        variables: ["I", "R"]
      }
    },
    {
      id: "2",
      formulaId: "power-calc",
      inputs: '{"V": 12, "I": 0.5}',
      result: 6,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      formula: {
        id: "power-calc",
        name: "Power Calculation",
        formula: "V * I",
        description: "Power from voltage and current",
        category: "Power Calculations",
        variables: ["V", "I"]
      }
    },
    {
      id: "3",
      formulaId: "rc-time",
      inputs: '{"R": 1000, "C": 0.000001}',
      result: 0.001,
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      formula: {
        id: "rc-time",
        name: "RC Time Constant",
        formula: "R * C",
        description: "Time constant for RC circuit",
        category: "AC Analysis",
        variables: ["R", "C"]
      }
    }
  ]

  const handleClear = () => {
    console.log("Clearing calculation history")
  }

  const handleExport = () => {
    console.log("Exporting calculation history")
  }

  const handleRerun = (calculation: any) => {
    console.log("Rerunning calculation:", calculation.id)
  }

  return (
    <div className="p-4 max-w-4xl">
      <h2 className="text-lg font-semibold mb-4">Calculation History Demo</h2>
      <CalculationHistory
        calculations={mockCalculations}
        onClear={handleClear}
        onExport={handleExport}
        onRerun={handleRerun}
      />
    </div>
  )
}