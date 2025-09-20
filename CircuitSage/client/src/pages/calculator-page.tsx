import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Calculator } from "@/components/calculator"
import { Formula } from "@shared/schema"
import { apiRequest } from "@/lib/queryClient"

export default function CalculatorPage() {
  const queryClient = useQueryClient()

  // Fetch formulas from backend
  const { data: formulas = [], isLoading } = useQuery<Formula[]>({
    queryKey: ['/api/formulas'],
  })

  // Calculate mutation that calls backend
  const calculateMutation = useMutation({
    mutationFn: async (data: { formulaId: string; inputs: Record<string, number> }) => {
      return apiRequest('/api/calculate', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      })
    },
    onSuccess: () => {
      // Invalidate calculations to refresh history
      queryClient.invalidateQueries({ queryKey: ['/api/calculations'] })
    }
  })

  const handleCalculate = (result: any) => {
    calculateMutation.mutate({
      formulaId: result.formula.id!,
      inputs: result.inputs
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading formulas...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Calculator 
        formulas={formulas}
        onCalculate={handleCalculate}
      />
    </div>
  )
}