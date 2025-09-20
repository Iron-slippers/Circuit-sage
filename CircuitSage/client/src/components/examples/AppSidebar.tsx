import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-96 w-full border rounded-md overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-2 border-b">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground">Electronics Calculator</span>
          </header>
          <main className="flex-1 p-4 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Navigation Demo</h2>
              <p className="text-muted-foreground">Click the sidebar items to navigate</p>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}