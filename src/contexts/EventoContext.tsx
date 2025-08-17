import React, { createContext, useContext, ReactNode } from 'react';
import { useEventoAtivo, Evento } from '@/hooks/useEventos';

interface EventoContextType {
  eventoAtivo: Evento | null;
  isLoading: boolean;
  error: Error | null;
}

const EventoContext = createContext<EventoContextType | undefined>(undefined);

interface EventoProviderProps {
  children: ReactNode;
}

export const EventoProvider: React.FC<EventoProviderProps> = ({ children }) => {
  // Temporarily return null for eventoAtivo until migration is run
  // const { data: eventoAtivo, isLoading, error } = useEventoAtivo();

  const value: EventoContextType = {
    eventoAtivo: null, // Temporarily null until migration is run
    isLoading: false,
    error: null,
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