import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Settings, Download, Variable } from "lucide-react"
import { Formula, Constant } from "@shared/schema"
import { evaluate } from "mathjs"
import Plot from "react-plotly.js"
import { useQuery } from "@tanstack/react-query"

interface GraphDisplayProps {
  formulas?: Formula[]
}

export function GraphDisplay({ formulas = [] }: GraphDisplayProps) {
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null)
  const [xVariable, setXVariable] = useState("")
  const [yVariable, setYVariable] = useState("")
  const [xMin, setXMin] = useState(-10)
  const [xMax, setXMax] = useState(10)
  const [points, setPoints] = useState(100)
  const [fixedValues, setFixedValues] = useState<Record<string, number>>({})
  const [plotData, setPlotData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [detectedConstants, setDetectedConstants] = useState<Constant[]>([])

  // Fetch constants from backend
  const { data: constants = [] } = useQuery<Constant[]>({
    queryKey: ['/api/constants'],
  })

  // Extract the output variable from formula description or name
  const getOutputVariable = (formula: Formula): string => {
    // Try to find output variable in description (e.g., "V = I × R" -> "V")
    const descMatch = formula.description?.match(/([A-Z]|τ|π|\w+)\s*=/)
    if (descMatch) {
      return descMatch[1].trim()
    }
    
    // Try to extract from name (e.g., "Ohm's Law (Voltage)" -> "V")
    if (formula.name?.toLowerCase().includes('voltage')) return 'V'
    if (formula.name?.toLowerCase().includes('current')) return 'I'
    if (formula.name?.toLowerCase().includes('power')) return 'P'
    if (formula.name?.toLowerCase().includes('resistance')) return 'R'
    if (formula.name?.toLowerCase().includes('time')) return 'τ'
    
    return 'Result'
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

  const handleFormulaSelect = (formulaId: string) => {
    const formula = formulas.find(f => f.id === formulaId)
    setSelectedFormula(formula || null)
    setXVariable("")
    setYVariable(formula ? getOutputVariable(formula) : "")
    setFixedValues({})
    setPlotData([])
    setError(null)
    console.log('Selected formula for graphing:', formula?.name)
  }

  const generateGraph = () => {
    if (!selectedFormula || !xVariable || !yVariable) return

    // Input validation
    if (xMin >= xMax) {
      setError('X Min must be less than X Max')
      return
    }
    if (points < 2) {
      setError('Number of points must be at least 2')
      return
    }

    try {
      const step = (xMax - xMin) / points
      const xValues: number[] = []
      const yValues: number[] = []

      for (let i = 0; i <= points; i++) {
        const x = xMin + i * step
        const inputs = { ...fixedValues, [xVariable]: x }
        
        // Add constant values automatically
        detectedConstants.forEach(constant => {
          inputs[constant.symbol] = constant.value
        })
        
        try {
          const result = evaluate(selectedFormula.formula, inputs)
          if (isFinite(result)) {
            xValues.push(x)
            yValues.push(result)
          }
        } catch (evalError) {
          // Skip invalid points
          continue
        }
      }

      if (yValues.length === 0) {
        setError('No valid points produced — please check fixed values and ranges.')
        setPlotData([])
        return
      }

      const trace = {
        x: xValues,
        y: yValues,
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: `${yVariable} vs ${xVariable}`,
        line: { color: '#2563eb', width: 2 }
      }

      setPlotData([trace])
      setError(null)
      console.log('Generated graph with', xValues.length, 'points')
    } catch (err) {
      setError(`Graph generation error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setPlotData([])
    }
  }

  const handleFixedValueChange = (variable: string, value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      setFixedValues(prev => ({ ...prev, [variable]: num }))
    } else {
      setFixedValues(prev => {
        const { [variable]: removed, ...rest } = prev
        return rest
      })
    }
  }

  const getOtherVariables = () => {
    if (!selectedFormula) return []
    return selectedFormula.variables?.filter(v => 
      v !== xVariable && !detectedConstants.some(c => c.symbol === v)
    ) || []
  }

  const handleDownload = () => {
    console.log('Download graph functionality triggered')
    // In a real app, this would export the graph
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Graph Analysis
          </CardTitle>
          <CardDescription>
            Visualize relationships between variables in your formulas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Formula</Label>
            <Select onValueChange={handleFormulaSelect}>
              <SelectTrigger data-testid="select-graph-formula">
                <SelectValue placeholder="Choose a formula to graph" />
              </SelectTrigger>
              <SelectContent>
                {formulas.map((formula) => (
                  <SelectItem key={formula.id} value={formula.id!}>
                    {formula.name} ({formula.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedFormula && selectedFormula.variables && selectedFormula.variables.length >= 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>X-Axis Variable</Label>
                  <Select value={xVariable} onValueChange={setXVariable}>
                    <SelectTrigger data-testid="select-x-variable">
                      <SelectValue placeholder="Choose X variable" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedFormula.variables.map((variable) => (
                        <SelectItem key={variable} value={variable}>{variable}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Y-Axis (Result)</Label>
                  <Input 
                    value={yVariable || "Formula Result"} 
                    disabled 
                    className="bg-muted"
                  />
                </div>
              </div>

              {xVariable && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>X Min</Label>
                      <Input
                        type="number"
                        value={xMin}
                        onChange={(e) => setXMin(parseFloat(e.target.value) || -10)}
                        data-testid="input-x-min"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>X Max</Label>
                      <Input
                        type="number"
                        value={xMax}
                        onChange={(e) => setXMax(parseFloat(e.target.value) || 10)}
                        data-testid="input-x-max"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={points}
                        onChange={(e) => setPoints(parseInt(e.target.value) || 100)}
                        data-testid="input-points"
                      />
                    </div>
                  </div>

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

                  {getOtherVariables().length > 0 && (
                    <div className="space-y-2">
                      <Label>Fixed Values for Other Variables</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {getOtherVariables().map((variable) => (
                          <div key={variable} className="space-y-1">
                            <Label className="text-sm">{variable}</Label>
                            <Input
                              type="number"
                              step="any"
                              placeholder={`Value for ${variable}`}
                              onChange={(e) => handleFixedValueChange(variable, e.target.value)}
                              data-testid={`input-fixed-${variable}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={generateGraph}
                      disabled={!xVariable || getOtherVariables().some(v => !(v in fixedValues))}
                      data-testid="button-generate-graph"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Graph
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleDownload}
                      disabled={plotData.length === 0}
                      data-testid="button-download-graph"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </>
              )}
            </>
          )}

          {selectedFormula && selectedFormula.variables && selectedFormula.variables.length < 2 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Settings className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">This formula needs at least 2 variables for graphing</p>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="pt-4">
                <p className="text-destructive text-sm">{error}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {plotData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Graph: {selectedFormula?.name}</CardTitle>
            <CardDescription>
              {yVariable || 'Result'} vs {xVariable}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-96">
              <Plot
                data={plotData}
                layout={{
                  title: `${selectedFormula?.name}: ${yVariable || 'Result'} vs ${xVariable}`,
                  xaxis: { title: xVariable },
                  yaxis: { title: yVariable || 'Result' },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  font: { color: '#666' },
                  autosize: true,
                }}
                config={{
                  responsive: true,
                  displayModeBar: true,
                  modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
                }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}