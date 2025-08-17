import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useEventos } from '@/hooks/useEventos';
import { useEventoContext } from '@/contexts/EventoContext';
import { Calendar } from 'lucide-react';

export const EventSelector: React.FC = () => {
  const { data: eventos, isLoading } = useEventos();
  const { eventoSelecionado, setEventoSelecionado, eventoAtivo } = useEventoContext();

  if (isLoading) {
    return <Skeleton className="h-10 w-48" />;
  }

  if (!eventos || eventos.length <= 1) {
    return null;
  }

  const handleValueChange = (value: string) => {
    const evento = eventos.find(e => e.id === value);
    setEventoSelecionado(evento || null);
  };

  const selectedValue = eventoSelecionado?.id || eventoAtivo?.id || '';

  return (
    <Select value={selectedValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-48 bg-background/95 backdrop-blur">
        <Calendar className="h-4 w-4 mr-2" />
        <SelectValue placeholder="Selecione um evento" />
      </SelectTrigger>
      <SelectContent>
        {eventos.map((evento) => (
          <SelectItem key={evento.id} value={evento.id}>
            <div className="flex items-center justify-between w-full">
              <span>{evento.nome}</span>
              {evento.ativo && (
                <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  Ativo
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};