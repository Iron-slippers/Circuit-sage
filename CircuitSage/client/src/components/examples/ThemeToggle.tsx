import { ThemeProvider } from "@/lib/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ThemeToggleExample() {
  return (
    <ThemeProvider>
      <div className="p-4 flex items-center gap-4">
        <span>Toggle between light and dark themes:</span>
        <ThemeToggle />
      </div>
    </ThemeProvider>
  )
}