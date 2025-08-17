import { useState, useEffect } from 'react';
import { Evento } from '@/hooks/useEventos';

const EVENTO_SELECIONADO_KEY = 'evento_selecionado_id';

export const useEventSelector = () => {
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState<string | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem(EVENTO_SELECIONADO_KEY);
    if (savedId) {
      setEventoSelecionadoId(savedId);
    }
  }, []);

  const setEventoSelecionado = (evento: Evento | null) => {
    if (evento) {
      localStorage.setItem(EVENTO_SELECIONADO_KEY, evento.id);
      setEventoSelecionadoId(evento.id);
    } else {
      localStorage.removeItem(EVENTO_SELECIONADO_KEY);
      setEventoSelecionadoId(null);
    }
  };

  return {
    eventoSelecionadoId,
    setEventoSelecionado,
  };
};