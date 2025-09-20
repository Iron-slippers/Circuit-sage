import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ConstantsManager } from "@/components/constants-manager"
import { Constant } from "@shared/schema"
import { apiRequest } from "@/lib/queryClient"

export default function ConstantsPage() {
  const queryClient = useQueryClient()

  // Fetch constants from backend
  const { data: constants = [], isLoading } = useQuery<Constant[]>({
    queryKey: ['/api/constants'],
  })

  // Create constant mutation
  const createConstantMutation = useMutation({
    mutationFn: async (constantData: Omit<Constant, 'id'>) => {
      return apiRequest('/api/constants', {
        method: 'POST',
        body: JSON.stringify(constantData),
        headers: { 'Content-Type': 'application/json' }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/constants'] })
    }
  })

  // Update constant mutation
  const updateConstantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<Constant, 'id'> }) => {
      return apiRequest(`/api/constants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/constants'] })
    }
  })

  // Delete constant mutation
  const deleteConstantMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/constants/${id}`, {
        method: 'DELETE'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/constants'] })
    }
  })

  const handleAdd = (constantData: Omit<Constant, 'id'>) => {
    createConstantMutation.mutate(constantData)
  }

  const handleEdit = (id: string, constantData: Omit<Constant, 'id'>) => {
    updateConstantMutation.mutate({ id, data: constantData })
  }

  const handleDelete = (id: string) => {
    deleteConstantMutation.mutate(id)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading constants...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <ConstantsManager
        constants={constants}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}