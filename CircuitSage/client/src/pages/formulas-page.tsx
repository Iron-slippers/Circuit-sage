import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FormulaEditor } from "@/components/formula-editor"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { Formula } from "@shared/schema"
import { apiRequest } from "@/lib/queryClient"

export default function FormulasPage() {
  const queryClient = useQueryClient()
  const [showEditor, setShowEditor] = useState(false)
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null)
  const [showFormulas, setShowFormulas] = useState(true)

  // Fetch formulas from backend
  const { data: formulas = [], isLoading } = useQuery<Formula[]>({
    queryKey: ['/api/formulas'],
  })

  // Create formula mutation
  const createFormulaMutation = useMutation({
    mutationFn: async (formulaData: Omit<Formula, 'id'>) => {
      return apiRequest('/api/formulas', {
        method: 'POST',
        body: JSON.stringify(formulaData),
        headers: { 'Content-Type': 'application/json' }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/formulas'] })
      setShowEditor(false)
      setEditingFormula(null)
    }
  })

  // Update formula mutation
  const updateFormulaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<Formula, 'id'> }) => {
      return apiRequest(`/api/formulas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/formulas'] })
      setShowEditor(false)
      setEditingFormula(null)
    }
  })

  // Delete formula mutation
  const deleteFormulaMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/formulas/${id}`, {
        method: 'DELETE'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/formulas'] })
    }
  })

  const handleSave = (formulaData: Omit<Formula, 'id'>) => {
    if (editingFormula) {
      updateFormulaMutation.mutate({ id: editingFormula.id!, data: formulaData })
    } else {
      createFormulaMutation.mutate(formulaData)
    }
  }

  const handleEdit = (formula: Formula) => {
    setEditingFormula(formula)
    setShowEditor(true)
  }

  const handleDelete = (id: string) => {
    deleteFormulaMutation.mutate(id)
  }

  const handleCancel = () => {
    setShowEditor(false)
    setEditingFormula(null)
  }

  const startNew = () => {
    setEditingFormula(null)
    setShowEditor(true)
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {showEditor ? (
        <FormulaEditor
          formula={editingFormula || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Formula Library
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFormulas(!showFormulas)}
                    data-testid="button-toggle-formulas"
                  >
                    {showFormulas ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showFormulas ? 'Hide' : 'Show'} Formulas
                  </Button>
                  <Button onClick={startNew} data-testid="button-new-formula">
                    <Plus className="h-4 w-4 mr-2" />
                    New Formula
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Manage your electronics calculation formulas
              </CardDescription>
            </CardHeader>
            {showFormulas && (
              <CardContent>
                {formulas.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No formulas created yet</p>
                      <p className="text-sm text-muted-foreground">Create your first formula to get started</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {formulas.map((formula) => (
                      <Card key={formula.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{formula.name}</h3>
                                <Badge variant="outline">{formula.category}</Badge>
                              </div>
                              <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{formula.formula}</p>
                              {formula.description && (
                                <p className="text-sm text-muted-foreground">{formula.description}</p>
                              )}
                              <div className="flex flex-wrap gap-1">
                                {formula.variables?.map((variable) => (
                                  <Badge key={variable} variant="secondary" className="text-xs">
                                    {variable}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(formula)}
                                data-testid={`button-edit-formula-${formula.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(formula.id!)}
                                data-testid={`button-delete-formula-${formula.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </>
      )}
    </div>
  )
}