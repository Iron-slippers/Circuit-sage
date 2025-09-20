import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { History, Search, Trash2, Download, Calculator } from "lucide-react"
import { Calculation, Formula } from "@shared/schema"

interface CalculationHistoryProps {
  calculations?: Array<Calculation & { formula?: Formula }>
  onClear?: () => void
  onExport?: () => void
  onRerun?: (calculation: Calculation) => void
}

export function CalculationHistory({ 
  calculations = [], 
  onClear, 
  onExport, 
  onRerun 
}: CalculationHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCalculations = calculations.filter(calc => 
    calc.formula?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    calc.formula?.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString()
    } catch {
      return timestamp
    }
  }

  const formatInputs = (inputsJson: string) => {
    try {
      const inputs = JSON.parse(inputsJson)
      return Object.entries(inputs)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ')
    } catch {
      return inputsJson
    }
  }

  const handleRerun = (calculation: Calculation) => {
    console.log('Rerun calculation:', calculation.id)
    onRerun?.(calculation)
  }

  const handleClear = () => {
    console.log('Clear calculation history')
    onClear?.()
  }

  const handleExport = () => {
    console.log('Export calculation history')
    onExport?.()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Calculation History
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleExport}
                disabled={calculations.length === 0}
                data-testid="button-export-history"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClear}
                disabled={calculations.length === 0}
                data-testid="button-clear-history"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Review your previous calculations and results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {calculations.length > 0 && (
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search calculations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
                data-testid="input-search-history"
              />
            </div>
          )}

          {calculations.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <History className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No calculations yet</p>
                <p className="text-sm text-muted-foreground">Your calculation history will appear here</p>
              </CardContent>
            </Card>
          ) : filteredCalculations.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No matching calculations</p>
                <p className="text-sm text-muted-foreground">Try a different search term</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredCalculations.map((calculation) => (
                <Card key={calculation.id} className="relative">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{calculation.formula?.name || 'Unknown Formula'}</h3>
                          <Badge variant="outline">{calculation.formula?.category || 'Uncategorized'}</Badge>
                        </div>
                        
                        <div className="text-sm space-y-1">
                          <p><span className="text-muted-foreground">Formula:</span> <code className="bg-muted px-1 rounded">{calculation.formula?.formula || 'N/A'}</code></p>
                          <p><span className="text-muted-foreground">Inputs:</span> <span className="font-mono text-sm">{formatInputs(calculation.inputs)}</span></p>
                          <p><span className="text-muted-foreground">Result:</span> <span className="font-mono font-medium">{calculation.result.toFixed(6)}</span></p>
                          <p className="text-xs text-muted-foreground">{formatTimestamp(calculation.timestamp)}</p>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRerun(calculation)}
                        data-testid={`button-rerun-${calculation.id}`}
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {calculations.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {filteredCalculations.length} of {calculations.length} calculations
              </p>
              <p className="text-xs text-muted-foreground">
                Calculations are automatically saved
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}