import { FormulaEditor } from "@/components/formula-editor"

export default function FormulaEditorExample() {
  // Mock data for demonstration
  const mockFormula = {
    id: "1",
    name: "Ohm's Law",
    formula: "V = I * R",
    description: "Calculates voltage given current and resistance",
    category: "Basic Electronics",
    variables: ["V", "I", "R"]
  }

  const handleSave = (formula: any) => {
    console.log("Formula saved:", formula)
  }

  const handleCancel = () => {
    console.log("Formula editing cancelled")
  }

  return (
    <div className="p-4 max-w-4xl">
      <h2 className="text-lg font-semibold mb-4">Formula Editor Demo</h2>
      <FormulaEditor 
        formula={mockFormula}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}