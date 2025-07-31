import Player from 'react-lottie-player'
import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

export const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [animationData, setAnimationData] = useState(null)

  useEffect(() => {
    // Carrega a animação Lottie imediatamente
    const loadAnimation = async () => {
      try {
        const response = await fetch('/lovable-uploads/loading-animation.json')
        const data = await response.json()
        setAnimationData(data)
      } catch (error) {
        console.log('Lottie animation not found')
      }
    }
    
    loadAnimation()
  }, [])

  useEffect(() => {
    // Tempo mínimo de loading (3 segundos)
    const timer = setTimeout(() => {
      onLoadingComplete()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onLoadingComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        {/* Container da animação Lottie */}
        <div className="w-32 h-32 sm:w-48 sm:h-48 flex items-center justify-center">
          {animationData && (
            <Player
              play
              loop
              animationData={animationData}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </div>
        
        {/* Texto de carregamento */}
        <div className="text-center space-y-2 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Saipos Chef da Inovação</h2>
          <p className="text-muted-foreground">Carregando sistema de votação...</p>
        </div>
      </div>
    </div>
  )
}