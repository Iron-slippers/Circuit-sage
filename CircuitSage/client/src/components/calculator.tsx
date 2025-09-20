import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calculator as CalculatorIcon, Play, History, Lightbulb } from "lucide-react"
import { Formula } from "@shared/schema"
import { evaluate } from "mathjs"

interface CalculatorProps {
  formulas?: Formula[]
  onCalculate?: (result: { formula: Formula; inputs: Record<string, number>; result: number }) => void
}

export function Calculator({ formulas = [], onCalculate }: CalculatorProps) {
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null)
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFormulaSelect = (formulaId: string) => {
    const formula = formulas.find(f => f.id === formulaId)
    setSelectedFormula(formula || null)
    setInputs({})
    setResult(null)
    setError(null)
    console.log('Selected formula:', formula?.name)
  }

  const handleInputChange = (variable: string, value: string) => {
    setInputs(prev => ({ ...prev, [variable]: value }))
    setError(null)
  }

  const calculate = () => {
    if (!selectedFormula) return

    try {
      // Convert inputs to numbers
      const numericInputs: Record<string, number> = {}
      for (const [key, value] of Object.entries(inputs)) {
        const num = parseFloat(value)
        if (isNaN(num)) {
          setError(`Invalid input for ${key}: "${value}"`)
          return
        }
        numericInputs[key] = num
      }

      // Check if all variables have values
      const missingVars = selectedFormula.variables?.filter(v => !(v in numericInputs)) || []
      if (missingVars.length > 0) {
        setError(`Missing values for: ${missingVars.join(', ')}`)
        return
      }

      // Evaluate the formula locally for immediate feedback
      const calculatedResult = evaluate(selectedFormula.formula, numericInputs)
      setResult(calculatedResult)
      setError(null)
      
      console.log('Calculation result:', calculatedResult)
      
      // Call the backend handler which will save to history
      onCalculate?.({ 
        formula: selectedFormula, 
        inputs: numericInputs, 
        result: calculatedResult 
      })
    } catch (err) {
      setError(`Calculation error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setResult(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalculatorIcon className="h-5 w-5" />
            Electronics Calculator
          </CardTitle>
          <CardDescription>
            Select a formula and enter values to perform calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="formula-select">Select Formula</Label>
            <Select onValueChange={handleFormulaSelect}>
              <SelectTrigger data-testid="select-formula">
                <SelectValue placeholder="Choose a formula to calculate" />
              </SelectTrigger>
              <SelectContent>
                {formulas.map((formula) => (
                  <SelectItem key={formula.id} value={formula.id!}>
                    <div className="flex flex-col">
                      <span className="font-medium">{formula.name}</span>
                      <span className="text-sm text-muted-foreground">{formula.category}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedFormula && (
            <>
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{selectedFormula.category}</Badge>
                    </div>
                    <p className="font-mono text-lg">{selectedFormula.formula}</p>
                    {selectedFormula.description && (
                      <p className="text-sm text-muted-foreground">{selectedFormula.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                {selectedFormula.variables?.map((variable) => (
                  <div key={variable} className="space-y-2">
                    <Label htmlFor={`input-${variable}`}>{variable}</Label>
                    <Input
                      id={`input-${variable}`}
                      type="number"
                      step="any"
                      value={inputs[variable] || ""}
                      onChange={(e) => handleInputChange(variable, e.target.value)}
                      placeholder={`Enter ${variable} value`}
                      data-testid={`input-variable-${variable}`}
                    />
                  </div>
                ))}
              </div>

              <Button 
                onClick={calculate} 
                className="w-full"
                disabled={!selectedFormula.variables?.every(v => inputs[v])}
                data-testid="button-calculate"
              >
                <Play className="h-4 w-4 mr-2" />
                Calculate
              </Button>

              {error && (
                <Card className="border-destructive bg-destructive/10">
                  <CardContent className="pt-4">
                    <p className="text-destructive text-sm">{error}</p>
                  </CardContent>
                </Card>
              )}

              {result !== null && !error && (
                <Card className="border-chart-2 bg-chart-2/10">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Result:</span>
                      <span className="text-xl font-mono font-bold">{result.toFixed(6)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {formulas.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Lightbulb className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No formulas available</p>
                <p className="text-sm text-muted-foreground">Create your first formula to start calculating</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}