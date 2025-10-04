import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Settings, Download, Variable, Search, Filter } from "lucide-react"
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
  const [xMinText, setXMinText] = useState("-10")
  const [xMaxText, setXMaxText] = useState("10")
  const [points, setPoints] = useState(100)
  const [fixedValues, setFixedValues] = useState<Record<string, number[]>>({})
  const [plotData, setPlotData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [detectedConstants, setDetectedConstants] = useState<Constant[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

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
    
    // Auto-select x variable for single-variable formulas
    if (formula?.variables?.length === 1) {
      setXVariable(formula.variables[0])
    } else {
      setXVariable("")
    }
    
    setYVariable(formula ? getOutputVariable(formula) : "")
    setFixedValues({})
    setPlotData([])
    setError(null)
    console.log('Selected formula for graphing:', formula?.name)
  }

  const generateGraph = () => {
    if (!selectedFormula || !xVariable || !yVariable) return

    // Parse current text values to ensure we use what the user just typed
    const minRaw = parseFloat(xMinText)
    const maxRaw = parseFloat(xMaxText)
    const actualMin = Number.isNaN(minRaw) ? -10 : minRaw
    const actualMax = Number.isNaN(maxRaw) ? 10 : maxRaw

    // Input validation
    if (actualMin >= actualMax) {
      setError('X Min must be less than X Max')
      return
    }
    if (points < 2) {
      setError('Number of points must be at least 2')
      return
    }

    // Update numeric state to match what we're using
    setXMin(actualMin)
    setXMax(actualMax)
    setXMinText(actualMin.toString())
    setXMaxText(actualMax.toString())

    try {
      const step = (actualMax - actualMin) / points
      
      // Generate all combinations of parameter values
      const parameterVariables = Object.keys(fixedValues)
      const parameterCombinations: Record<string, number>[] = []
      
      if (parameterVariables.length === 0) {
        // No parameters, just one trace
        parameterCombinations.push({})
      } else {
        // Generate all combinations
        const generateCombinations = (index: number, current: Record<string, number>) => {
          if (index === parameterVariables.length) {
            parameterCombinations.push({ ...current })
            return
          }
          
          const variable = parameterVariables[index]
          const values = fixedValues[variable]
          
          for (const value of values) {
            current[variable] = value
            generateCombinations(index + 1, current)
          }
        }
        
        generateCombinations(0, {})
      }
      
      // Color palette for multiple traces
      const colors = [
        '#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c',
        '#0891b2', '#db2777', '#65a30d', '#7c3aed', '#0284c7'
      ]
      
      const traces: any[] = []
      
      // Generate a trace for each parameter combination
      parameterCombinations.forEach((paramValues, index) => {
        const xValues: number[] = []
        const yValues: number[] = []
        
        for (let i = 0; i <= points; i++) {
          const x = actualMin + i * step
          const inputs: Record<string, number> = { ...paramValues, [xVariable]: x }
          
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
        
        if (yValues.length > 0) {
          // Build label for the trace
          const paramLabel = Object.keys(paramValues).length > 0
            ? Object.entries(paramValues)
                .map(([key, val]) => `${key}=${val}`)
                .join(', ')
            : `${yVariable} vs ${xVariable}`
          
          traces.push({
            x: xValues,
            y: yValues,
            type: 'scatter' as const,
            mode: 'lines' as const,
            name: paramLabel,
            line: { 
              color: colors[index % colors.length], 
              width: 2 
            }
          })
        }
      })
      
      if (traces.length === 0) {
        setError('No valid points produced — please check fixed values and ranges.')
        setPlotData([])
        return
      }

      setPlotData(traces)
      setError(null)
      console.log('Generated', traces.length, 'traces')
    } catch (err) {
      setError(`Graph generation error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setPlotData([])
    }
  }

  const handleFixedValueChange = (variable: string, value: string) => {
    if (!value.trim()) {
      // Remove the variable if empty
      setFixedValues(prev => {
        const { [variable]: removed, ...rest } = prev
        return rest
      })
      return
    }
    
    // Parse comma-separated values
    const values = value.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
    
    if (values.length > 0) {
      setFixedValues(prev => ({ ...prev, [variable]: values }))
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

  // Get unique categories from formulas
  const availableCategories = Array.from(new Set(formulas.map(f => f.category))).filter(Boolean).sort()

  // Filter formulas based on search term and category
  const filteredFormulas = formulas.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || formula.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="graph-search">Search and select formula</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="graph-search"
                    placeholder="Search formulas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-graph-search-formulas"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="graph-category-filter">Filter by category</Label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="graph-category-filter" className="pl-10" data-testid="select-graph-category-filter">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All categories</SelectItem>
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            {(searchTerm || selectedCategory !== "All") && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Showing {filteredFormulas.length} of {formulas.length} formulas</span>
                {(searchTerm || selectedCategory !== "All") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("All")
                    }}
                    className="h-auto p-1 text-xs"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Formula List */}
          <div className="space-y-2">
            <Label>Available Formulas</Label>
            <div className="border rounded-md max-h-64 overflow-auto bg-white">
              {filteredFormulas.length > 0 ? (
                filteredFormulas.map((formula) => (
                  <button
                    key={formula.id}
                    type="button"
                    onClick={() => {
                      handleFormulaSelect(formula.id!)
                      setSearchTerm(formula.name)
                    }}
                    className={`w-full px-4 py-3 text-left border-b border-gray-100 last:border-b-0 focus:outline-none transition-colors bg-[#1f242e] ${
                      selectedFormula?.id === formula.id 
                        ? 'bg-[#2a2f3a] border-l-4 border-l-blue-500' 
                        : 'hover:bg-[#2a2f3a] focus:bg-[#2a2f3a]'
                    }`}
                    data-testid={`graph-formula-option-${formula.id}`}
                  >
                    <div className="flex flex-col space-y-1">
                      <span className="font-medium text-sm">{formula.name}</span>
                      <span className="text-xs text-muted-foreground">{formula.category}</span>
                      <span className="font-mono text-[18px] text-[#ebf2f2]">{formula.formula}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  {formulas.length === 0 ? (
                    <>
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p>No formulas available</p>
                      <p className="text-xs">Create your first formula to start graphing</p>
                    </>
                  ) : (
                    <>
                      <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p>No formulas match your search</p>
                      <p className="text-xs">Try adjusting your search term or category filter</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>


          {selectedFormula && (
            <Card className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Variable className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-600">Selected Formula:</span>
                </div>
                <div className="font-mono text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {selectedFormula.formula}
                </div>
                {selectedFormula.description && (
                  <div className="text-sm text-muted-foreground mt-2">
                    {selectedFormula.description}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {selectedFormula && selectedFormula.variables && selectedFormula.variables.length >= 1 && (
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
                        step="any"
                        value={xMinText}
                        onChange={(e) => setXMinText(e.target.value)}
                        onBlur={(e) => {
                          const v = parseFloat(e.target.value)
                          if (Number.isNaN(v)) {
                            setXMin(-10)
                            setXMinText("-10")
                          } else {
                            setXMin(v)
                            setXMinText(v.toString())
                          }
                        }}
                        data-testid="input-x-min"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>X Max</Label>
                      <Input
                        type="number"
                        step="any"
                        value={xMaxText}
                        onChange={(e) => setXMaxText(e.target.value)}
                        onBlur={(e) => {
                          const v = parseFloat(e.target.value)
                          if (Number.isNaN(v)) {
                            setXMax(10)
                            setXMaxText("10")
                          } else {
                            setXMax(v)
                            setXMaxText(v.toString())
                          }
                        }}
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
                      <Label>Parameter Values (Parametric Graphing)</Label>
                      <p className="text-xs text-muted-foreground">
                        Enter single values or comma-separated values (e.g., "1, 2, 5") to plot multiple curves
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        {getOtherVariables().map((variable) => (
                          <div key={variable} className="space-y-1">
                            <Label className="text-sm">{variable}</Label>
                            <Input
                              type="text"
                              placeholder={`e.g., 1, 2, 5`}
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
                      disabled={!xVariable || getOtherVariables().some(v => !fixedValues[v] || fixedValues[v].length === 0)}
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

          {selectedFormula && selectedFormula.variables && selectedFormula.variables.length < 1 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Settings className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">This formula has no variables for graphing</p>
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
              {plotData.length > 1 && ` (${plotData.length} curves)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-96">
              <Plot
                data={plotData}
                layout={{
                  title: {
                    text: `<b>${selectedFormula?.name}</b><br><span style="font-size:14px">${selectedFormula?.formula}</span>`,
                    font: { size: 16 },
                    y: 0.95
                  },
                  xaxis: { 
                    title: {
                      text: `<b>${xVariable}</b>`,
                      font: { size: 14 }
                    },
                    showgrid: true,
                    gridcolor: '#E5E7EB'
                  },
                  yaxis: { 
                    title: {
                      text: `<b>${yVariable || 'Result'}</b>`,
                      font: { size: 14 }
                    },
                    showgrid: true,
                    gridcolor: '#E5E7EB'
                  },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  font: { color: '#666' },
                  autosize: true,
                  margin: { t: 80, b: 50, l: 60, r: 30 }
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