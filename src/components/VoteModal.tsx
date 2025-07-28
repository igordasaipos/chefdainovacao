import { useState, useEffect } from 'react';
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

interface UserData {
  nome_restaurante_votante: string;
  whatsapp_votante: string;
  eh_cliente: boolean;
}

const getUserDataFromStorage = (): UserData | null => {
  try {
    const data = localStorage.getItem('saipos_user_data');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const saveUserDataToStorage = (data: UserData) => {
  try {
    localStorage.setItem('saipos_user_data', JSON.stringify(data));
  } catch {
    // Silently fail if localStorage is not available
  }
};

export const VoteModal = ({
  open,
  onOpenChange,
  ideia
}: VoteModalProps) => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [formData, setFormData] = useState({
    nome_restaurante_votante: '',
    whatsapp_votante: ''
  });
  const [ehCliente, setEhCliente] = useState('true'); // 'true' for cliente, 'false' for não cliente
  const createVoto = useCreateVoto();

  // Check if user data exists when modal opens
  useEffect(() => {
    if (open) {
      const userData = getUserDataFromStorage();
      if (userData) {
        setIsFirstTime(false);
        setFormData({
          nome_restaurante_votante: userData.nome_restaurante_votante,
          whatsapp_votante: userData.whatsapp_votante
        });
        setEhCliente(userData.eh_cliente ? 'true' : 'false');
      } else {
        setIsFirstTime(true);
        setFormData({
          nome_restaurante_votante: '',
          whatsapp_votante: ''
        });
        setEhCliente('true'); // Default to cliente
      }
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideia) return;

    const votoData = {
      ideia_id: ideia.id,
      telefone_votante: '', // Campo removido da UI mas necessário para o banco
      nome_restaurante_votante: formData.nome_restaurante_votante,
      whatsapp_votante: formData.whatsapp_votante,
      eh_cliente: ehCliente === 'true'
    };

    try {
      await createVoto.mutateAsync(votoData);

      // Save user data to localStorage for future votes
      const userData: UserData = {
        nome_restaurante_votante: formData.nome_restaurante_votante,
        whatsapp_votante: formData.whatsapp_votante,
        eh_cliente: ehCliente === 'true'
      };
      saveUserDataToStorage(userData);

      onOpenChange(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleQuickVote = async () => {
    if (!ideia) return;

    const userData = getUserDataFromStorage();
    if (!userData) return;

    const votoData = {
      ideia_id: ideia.id,
      telefone_votante: '',
      nome_restaurante_votante: userData.nome_restaurante_votante,
      whatsapp_votante: userData.whatsapp_votante,
      eh_cliente: userData.eh_cliente
    };

    try {
      await createVoto.mutateAsync(votoData);
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  if (!isFirstTime) {
    // Quick vote UI for returning users
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

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Confirmar voto com seus dados salvos?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                className="flex-1 min-h-[44px] text-base sm:text-sm order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleQuickVote}
                disabled={createVoto.isPending} 
                className="flex-1 min-h-[44px] text-base sm:text-sm order-1 sm:order-2"
              >
                {createVoto.isPending ? 'Votando...' : 'Confirmar Voto'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // First time vote UI with full form
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
              placeholder="(51) 98924-9280" 
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