import { ConstantsManager } from "@/components/constants-manager"

export default function ConstantsManagerExample() {
  // Mock constants for demonstration
  const mockConstants = [
    {
      id: "1",
      name: "Speed of Light",
      symbol: "c",
      value: 299792458,
      unit: "m/s",
      description: "Speed of light in vacuum"
    },
    {
      id: "2",
      name: "Elementary Charge",
      symbol: "e",
      value: 1.602176634e-19,
      unit: "C",
      description: "Electric charge of a proton"
    },
    {
      id: "3",
      name: "Boltzmann Constant",
      symbol: "k",
      value: 1.380649e-23,
      unit: "J/K",
      description: "Relates energy and temperature"
    }
  ]

  const handleAdd = (constant: any) => {
    console.log("Adding constant:", constant)
  }

  const handleEdit = (id: string, constant: any) => {
    console.log("Editing constant:", id, constant)
  }

  const handleDelete = (id: string) => {
    console.log("Deleting constant:", id)
  }

  return (
    <div className="p-4 max-w-4xl">
      <h2 className="text-lg font-semibold mb-4">Constants Manager Demo</h2>
      <ConstantsManager
        constants={mockConstants}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}