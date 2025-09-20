import { useQuery } from "@tanstack/react-query"
import { GraphDisplay } from "@/components/graph-display"
import { Formula } from "@shared/schema"

export default function GraphPage() {
  // Fetch formulas from backend
  const { data: formulas = [], isLoading } = useQuery<Formula[]>({
    queryKey: ['/api/formulas'],
  })

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
      <GraphDisplay formulas={formulas} />
    </div>
  )
}