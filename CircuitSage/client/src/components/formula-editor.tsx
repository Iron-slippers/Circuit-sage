import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Save, Eye, Variable } from "lucide-react"
import { Formula, Constant } from "@shared/schema"
import { useQuery } from "@tanstack/react-query"

interface FormulaEditorProps {
  formula?: Formula
  onSave?: (formula: Omit<Formula, 'id'>) => void
  onCancel?: () => void
}

const categories = [
  "Basic Electronics",
  "AC Analysis", 
  "DC Analysis",
  "Power Calculations",
  "Filters",
  "Amplifiers",
  "Digital Logic",
  "Other"
]

export function FormulaEditor({ formula, onSave, onCancel }: FormulaEditorProps) {
  const [name, setName] = useState(formula?.name || "")
  const [formulaText, setFormulaText] = useState(formula?.formula || "")
  const [description, setDescription] = useState(formula?.description || "")
  const [category, setCategory] = useState(formula?.category || "")
  const [variables, setVariables] = useState<string[]>(formula?.variables || [])
  const [newVariable, setNewVariable] = useState("")
  const [preview, setPreview] = useState(false)
  const [selectedConstants, setSelectedConstants] = useState<Record<string, string>>({})

  // Fetch constants from backend
  const { data: constants = [] } = useQuery<Constant[]>({
    queryKey: ['/api/constants'],
  })

  // Auto-detect variables from formula text
  const autoDetectVariables = (formula: string): string[] => {
    // Remove common mathematical functions and operators
    const cleanFormula = formula
      .replace(/\b(sin|cos|tan|log|ln|exp|sqrt|abs|floor|ceil|round|max|min)\s*\(/g, '')
      .replace(/[+\-*/()=\s0-9.,]/g, ' ')
    
    // Extract potential variable names (letters, possibly with numbers/subscripts)
    const matches = cleanFormula.match(/[a-zA-Z][a-zA-Z0-9_]*/g) || []
    
    // Filter out common constants and functions
    const excludeList = ['pi', 'e', 'tau', 'true', 'false', 'undefined', 'null']
    const detectedVars = [...new Set(matches)].filter(v => !excludeList.includes(v.toLowerCase()))
    
    return detectedVars
  }

  // Get constants that might be in the formula
  const getPotentialConstants = (): { symbol: string, options: Constant[] }[] => {
    const detectedSymbols = autoDetectVariables(formulaText)
    const constantGroups: { symbol: string, options: Constant[] }[] = []
    
    detectedSymbols.forEach(symbol => {
      const matchingConstants = constants.filter(c => c.symbol === symbol)
      if (matchingConstants.length > 0) {
        constantGroups.push({ symbol, options: matchingConstants })
      }
    })
    
    return constantGroups
  }

  // Handle constant selection
  const handleConstantSelect = (symbol: string, constantId: string) => {
    setSelectedConstants(prev => ({ ...prev, [symbol]: constantId }))
  }

  const handleFormulaChange = (value: string) => {
    setFormulaText(value)
    
    // Auto-detect variables when formula changes
    const detected = autoDetectVariables(value)
    const newVars = detected.filter(v => !variables.includes(v))
    
    if (newVars.length > 0) {
      setVariables([...variables, ...newVars])
    }
  }

  const addVariable = () => {
    if (newVariable.trim() && !variables.includes(newVariable.trim())) {
      setVariables([...variables, newVariable.trim()])
      setNewVariable("")
    }
  }

  const removeVariable = (variable: string) => {
    setVariables(variables.filter(v => v !== variable))
  }

  const handleSave = () => {
    if (!name || !formulaText || !category) return
    
    const formulaData = {
      name,
      formula: formulaText,
      description,
      category,
      variables
    }
    
    console.log('Saving formula:', formulaData)
    onSave?.(formulaData)
  }

  const handlePreview = () => {
    setPreview(!preview)
    console.log('Toggle preview mode:', !preview)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {formula ? 'Edit Formula' : 'Create New Formula'}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreview}
              data-testid="button-preview"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Define mathematical formulas for electronics calculations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Formula Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Ohm's Law"
              data-testid="input-formula-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="formula">Formula Expression</Label>
          <Textarea
            id="formula"
            value={formulaText}
            onChange={(e) => handleFormulaChange(e.target.value)}
            placeholder="e.g., V = I * R"
            className="font-mono"
            data-testid="input-formula-expression"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what this formula calculates"
            data-testid="input-formula-description"
          />
        </div>

        {getPotentialConstants().length > 0 && (
          <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Variable className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Constants Selection</span>
              </div>
              <div className="space-y-3">
                {getPotentialConstants().map(({ symbol, options }) => (
                  <div key={symbol} className="space-y-2">
                    <Label className="text-sm font-medium">
                      Symbol "{symbol}" ({options.length} options available)
                    </Label>
                    <Select 
                      value={selectedConstants[symbol] || ''} 
                      onValueChange={(value) => handleConstantSelect(symbol, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Choose constant for "${symbol}"`} />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((constant) => (
                          <SelectItem key={constant.id} value={constant.id!}>
                            <div className="flex flex-col">
                              <span className="font-medium">{constant.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {constant.symbol} = {constant.value} {constant.unit}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <Label>Variables</Label>
          <div className="flex gap-2">
            <Input
              value={newVariable}
              onChange={(e) => setNewVariable(e.target.value)}
              placeholder="Add variable (e.g., V, I, R)"
              onKeyPress={(e) => e.key === 'Enter' && addVariable()}
              data-testid="input-variable"
            />
            <Button 
              type="button" 
              onClick={addVariable}
              data-testid="button-add-variable"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {variables.map((variable) => (
              <Badge key={variable} variant="secondary" className="flex items-center gap-1">
                {variable}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => removeVariable(variable)}
                  data-testid={`button-remove-variable-${variable}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>

        {preview && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Formula Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Name:</strong> {name || "Untitled Formula"}</p>
                <p><strong>Category:</strong> {category || "Uncategorized"}</p>
                <p><strong>Expression:</strong> <code className="bg-background px-2 py-1 rounded">{formulaText || "No formula"}</code></p>
                {description && <p><strong>Description:</strong> {description}</p>}
                <p><strong>Variables:</strong> {variables.length > 0 ? variables.join(", ") : "None defined"}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={onCancel}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!name || !formulaText || !category}
            data-testid="button-save-formula"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Formula
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}