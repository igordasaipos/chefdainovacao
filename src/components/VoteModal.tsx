import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [naoSouCliente, setNaoSouCliente] = useState(false);
  const createVoto = useCreateVoto();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideia) return;
    try {
      await createVoto.mutateAsync({
        ideia_id: ideia.id,
        ...formData,
        telefone_votante: '', // Campo removido da UI mas necessário para o banco
        nome_restaurante_votante: naoSouCliente ? "Não sou cliente" : formData.nome_restaurante_votante
      });

      // Reset form and close modal
      setFormData({
        nome_restaurante_votante: '',
        whatsapp_votante: ''
      });
      setNaoSouCliente(false);
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };
  const isValid = formData.nome_restaurante_votante.trim() && formData.whatsapp_votante.trim();
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar seu voto</DialogTitle>
        </DialogHeader>
        
        {ideia && <div className="mb-4 p-3 bg-muted rounded-lg">
            <h3 className="font-semibold text-sm">{ideia.titulo}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {ideia.descricao}
            </p>
          </div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome_restaurante">Nome da loja/ID Saipos/ CNPJ </Label>
            <Input 
              id="nome_restaurante" 
              value={formData.nome_restaurante_votante} 
              onChange={e => setFormData(prev => ({
                ...prev,
                nome_restaurante_votante: e.target.value
              }))} 
              placeholder="Digite seu ID Saipos, CNPJ ou nome" 
              required 
            />
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="nao-cliente" 
                checked={naoSouCliente}
                onCheckedChange={(checked) => {
                  setNaoSouCliente(checked as boolean);
                }}
              />
              <Label htmlFor="nao-cliente" className="text-sm font-normal">
                Não sou cliente
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" value={formData.whatsapp_votante} onChange={e => setFormData(prev => ({
            ...prev,
            whatsapp_votante: e.target.value
          }))} placeholder="(11) 99999-9999" required />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || createVoto.isPending} className="flex-1">
              {createVoto.isPending ? 'Votando...' : 'Confirmar Voto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
};