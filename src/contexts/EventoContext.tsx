import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useEventoAtivo, useEventos, Evento } from '@/hooks/useEventos';

interface EventoContextType {
  eventoAtivo: Evento | null;
  eventoSelecionado: Evento | null;
  setEventoSelecionado: (evento: Evento | null) => void;
  isLoading: boolean;
  error: Error | null;
}

const EventoContext = createContext<EventoContextType | undefined>(undefined);

interface EventoProviderProps {
  children: ReactNode;
}

const EVENTO_SELECIONADO_KEY = 'evento_selecionado_id';

export const EventoProvider: React.FC<EventoProviderProps> = ({ children }) => {
  const { data: eventoAtivo, isLoading: loadingAtivo, error } = useEventoAtivo();
  const { data: eventos, isLoading: loadingEventos } = useEventos();
  const [eventoSelecionado, setEventoSelecionadoState] = useState<Evento | null>(null);

  // Load selected event from localStorage on mount
  useEffect(() => {
    const savedId = localStorage.getItem(EVENTO_SELECIONADO_KEY);
    if (savedId && eventos) {
      const evento = eventos.find(e => e.id === savedId);
      if (evento) {
        setEventoSelecionadoState(evento);
      } else {
        // Remove invalid ID from localStorage
        localStorage.removeItem(EVENTO_SELECIONADO_KEY);
      }
    }
  }, [eventos]);

  // Fallback to active event if no event is selected
  useEffect(() => {
    if (!eventoSelecionado && eventoAtivo) {
      setEventoSelecionadoState(eventoAtivo);
    }
  }, [eventoAtivo, eventoSelecionado]);

  const setEventoSelecionado = (evento: Evento | null) => {
    if (evento) {
      localStorage.setItem(EVENTO_SELECIONADO_KEY, evento.id);
      setEventoSelecionadoState(evento);
    } else {
      localStorage.removeItem(EVENTO_SELECIONADO_KEY);
      setEventoSelecionadoState(eventoAtivo);
    }
  };

  const value: EventoContextType = {
    eventoAtivo,
    eventoSelecionado: eventoSelecionado || eventoAtivo,
    setEventoSelecionado,
    isLoading: loadingAtivo || loadingEventos,
    error,
  };

  return (
    <EventoContext.Provider value={value}>
      {children}
    </EventoContext.Provider>
  );
};

export const useEventoContext = (): EventoContextType => {
  const context = useContext(EventoContext);
  if (context === undefined) {
    throw new Error('useEventoContext deve ser usado dentro de um EventoProvider');
  }
  return context;
};