import { CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const Encerrado = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Votação Encerrada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              O período de votação foi finalizado.
            </p>
            <p className="text-sm text-muted-foreground">
              Obrigado por sua participação!
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Votação encerrada</span>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/kanban')} 
              className="w-full"
            >
              Ver Acompanhamento
            </Button>
            <Button 
              onClick={() => navigate('/totem')} 
              variant="outline" 
              className="w-full"
            >
              Ver Estatísticas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Encerrado