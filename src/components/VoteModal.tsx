import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCreateVoto } from "@/hooks/useVotos";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Ideia } from "@/hooks/useIdeias";

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
  onVoteSuccess,
}: VoteModalProps) => {
  const [nomeRestauranteVotante, setNomeRestauranteVotante] = useState("");
  const [whatsappVotante, setWhatsappVotante] = useState("");
  const [nome, setNome] = useState("");
  const [ehCliente, setEhCliente] = useState("");

  const { mutateAsync: createVoto, isPending: isLoading } = useCreateVoto();
  const isMobile = useIsMobile();

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      if (value.length > 6) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      } else if (value.length > 2) {
        value = value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
      } else if (value.length > 0) {
        value = value.replace(/(\d{0,2})/, "($1");
      }
    }
    setWhatsappVotante(value);
  };

  const handleSubmit = async () => {
    if (!ideia) return;

    onVoteStart?.(ideia.id);

    try {
      const votoData = {
        ideia_id: ideia.id,
        nome_restaurante_votante: ehCliente === "sim" ? nomeRestauranteVotante : "",
        whatsapp_votante: whatsappVotante,
        telefone_votante: whatsappVotante,
        nome_votante: nome,
        eh_cliente: ehCliente === "sim",
      };

      await createVoto(votoData);

      // Reset form
      setNomeRestauranteVotante("");
      setWhatsappVotante("");
      setNome("");
      setEhCliente("");

      onVoteSuccess?.(ideia.id);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done by the hook
    }
  };

  const isFormValid = ehCliente && whatsappVotante && nome && (ehCliente === "nao" || nomeRestauranteVotante);

  const content = (
    ideia && (
      <div className="space-y-4">
        <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/10">
          <h3 className="font-medium text-sm text-muted-foreground mb-2">Você está votando em:</h3>
          <p className="font-semibold text-lg text-primary mb-1">{ideia?.titulo}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{ideia?.descricao}</p>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium text-foreground">Você é cliente Saipos?</Label>
          <RadioGroup
            value={ehCliente}
            onValueChange={setEhCliente}
            className="flex flex-row space-x-4"
          >
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="sim" id="sim" className="border-2" />
              <Label htmlFor="sim" className="text-sm font-medium flex-1 cursor-pointer">Sou cliente</Label>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="nao" id="nao" className="border-2" />
              <Label htmlFor="nao" className="text-sm font-medium flex-1 cursor-pointer">Não sou cliente</Label>
            </div>
          </RadioGroup>
        </div>

        {ehCliente === "sim" && (
          <div className="space-y-2">
            <Label htmlFor="nome-restaurante" className="text-base font-medium text-foreground">
              Nome da loja ou ID Saipos ou CNPJ
            </Label>
            <Input
              id="nome-restaurante"
              type="text"
              value={nomeRestauranteVotante}
              onChange={(e) => setNomeRestauranteVotante(e.target.value)}
              placeholder="Digite o nome da sua loja, ID Saipos ou CNPJ"
              className="w-full h-12 text-base rounded-xl border-2 focus:border-primary transition-colors"
              autoFocus={false}
              tabIndex={-1}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="text-base font-medium text-foreground">
            WhatsApp
          </Label>
          <Input
            id="whatsapp"
            type="tel"
            value={whatsappVotante}
            onChange={handleWhatsAppChange}
            placeholder="(11) 99999-9999"
            className="w-full h-12 text-base rounded-xl border-2 focus:border-primary transition-colors"
            autoFocus={false}
            tabIndex={-1}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome" className="text-base font-medium text-foreground">
            Seu Nome
          </Label>
          <Input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite seu nome"
            className="w-full h-12 text-base rounded-xl border-2 focus:border-primary transition-colors"
            autoFocus={false}
            tabIndex={-1}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1 h-12 text-base rounded-xl border-2 hover:bg-muted/50 transition-all"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !isFormValid}
            className="flex-1 h-12 text-base rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all shadow-lg disabled:opacity-50"
          >
            {isLoading ? "Votando..." : "Confirmar Voto"}
          </Button>
        </div>
      </div>
    )
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] overflow-y-auto rounded-t-xl border-0 bg-gradient-to-b from-background to-muted/30"
        >
          <SheetHeader className="text-center pb-4 pt-2">
            <SheetTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Votar na ideia
            </SheetTitle>
          </SheetHeader>
          <div>
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-background to-muted/30">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Votar na ideia
          </DialogTitle>
        </DialogHeader>
        <div>
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
};