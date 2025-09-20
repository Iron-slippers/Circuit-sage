import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CalculationHistory } from "@/components/calculation-history"
import { Calculation, Formula } from "@shared/schema"
import { apiRequest } from "@/lib/queryClient"

export default function HistoryPage() {
  const queryClient = useQueryClient()

  // Fetch calculations from backend
  const { data: rawCalculations = [], isLoading } = useQuery<Calculation[]>({
    queryKey: ['/api/calculations'],
  })

  // Fetch formulas to join with calculations
  const { data: formulas = [] } = useQuery<Formula[]>({
    queryKey: ['/api/formulas'],
  })

  // Join calculations with formulas
  const calculations = rawCalculations.map(calc => ({
    ...calc,
    formula: formulas.find(f => f.id === calc.formulaId)
  }))

  // Clear calculations mutation
  const clearCalculationsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/calculations', {
        method: 'DELETE'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calculations'] })
    }
  })

  const handleClear = () => {
    clearCalculationsMutation.mutate()
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(calculations, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `electronics-calculations-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleRerun = (calculation: any) => {
    console.log('Rerunning calculation:', calculation.formula?.name)
    // In a real app, this would navigate to calculator with pre-filled values
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading calculation history...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <CalculationHistory
        calculations={calculations}
        onClear={handleClear}
        onExport={handleExport}
        onRerun={handleRerun}
      />
    </div>
  )
}