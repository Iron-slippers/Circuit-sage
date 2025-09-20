import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calculator as CalculatorIcon, Play, History, Lightbulb, Variable } from "lucide-react"
import { Formula, Constant } from "@shared/schema"
import { evaluate } from "mathjs"
import { useQuery } from "@tanstack/react-query"

interface CalculatorProps {
  formulas?: Formula[]
  onCalculate?: (result: { formula: Formula; inputs: Record<string, number>; result: number }) => void
}

export function Calculator({ formulas = [], onCalculate }: CalculatorProps) {
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null)
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [detectedConstants, setDetectedConstants] = useState<Constant[]>([])

  // Fetch constants from backend
  const { data: constants = [] } = useQuery<Constant[]>({
    queryKey: ['/api/constants'],
  })

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

  // Format numbers with proper exponential notation for very small/large values
  const formatNumber = (num: number): string => {
    if (num === 0) return "0"
    
    const absNum = Math.abs(num)
    
    // Use exponential notation for very small numbers (< 1e-4) or very large numbers (>= 1e6)
    if (absNum < 1e-4 || absNum >= 1e6) {
      return num.toExponential(6)
    }
    
    // Use regular decimal notation with appropriate precision
    if (absNum >= 1) {
      return num.toFixed(6).replace(/\.?0+$/, '') // Remove trailing zeros
    } else {
      return num.toFixed(6)
    }
  }

  // Detect constants used in the current formula
  const detectConstantsInFormula = (formula: Formula) => {
    if (!formula.formula || !constants.length) {
      setDetectedConstants([])
      return
    }

    const detected = constants.filter(constant => 
      formula.formula.includes(constant.symbol)
    )
    setDetectedConstants(detected)
  }

  // Update detected constants when formula changes
  useEffect(() => {
    if (selectedFormula) {
      detectConstantsInFormula(selectedFormula)
    }
  }, [selectedFormula, constants])

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

      // Add constant values automatically
      detectedConstants.forEach(constant => {
        numericInputs[constant.symbol] = constant.value
      })

      // Check if all variables have values (excluding constants)
      const requiredVars = selectedFormula.variables?.filter(v => 
        !detectedConstants.some(c => c.symbol === v)
      ) || []
      const missingVars = requiredVars.filter(v => !(v in numericInputs))
      
      if (missingVars.length > 0) {
        setError(`Missing values for: ${missingVars.join(', ')}`)
        return
      }

      // Evaluate the formula with constants automatically included
      const calculatedResult = evaluate(selectedFormula.formula, numericInputs)
      setResult(calculatedResult)
      setError(null)
      
      console.log('Calculation result:', calculatedResult)
      console.log('Used constants:', detectedConstants.map(c => `${c.symbol} = ${c.value}`))
      
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

              {detectedConstants.length > 0 && (
                <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Variable className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Auto-detected Constants:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {detectedConstants.map((constant) => (
                        <div key={constant.id} className="text-xs">
                          <span className="font-mono font-bold">{constant.symbol}</span> = {constant.value} {constant.unit}
                          <div className="text-muted-foreground">{constant.name}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedFormula.variables?.filter(variable => 
                  !detectedConstants.some(c => c.symbol === variable)
                ).map((variable) => (
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
                disabled={!selectedFormula.variables?.filter(v => 
                  !detectedConstants.some(c => c.symbol === v)
                ).every(v => inputs[v])}
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
                      <span className="text-xl font-mono font-bold">{formatNumber(result)}</span>
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