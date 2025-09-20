import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Variable, Plus, Edit, Trash2, Save, X } from "lucide-react"
import { Constant } from "@shared/schema"

interface ConstantsManagerProps {
  constants?: Constant[]
  onAdd?: (constant: Omit<Constant, 'id'>) => void
  onEdit?: (id: string, constant: Omit<Constant, 'id'>) => void
  onDelete?: (id: string) => void
}

export function ConstantsManager({ constants = [], onAdd, onEdit, onDelete }: ConstantsManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    value: "",
    unit: "",
    description: ""
  })

  const resetForm = () => {
    setFormData({
      name: "",
      symbol: "",
      value: "",
      unit: "",
      description: ""
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.symbol || !formData.value || !formData.unit) return

    const constantData = {
      name: formData.name,
      symbol: formData.symbol,
      value: parseFloat(formData.value),
      unit: formData.unit,
      description: formData.description
    }

    if (editingId) {
      console.log('Editing constant:', editingId, constantData)
      onEdit?.(editingId, constantData)
    } else {
      console.log('Adding new constant:', constantData)
      onAdd?.(constantData)
    }

    resetForm()
  }

  const startEdit = (constant: Constant) => {
    setFormData({
      name: constant.name,
      symbol: constant.symbol,
      value: constant.value.toString(),
      unit: constant.unit,
      description: constant.description || ""
    })
    setEditingId(constant.id!)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    console.log('Deleting constant:', id)
    onDelete?.(id)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Variable className="h-5 w-5" />
              Electronics Variable
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              data-testid="button-add-constant"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Constant
            </Button>
          </CardTitle>
          <CardDescription>
            Manage physical constants and values used in your calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {constants.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Variable className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No constants defined</p>
                <p className="text-sm text-muted-foreground">Add your first constant to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {constants.map((constant) => (
                <Card key={constant.id} className="relative">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {constant.symbol}
                          </Badge>
                          <h3 className="font-medium">{constant.name}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-mono">{constant.value}</span>
                          <span className="text-muted-foreground">{constant.unit}</span>
                        </div>
                        {constant.description && (
                          <p className="text-sm text-muted-foreground">{constant.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(constant)}
                          data-testid={`button-edit-constant-${constant.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(constant.id!)}
                          data-testid={`button-delete-constant-${constant.id}`}
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
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Constant' : 'Add New Constant'}</CardTitle>
            <CardDescription>
              Define a physical constant with its value and unit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="constant-name">Name</Label>
                <Input
                  id="constant-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Speed of Light"
                  data-testid="input-constant-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="constant-symbol">Symbol</Label>
                <Input
                  id="constant-symbol"
                  value={formData.symbol}
                  onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                  placeholder="e.g., c"
                  data-testid="input-constant-symbol"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="constant-value">Value</Label>
                <Input
                  id="constant-value"
                  type="number"
                  step="any"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="e.g., 299792458"
                  data-testid="input-constant-value"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="constant-unit">Unit</Label>
                <Input
                  id="constant-unit"
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="e.g., m/s"
                  data-testid="input-constant-unit"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="constant-description">Description (Optional)</Label>
              <Textarea
                id="constant-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this constant"
                data-testid="input-constant-description"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={resetForm}
                data-testid="button-cancel-constant"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!formData.name || !formData.symbol || !formData.value || !formData.unit}
                data-testid="button-save-constant"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Update' : 'Save'} Constant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}