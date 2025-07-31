import Player from 'react-lottie-player'
import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

export const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [showFallback, setShowFallback] = useState(false)
  const [animationData, setAnimationData] = useState(null)

  useEffect(() => {
    // Carrega a animação Lottie
    fetch('/lovable-uploads/loading-animation.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(() => setShowFallback(true))
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
        <div className="w-64 h-64 flex items-center justify-center">
          {!showFallback && animationData ? (
            <Player
              play
              loop
              animationData={animationData}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            // Fallback - animação CSS simples
            <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        
        {/* Texto de carregamento */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Saipos Chefe da Inovação</h2>
          <p className="text-muted-foreground animate-pulse">Carregando sistema de votação...</p>
        </div>
      </div>
    </div>
  )
}