import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useCreateIdeia } from '@/hooks/useIdeias';
import { useEventoContext } from '@/contexts/EventoContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Função para capturar dados do usuário do localStorage
const capturarDadosUsuario = () => {
  try {
    const userData = localStorage.getItem('ngStorage-user');
    if (userData) {
      const user = JSON.parse(userData);
      console.log('Dados do usuário capturados do localStorage:', user);
      
      const nome = user.full_name || user.first_name || 'Cliente';
      console.log('Nome capturado:', nome);
      
      return {
        nome,
        id_user: user.id_user,
        email: user.email || user.login,
        user_type: user.user_type,
        full_user_data: user
      };
    }
    
    console.warn('ngStorage-user não encontrado no localStorage');
    return null;
  } catch (error) {
    console.error('Erro ao capturar dados do localStorage:', error);
    return null;
  }
};

// Função para capturar dados da loja atual do localStorage
const capturarDadosLoja = () => {
  try {
    const storeData = localStorage.getItem('ngStorage-currentStore');
    if (storeData) {
      const store = JSON.parse(storeData);
      console.log('Dados da loja capturados do localStorage:', store);
      
      const storeId = parseInt(store.id_store, 10);
      const storeName = store.store_name || store.nome || `Loja ${storeId}`;
      
      return {
        id_store: isNaN(storeId) ? null : storeId,
        store_name: storeName,
        full_store_data: store
      };
    }
    
    console.warn('ngStorage-currentStore não encontrado no localStorage');
    return null;
  } catch (error) {
    console.error('Erro ao capturar dados da loja:', error);
    return null;
  }
};

export const Caixinha = () => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [complexidade, setComplexidade] = useState<'1h30' | '3h' | '1turno' | 'complexa' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nomeCliente, setNomeCliente] = useState<string>('');
  const [storeId, setStoreId] = useState<number | null>(null);
  const [storeName, setStoreName] = useState<string>('');
  
  const { eventoSelecionado } = useEventoContext();
  const createIdeia = useCreateIdeia();
  const { toast } = useToast();

  // Capturar dados do cliente e loja quando a página carregar
  useEffect(() => {
    const capturarDados = () => {
      const userData = capturarDadosUsuario();
      if (userData?.nome) {
        setNomeCliente(userData.nome);
      }
      
      const storeData = capturarDadosLoja();
      if (storeData) {
        setStoreId(storeData.id_store);
        setStoreName(storeData.store_name);
      }
    };

    capturarDados();

    // Monitorar mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ngStorage-currentStore' || e.key === 'ngStorage-user') {
        capturarDados();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o título da sua ideia.",
        variant: "destructive",
      });
      return;
    }

    if (!complexidade) {
      toast({
        title: "Campo obrigatório", 
        description: "Por favor, selecione a complexidade da ideia.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Capturar dados do usuário e loja
      const userData = capturarDadosUsuario();
      const storeData = capturarDadosLoja();
      
      // Preparar dados para salvar
      const ideiaData = {
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        complexidade,
        status: 'caixinha' as const,
        criado_por: 'localStorage_embed',
        admin_criador: userData?.email || 'user_unknown',
        evento_id: eventoSelecionado?.id || '',
        observacao: JSON.stringify({
          user_data: userData,
          store_data: storeData,
          nome_capturado: userData?.nome || nomeCliente,
          store_id: storeData?.id_store,
          store_name: storeData?.store_name,
          origem: 'caixinha_localStorage',
          timestamp: new Date().toISOString()
        }),
        // Campos obrigatórios com valores padrão
        desenvolvedor: null,
        jira: null,
        nome_cliente: userData?.nome || nomeCliente || null,
        nome_restaurante: storeData?.store_name || storeName || null,
        tipo_cliente: 'cliente' as const,
        whatsapp_criador: null,
        whatsapp_votacao_enviado: false,
        whatsapp_desenvolvimento_enviado: false,
        whatsapp_finalizado_enviado: false,
        whatsapp_caixinha_enviado: false
      };

      console.log('Enviando ideia com dados:', ideiaData);

      await createIdeia.mutateAsync(ideiaData);
      
      // Limpar formulário após sucesso
      setTitulo('');
      setDescricao('');
      setComplexidade('');
      
      toast({
        title: "Ideia enviada!",
        description: "Sua sugestão foi registrada com sucesso. Obrigado pela contribuição!",
      });
      
    } catch (error) {
      console.error('Erro ao enviar ideia:', error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar sua ideia. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Chef da Inovação
            </CardTitle>
            {/* Teste h2 para verificar captura do nome */}
            <h2 className="text-lg font-semibold text-foreground mt-2">
              Nome capturado: {nomeCliente || 'Não encontrado'}
            </h2>
            {/* Saudação personalizada */}
            <p className="text-muted-foreground mt-2">
              {nomeCliente ? `Olá ${nomeCliente}! ` : 'Olá! '}
              Compartilhe sua ideia para melhorar nosso produto
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="titulo" className="text-sm font-medium">
                  Título da Ideia *
                </Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Relatório de vendas em tempo real"
                  disabled={isSubmitting}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-sm font-medium">
                  Descrição (opcional)
                </Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva sua ideia com mais detalhes..."
                  disabled={isSubmitting}
                  rows={4}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loja" className="text-sm font-medium">
                  Loja Atual
                </Label>
                <Input
                  id="loja"
                  value={storeId ? `Loja ${storeId}${storeName ? ` - ${storeName}` : ''}` : 'Loja não identificada'}
                  disabled
                  className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complexidade" className="text-sm font-medium">
                  Complexidade Estimada *
                </Label>
                <Select 
                  value={complexidade} 
                  onValueChange={(value: '1h30' | '3h' | '1turno' | 'complexa') => setComplexidade(value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Selecione a complexidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h30">1h30 - Rápida</SelectItem>
                    <SelectItem value="3h">3h - Média</SelectItem>
                    <SelectItem value="1turno">1 Turno - Complexa</SelectItem>
                    <SelectItem value="complexa">Muito Complexa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium transition-all duration-200 hover:scale-[0.98] active:scale-[0.96]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Ideia'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Debug info em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-4 bg-muted/50">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">
                Debug: Evento selecionado - {eventoSelecionado?.nome || 'Nenhum'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};