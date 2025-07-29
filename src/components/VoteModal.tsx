import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCreateVoto } from '@/hooks/useVotos';
import { Ideia } from '@/hooks/useIdeias';

interface VoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ideia: Ideia | null;
}

export const VoteModal = ({
  open,
  onOpenChange,
  ideia
}: VoteModalProps) => {
  const [formData, setFormData] = useState({
    nome_restaurante_votante: '',
    whatsapp_votante: ''
  });
  const [ehCliente, setEhCliente] = useState('true'); // 'true' for cliente, 'false' for não cliente
  const createVoto = useCreateVoto();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideia) return;

    const votoData = {
      ideia_id: ideia.id,
      telefone_votante: formData.whatsapp_votante, // Usar WhatsApp no telefone_votante para evitar constraint duplicate
      nome_restaurante_votante: formData.nome_restaurante_votante,
      whatsapp_votante: formData.whatsapp_votante,
      eh_cliente: ehCliente === 'true'
    };

    try {
      await createVoto.mutateAsync(votoData);
      
      // Reset form after successful vote
      setFormData({
        nome_restaurante_votante: '',
        whatsapp_votante: ''
      });
      setEhCliente('true');
      
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  // Always show full form
  const isValid = formData.nome_restaurante_votante.trim() && formData.whatsapp_votante.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Confirmar seu voto</DialogTitle>
        </DialogHeader>
        
        {ideia && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <h3 className="font-semibold text-sm">{ideia.titulo}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {ideia.descricao}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Você é cliente Saipos?</Label>
            <RadioGroup value={ehCliente} onValueChange={setEhCliente} className="flex flex-row gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="sou-cliente" />
                <Label htmlFor="sou-cliente" className="text-sm font-normal cursor-pointer">
                  Sou cliente
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="nao-sou-cliente" />
                <Label htmlFor="nao-sou-cliente" className="text-sm font-normal cursor-pointer">
                  Não sou cliente
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome_restaurante" className="text-sm font-medium">
              Nome da loja ou ID Saipos ou CNPJ
            </Label>
            <Input 
              id="nome_restaurante" 
              value={formData.nome_restaurante_votante} 
              onChange={e => setFormData(prev => ({
                ...prev,
                nome_restaurante_votante: e.target.value
              }))} 
              placeholder="Nome da loja ou ID Saipos ou CNPJ" 
              required 
              className="min-h-[44px] text-base sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-sm font-medium">
              WhatsApp
            </Label>
            <Input 
              id="whatsapp" 
              value={formData.whatsapp_votante} 
              onChange={e => {
                // Remove all non-numeric characters
                const numbers = e.target.value.replace(/\D/g, '');
                
                // Apply Brazilian phone mask: (XX) XXXXX-XXXX
                let formatted = numbers;
                if (numbers.length >= 2) {
                  formatted = `(${numbers.substring(0, 2)}) ${numbers.substring(2)}`;
                }
                if (numbers.length >= 7) {
                  formatted = `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7, 11)}`;
                }
                
                setFormData(prev => ({
                  ...prev,
                  whatsapp_votante: formatted
                }));
              }} 
              placeholder="(11) 99999-9999" 
              required 
              className="min-h-[44px] text-base sm:text-sm"
              type="tel"
              maxLength={15}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1 min-h-[44px] text-base sm:text-sm order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!isValid || createVoto.isPending} 
              className="flex-1 min-h-[44px] text-base sm:text-sm order-1 sm:order-2"
            >
              {createVoto.isPending ? 'Votando...' : 'Confirmar Voto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};