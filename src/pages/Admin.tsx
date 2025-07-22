import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIdeias, useCreateIdeia, useUpdateIdeia, useDeleteIdeia, Ideia } from '@/hooks/useIdeias';
import { useVotos } from '@/hooks/useVotos';
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
  const { user, isAdmin, signIn, signOut, loading } = useAuth();
  const { data: ideias, refetch: refetchIdeias } = useIdeias();
  const createIdeia = useCreateIdeia();
  const updateIdeia = useUpdateIdeia();
  const deleteIdeia = useDeleteIdeia();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
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
      {
        titulo: "Dashboard de Análise de Vendas em Tempo Real",
        descricao: "Sistema de dashboard interativo que mostra vendas em tempo real, com gráficos de performance, produtos mais vendidos e análise de faturamento por período.",
        complexidade: "1turno" as const,
        status: "votacao" as const,
        criado_por: "Maria Silva - Gerente de Produto",
        nome_restaurante: "Restaurante Sabor Brasileiro",
        whatsapp_criador: "(11) 99999-1234",
        desenvolvedor: "",
        observacao: "Integração com API de vendas existente necessária"
      },
      {
        titulo: "Integração com WhatsApp Business para Pedidos",
        descricao: "Funcionalidade que permite receber pedidos diretamente pelo WhatsApp Business, com integração automática ao sistema PDV.",
        complexidade: "3h" as const,
        status: "votacao" as const,
        criado_por: "João Santos - Atendimento",
        nome_restaurante: "Pizzaria Bella Vista",
        whatsapp_criador: "(11) 98888-5678",
        desenvolvedor: "",
        observacao: "Necessário estudo de viabilidade técnica"
      },
      {
        titulo: "Sistema de Fidelidade para Clientes",
        descricao: "Programa de pontos e recompensas para clientes fiéis, com acúmulo de pontos por compra e troca por descontos ou pratos gratuitos.",
        complexidade: "complexa" as const,
        status: "votacao" as const,
        criado_por: "Ana Costa - Marketing",
        nome_restaurante: "Café & Cia",
        whatsapp_criador: "(11) 97777-9012",
        desenvolvedor: "",
        observacao: "Requer integração com sistema de CRM"
      },
      {
        titulo: "App Mobile para Comandas Digitais",
        descricao: "Aplicativo mobile para garçons registrarem pedidos diretamente no smartphone/tablet, eliminando comandas de papel.",
        complexidade: "complexa" as const,
        status: "desenvolvimento" as const,
        criado_por: "Carlos Mendes - Operações",
        nome_restaurante: "Bistrô do Centro",
        whatsapp_criador: "(11) 96666-3456",
        desenvolvedor: "Rafael Tech - Squad Mobile",
        observacao: "MVP em desenvolvimento, previsão 2 semanas"
      },
      {
        titulo: "Integração com PIX para Pagamentos",
        descricao: "Implementação do PIX como forma de pagamento no PDV, com geração automática de QR Code e confirmação instantânea.",
        complexidade: "1turno" as const,
        status: "desenvolvimento" as const,
        criado_por: "Fernanda Lima - Financeiro",
        nome_restaurante: "Lanchonete Quick Food",
        whatsapp_criador: "(11) 95555-7890",
        desenvolvedor: "Lucas Backend - Squad Payments",
        observacao: "Aguardando homologação do Banco Central"
      },
      {
        titulo: "Backup Automático na Nuvem",
        descricao: "Sistema de backup automático diário de todos os dados do PDV para armazenamento seguro em nuvem.",
        complexidade: "3h" as const,
        status: "finalizada" as const,
        criado_por: "Ricardo IT - TI",
        nome_restaurante: "Hamburgueria Top Burger",
        whatsapp_criador: "(11) 94444-1122",
        desenvolvedor: "Marina Cloud - Squad Infrastructure",
        observacao: "Implementado com sucesso, rodando em produção"
      },
      {
        titulo: "Relatório de Performance por Garçom",
        descricao: "Relatório detalhado mostrando performance individual de cada garçom: vendas, tempo médio de atendimento, satisfação do cliente.",
        complexidade: "1h30" as const,
        status: "votacao" as const,
        criado_por: "Patrícia RH - Recursos Humanos",
        nome_restaurante: "Restaurante Famiglia",
        whatsapp_criador: "(11) 93333-4455",
        desenvolvedor: "",
        observacao: "Importante para gestão de equipe"
      },
      {
        titulo: "Impressão de Cupons Personalizados",
        descricao: "Funcionalidade para personalizar cupons fiscais com logo do restaurante, promoções e mensagens especiais.",
        complexidade: "1h30" as const,
        status: "finalizada" as const,
        criado_por: "Gustavo Design - UX/UI",
        nome_restaurante: "Sorveteria Gelato Premium",
        whatsapp_criador: "(11) 92222-6677",
        desenvolvedor: "Amanda Frontend - Squad UX",
        observacao: "Implementado e disponível na versão 2.1"
      }
    ];

    for (const idea of exampleIdeas) {
      await createIdeia.mutateAsync(idea);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(loginForm.email, loginForm.password);
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
    return (!filters.status || ideia.status === filters.status) &&
           (!filters.complexidade || ideia.complexidade === filters.complexidade) &&
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

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Login Administrativo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
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
          <h1 className="text-3xl font-bold">Painel Administrativo - Saipos</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Olá, {user.email}
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
                    <SelectItem value="">Todos</SelectItem>
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
                    <SelectItem value="">Todas</SelectItem>
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
