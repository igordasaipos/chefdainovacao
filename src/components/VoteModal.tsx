import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCreateVoto } from '@/hooks/useVotos';
import { Ideia } from '@/hooks/useIdeias';
import { useIsMobile } from '@/hooks/use-mobile';

interface VoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ideia: Ideia | null;
  onVoteStart?: (ideiaId: string) => void;
  onVoteSuccess?: (ideiaId: string) => void;
}

export const VoteModal = ({
  open,
  onOpenChange,
  ideia,
  onVoteStart,
  onVoteSuccess
}: VoteModalProps) => {
  const [formData, setFormData] = useState({
    nome_restaurante_votante: '',
    whatsapp_votante: '',
    nome: ''
  });
  const [ehCliente, setEhCliente] = useState('true'); // 'true' for cliente, 'false' for não cliente
  const createVoto = useCreateVoto();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideia) return;

    const votoData = {
      ideia_id: ideia.id,
      telefone_votante: formData.whatsapp_votante, // Usar WhatsApp no telefone_votante para evitar constraint duplicate
      nome_restaurante_votante: ehCliente === 'true' ? formData.nome_restaurante_votante : `${formData.nome} (Não é cliente)`,
      whatsapp_votante: formData.whatsapp_votante,
      eh_cliente: ehCliente === 'true'
    };

    try {
      // Notify parent component that voting started
      if (onVoteStart) {
        onVoteStart(ideia.id);
      }

      await createVoto.mutateAsync(votoData);
      
      // Reset form after successful vote
      setFormData({
        nome_restaurante_votante: '',
        whatsapp_votante: '',
        nome: ''
      });
      setEhCliente('true');
      
      // Notify parent component of successful vote
      if (onVoteSuccess) {
        onVoteSuccess(ideia.id);
      }
      
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  // Conditional validation based on client type
  const isValid = ehCliente === 'true' 
    ? formData.nome_restaurante_votante.trim() && formData.whatsapp_votante.trim() && formData.nome.trim()
    : formData.whatsapp_votante.trim() && formData.nome.trim();

  const formContent = (
    <>
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
              <Label htmlFor="sou-cliente" className="text-sm font-normal cursor-pointer min-h-[44px] flex items-center">
                Sou cliente
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="nao-sou-cliente" />
              <Label htmlFor="nao-sou-cliente" className="text-sm font-normal cursor-pointer min-h-[44px] flex items-center">
                Não sou cliente
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Conditional fields based on client type */}
        {ehCliente === 'true' && (
          <div className="space-y-2">
            <Label htmlFor="nome_restaurante" className="text-sm font-medium">
              Nome da loja ou ID Saipos ou CNPJ *
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
              className="min-h-[48px] text-base"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="text-sm font-medium">
            WhatsApp *
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
            className="min-h-[48px] text-base"
            type="tel"
            maxLength={15}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome" className="text-sm font-medium">
            Nome *
          </Label>
          <Input 
            id="nome" 
            value={formData.nome} 
            onChange={e => setFormData(prev => ({
              ...prev,
              nome: e.target.value
            }))} 
            placeholder="Seu nome completo" 
            required 
            className="min-h-[48px] text-base"
          />
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button 
            type="submit" 
            disabled={!isValid || createVoto.isPending} 
            className="w-full min-h-[48px] text-base font-medium"
          >
            {createVoto.isPending ? 'Votando...' : 'Confirmar Voto'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="w-full min-h-[48px] text-base"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
        <DrawerContent className="max-h-[90vh] px-4 pb-safe focus-within:max-h-[70vh] ios-keyboard-adjust">
          <DrawerHeader className="px-0">
            <DrawerTitle className="text-lg text-left">Confirmar seu voto</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto flex-1 pb-4">
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Confirmar seu voto</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};