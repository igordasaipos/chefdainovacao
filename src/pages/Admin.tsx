import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIdeias, useCreateIdeia, useUpdateIdeia, useDeleteIdeia, Ideia } from '@/hooks/useIdeias';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { ComplexityBadge } from '@/components/ComplexityBadge';
import { LogOut, Plus, Edit, Trash2, Download, BarChart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Admin = () => {
  const { adminEmail, isAdmin, signOut, loading } = useAuth();
  const { data: ideias, refetch: refetchIdeias } = useIdeias();
  const createIdeia = useCreateIdeia();
  const updateIdeia = useUpdateIdeia();
  const deleteIdeia = useDeleteIdeia();

  const [ideaForm, setIdeaForm] = useState<{
    titulo: string;
    descricao: string;
    complexidade: '1h30' | '3h' | '1turno' | 'complexa';
    status: 'caixinha' | 'votacao' | 'desenvolvimento' | 'finalizada';
    criado_por: string;
    desenvolvedor: string;
    nome_restaurante: string;
    whatsapp_criador: string;
    observacao: string;
  }>({
    titulo: '',
    descricao: '',
    complexidade: '1h30',
    status: 'caixinha',
    criado_por: '',
    desenvolvedor: '',
    nome_restaurante: '',
    whatsapp_criador: '',
    observacao: ''
  });
  const [editingIdea, setEditingIdea] = useState<Ideia | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    complexidade: '',
    criador: ''
  });

  // Real-time subscription
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('admin-ideias')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ideias' },
        () => refetchIdeias()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, refetchIdeias]);

  // Add example ideas on first load
  useEffect(() => {
    if (isAdmin && ideias && ideias.length === 0) {
      addExampleIdeas();
    }
  }, [isAdmin, ideias]);

  const addExampleIdeas = async () => {
    const exampleIdeas = [
      // Ideias na Caixinha (4)
      {
        titulo: "Sistema de Fidelidade com Pontos e Recompensas",
        descricao: "Programa completo de fidelidade onde clientes acumulam pontos a cada compra e podem trocar por descontos, pratos gratuitos ou brindes exclusivos. Inclui sistema de níveis (Bronze, Prata, Ouro) com benefícios crescentes.",
        complexidade: "complexa" as const,
        status: "caixinha" as const,
        criado_por: "Ana Marketing - Pizzaria Bella Napoli",
        nome_restaurante: "Pizzaria Bella Napoli",
        whatsapp_criador: "(11) 99123-4567",
        desenvolvedor: "",
        observacao: "Integração com sistema de CRM necessária. Analisar impacto nos custos operacionais."
      },
      {
        titulo: "App para Pedidos Antecipados com Agendamento",
        descricao: "Aplicativo mobile que permite aos clientes fazer pedidos com antecedência, escolher horário de retirada e receber notificações quando o pedido estiver pronto.",
        complexidade: "1turno" as const,
        status: "caixinha" as const,
        criado_por: "Carlos Operações - Lanchonete Fast Food",
        nome_restaurante: "Lanchonete Fast Food Express",
        whatsapp_criador: "(11) 98234-5678",
        desenvolvedor: "",
        observacao: "Pode reduzir filas e melhorar experiência do cliente"
      },
      {
        titulo: "Integração com Plataforma de Delivery Própria",
        descricao: "Sistema de delivery próprio integrado ao PDV, com rastreamento em tempo real, cálculo automático de taxa de entrega por distância e gestão de entregadores.",
        complexidade: "complexa" as const,
        status: "caixinha" as const,
        criado_por: "Roberto CEO - Hamburgueria Premium",
        nome_restaurante: "Burger King Premium",
        whatsapp_criador: "(11) 97345-6789",
        desenvolvedor: "",
        observacao: "Concorrer com iFood e Uber Eats. Analisar viabilidade financeira."
      },
      {
        titulo: "Sistema de Feedback Automatizado pós-Compra",
        descricao: "Envio automático de pesquisa de satisfação via WhatsApp ou SMS após cada venda, com dashboard para análise dos feedbacks e identificação de pontos de melhoria.",
        complexidade: "3h" as const,
        status: "caixinha" as const,
        criado_por: "Marina Qualidade - Restaurante Família",
        nome_restaurante: "Restaurante Família Tradicional",
        whatsapp_criador: "(11) 96456-7890",
        desenvolvedor: "",
        observacao: "Importante para melhoria contínua do atendimento"
      },

      // Ideias em Votação (3)
      {
        titulo: "Cardápio Digital com QR Code Interativo",
        descricao: "Sistema de cardápio digital acessível via QR Code na mesa, com fotos dos pratos, informações nutricionais, avaliações de outros clientes e possibilidade de fazer pedidos direto pelo celular.",
        complexidade: "1turno" as const,
        status: "votacao" as const,
        criado_por: "Paula UX - Bistrô Gourmet",
        nome_restaurante: "Bistrô Gourmet & Wine",
        whatsapp_criador: "(11) 95567-8901",
        desenvolvedor: "",
        observacao: "Reduz custos de impressão e melhora experiência do cliente"
      },
      {
        titulo: "Sistema de Reservas Online com Gestão de Mesas",
        descricao: "Plataforma web para reservas online com visualização da disponibilidade em tempo real, confirmação automática via WhatsApp e sistema de gestão de mesas para otimizar ocupação.",
        complexidade: "1turno" as const,
        status: "votacao" as const,
        criado_por: "Diego Gerente - Restaurante Vista Mar",
        nome_restaurante: "Restaurante Vista Mar",
        whatsapp_criador: "(11) 94678-9012",
        desenvolvedor: "",
        observacao: "Especialmente útil para fins de semana e datas comemorativas"
      },
      {
        titulo: "Programa de Cashback Personalizado",
        descricao: "Sistema de cashback que oferece porcentagem de volta diferenciada baseada no perfil do cliente, frequência de visitas e valor gasto, com créditos que podem ser usados em compras futuras.",
        complexidade: "3h" as const,
        status: "votacao" as const,
        criado_por: "Fernanda Financeiro - Café Central",
        nome_restaurante: "Café Central Downtown",
        whatsapp_criador: "(11) 93789-0123",
        desenvolvedor: "",
        observacao: "Aumenta fidelização e ticket médio"
      },

      // Ideias em Desenvolvimento (2)
      {
        titulo: "Dashboard Avançado de Métricas de Vendas",
        descricao: "Painel gerencial com métricas em tempo real: vendas por período, produtos mais vendidos, análise de lucratividade, comparativos mensais, previsão de demanda e alertas de performance.",
        complexidade: "1turno" as const,
        status: "desenvolvimento" as const,
        criado_por: "Alexandre BI - Rede FastMeal",
        nome_restaurante: "Rede FastMeal (5 unidades)",
        whatsapp_criador: "(11) 92890-1234",
        desenvolvedor: "Equipe Data Analytics - Squad BI",
        observacao: "MVP 80% completo. Faltam apenas os alertas automatizados."
      },
      {
        titulo: "Sistema de Gestão de Estoque Inteligente",
        descricao: "Controle automatizado de estoque com alertas de produtos em baixa, sugestões de compra baseadas no histórico de vendas, integração com fornecedores e controle de validade.",
        complexidade: "complexa" as const,
        status: "desenvolvimento" as const,
        criado_por: "Lucia Compras - Supermercado Bom Preço",
        nome_restaurante: "Supermercado Bom Preço",
        whatsapp_criador: "(11) 91901-2345",
        desenvolvedor: "Time Backend - Squad Inventory",
        observacao: "Primeira fase: alertas básicos. Segunda fase: IA para predição de demanda."
      },

      // Ideias Finalizadas (1)
      {
        titulo: "Integração Completa com WhatsApp Business API",
        descricao: "Sistema completo de atendimento via WhatsApp Business com chatbot para primeiros atendimentos, integração com cardápio, recebimento de pedidos, confirmação de pagamento e notificações de status.",
        complexidade: "1turno" as const,
        status: "finalizada" as const,
        criado_por: "Ricardo TI - Pizzaria do Bairro",
        nome_restaurante: "Pizzaria do Bairro",
        whatsapp_criador: "(11) 90012-3456",
        desenvolvedor: "Sarah WhatsApp Specialist - Squad Integrations",
        observacao: "Implementado com sucesso! Aumento de 40% nos pedidos via WhatsApp."
      }
    ];

    // Adicionar votos aleatórios para ideias em votação
    const ideiasComVotos = exampleIdeas.map(idea => {
      if (idea.status === 'votacao') {
        return { ...idea, votos: Math.floor(Math.random() * 50) + 10 };
      }
      return idea;
    });

    console.log('Criando ideias de exemplo...');
    for (const idea of ideiasComVotos) {
      try {
        await createIdeia.mutateAsync(idea);
      } catch (error) {
        console.error('Erro ao criar ideia:', idea.titulo, error);
      }
    }
    console.log('Ideias de exemplo criadas com sucesso!');
  };

  const handleSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingIdea) {
      await updateIdeia.mutateAsync({
        id: editingIdea.id,
        updates: ideaForm
      });
    } else {
      await createIdeia.mutateAsync(ideaForm);
    }
    
    // Reset form
    setIdeaForm({
      titulo: '',
      descricao: '',
      complexidade: '1h30',
      status: 'caixinha',
      criado_por: '',
      desenvolvedor: '',
      nome_restaurante: '',
      whatsapp_criador: '',
      observacao: ''
    });
    setEditingIdea(null);
    setIsFormOpen(false);
  };

  const handleEdit = (ideia: Ideia) => {
    setIdeaForm({
      titulo: ideia.titulo,
      descricao: ideia.descricao || '',
      complexidade: ideia.complexidade,
      status: ideia.status,
      criado_por: ideia.criado_por,
      desenvolvedor: ideia.desenvolvedor || '',
      nome_restaurante: ideia.nome_restaurante || '',
      whatsapp_criador: ideia.whatsapp_criador || '',
      observacao: ideia.observacao || ''
    });
    setEditingIdea(ideia);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta funcionalidade?')) {
      await deleteIdeia.mutateAsync(id);
    }
  };

  const handleExportVotes = async (ideiaId: string) => {
    const { data: votos } = await supabase
      .from('votos')
      .select('*')
      .eq('ideia_id', ideiaId);

    if (votos && votos.length > 0) {
      const csv = [
        'Nome Restaurante,Telefone,WhatsApp,Data',
        ...votos.map(voto => 
          `${voto.nome_restaurante_votante},${voto.telefone_votante},${voto.whatsapp_votante},${new Date(voto.created_at).toLocaleString('pt-BR')}`
        )
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `votantes-${ideiaId}.csv`;
      a.click();
    }
  };

  const filteredIdeias = ideias?.filter(ideia => {
    return (!filters.status || filters.status === 'todos' || ideia.status === filters.status) &&
           (!filters.complexidade || filters.complexidade === 'todas' || ideia.complexidade === filters.complexidade) &&
           (!filters.criador || ideia.criado_por.toLowerCase().includes(filters.criador.toLowerCase()));
  }) || [];

  const stats = {
    total: ideias?.length || 0,
    caixinha: ideias?.filter(i => i.status === 'caixinha').length || 0,
    votacao: ideias?.filter(i => i.status === 'votacao').length || 0,
    desenvolvimento: ideias?.filter(i => i.status === 'desenvolvimento').length || 0,
    finalizada: ideias?.filter(i => i.status === 'finalizada').length || 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!adminEmail || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado como admin para acessar esta página.
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">iFood Move 2024</h1>
          <p className="text-muted-foreground">Sistema Administrativo Saipos</p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Olá, {adminEmail}
            </span>
            <Button variant="outline" onClick={signOut} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.caixinha}</div>
              <div className="text-xs text-muted-foreground">Caixinha</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.votacao}</div>
              <div className="text-xs text-muted-foreground">Votação</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.desenvolvimento}</div>
              <div className="text-xs text-muted-foreground">Desenvolvimento</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.finalizada}</div>
              <div className="text-xs text-muted-foreground">Finalizada</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingIdea(null);
                setIdeaForm({
                  titulo: '',
                  descricao: '',
                  complexidade: '1h30',
                  status: 'caixinha',
                  criado_por: '',
                  desenvolvedor: '',
                  nome_restaurante: '',
                  whatsapp_criador: '',
                  observacao: ''
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Funcionalidade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingIdea ? 'Editar Funcionalidade' : 'Nova Funcionalidade'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitIdea} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={ideaForm.titulo}
                      onChange={(e) => setIdeaForm(prev => ({ ...prev, titulo: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="criado_por">Criado por *</Label>
                    <Input
                      id="criado_por"
                      value={ideaForm.criado_por}
                      onChange={(e) => setIdeaForm(prev => ({ ...prev, criado_por: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={ideaForm.descricao}
                    onChange={(e) => setIdeaForm(prev => ({ ...prev, descricao: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="complexidade">Complexidade</Label>
                    <Select 
                      value={ideaForm.complexidade} 
                      onValueChange={(value) => setIdeaForm(prev => ({ ...prev, complexidade: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h30">1h30</SelectItem>
                        <SelectItem value="3h">3h</SelectItem>
                        <SelectItem value="1turno">1 Turno</SelectItem>
                        <SelectItem value="complexa">Complexa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={ideaForm.status} 
                      onValueChange={(value) => setIdeaForm(prev => ({ ...prev, status: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="caixinha">Na Caixinha</SelectItem>
                        <SelectItem value="votacao">Em Votação</SelectItem>
                        <SelectItem value="desenvolvimento">Em Desenvolvimento</SelectItem>
                        <SelectItem value="finalizada">Finalizada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome_restaurante">Nome/ID Restaurante</Label>
                    <Input
                      id="nome_restaurante"
                      value={ideaForm.nome_restaurante}
                      onChange={(e) => setIdeaForm(prev => ({ ...prev, nome_restaurante: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_criador">WhatsApp Criador</Label>
                    <Input
                      id="whatsapp_criador"
                      value={ideaForm.whatsapp_criador}
                      onChange={(e) => setIdeaForm(prev => ({ ...prev, whatsapp_criador: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desenvolvedor">Desenvolvedor</Label>
                  <Input
                    id="desenvolvedor"
                    value={ideaForm.desenvolvedor}
                    onChange={(e) => setIdeaForm(prev => ({ ...prev, desenvolvedor: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacao">Observação</Label>
                  <Textarea
                    id="observacao"
                    value={ideaForm.observacao}
                    onChange={(e) => setIdeaForm(prev => ({ ...prev, observacao: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingIdea ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={addExampleIdeas}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Exemplos
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="filter-status">Filtrar por Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="caixinha">Na Caixinha</SelectItem>
                    <SelectItem value="votacao">Em Votação</SelectItem>
                    <SelectItem value="desenvolvimento">Em Desenvolvimento</SelectItem>
                    <SelectItem value="finalizada">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-complexity">Filtrar por Complexidade</Label>
                <Select value={filters.complexidade} onValueChange={(value) => setFilters(prev => ({ ...prev, complexidade: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as complexidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="1h30">1h30</SelectItem>
                    <SelectItem value="3h">3h</SelectItem>
                    <SelectItem value="1turno">1 Turno</SelectItem>
                    <SelectItem value="complexa">Complexa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-creator">Filtrar por Criador</Label>
                <Input
                  id="filter-creator"
                  placeholder="Nome do criador"
                  value={filters.criador}
                  onChange={(e) => setFilters(prev => ({ ...prev, criador: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({ status: '', complexidade: '', criador: '' })}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ideas List */}
        <div className="space-y-4">
          {filteredIdeias.map((ideia) => (
            <Card key={ideia.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{ideia.titulo}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <StatusBadge status={ideia.status} />
                      <ComplexityBadge complexity={ideia.complexidade} />
                      <Badge variant="outline">{ideia.votos} votos</Badge>
                    </div>
                    {ideia.descricao && (
                      <p className="text-sm text-muted-foreground mb-2">{ideia.descricao}</p>
                    )}
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div><strong>Criado por:</strong> {ideia.criado_por}</div>
                      {ideia.nome_restaurante && <div><strong>Restaurante:</strong> {ideia.nome_restaurante}</div>}
                      {ideia.desenvolvedor && <div><strong>Desenvolvedor:</strong> {ideia.desenvolvedor}</div>}
                      {ideia.observacao && <div><strong>Observação:</strong> {ideia.observacao}</div>}
                      <div><strong>Criado em:</strong> {new Date(ideia.criado_em).toLocaleString('pt-BR')}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(ideia)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExportVotes(ideia.id)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(ideia.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredIdeias.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma funcionalidade encontrada com os filtros aplicados.</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Saipos Innovation Week 2024 - Plataforma de Gestão de Funcionalidades</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
