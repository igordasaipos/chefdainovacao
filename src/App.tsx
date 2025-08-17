
import { useState, useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/hooks/useAuth"
import { EventoProvider } from "@/contexts/EventoContext"
import { LoadingScreen } from "@/components/LoadingScreen"
import Admin from "./pages/Admin"
import EventosAdmin from "./pages/EventosAdmin"
import Votar from "./pages/Votar"
import Totem from "./pages/Totem"
import Kanban from "./pages/Kanban"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import Encerrado from "./pages/Encerrado"

const queryClient = new QueryClient()

const App = () => {
  const [isLoading, setIsLoading] = useState(true)

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <EventoProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/encerrado" replace />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/eventos" element={<EventosAdmin />} />
                <Route path="/login" element={<Login />} />
                <Route path="/votar" element={<Votar />} />
                <Route path="/totem" element={<Totem />} />
                <Route path="/kanban" element={<Kanban />} />
                <Route path="/encerrado" element={<Encerrado />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </EventoProvider>
    </QueryClientProvider>
  )
}

export default App
