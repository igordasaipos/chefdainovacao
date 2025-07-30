import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIdeias, useCreateIdeia, useUpdateIdeia, useDeleteIdeia, Ideia } from '@/hooks/useIdeias';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StatusBadge } from '@/components/StatusBadge';
import { ComplexityBadge } from '@/components/ComplexityBadge';
import { LogOut, Plus, Edit2, Trash2, Download, BarChart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
const Admin = () => {
  const {
    adminEmail,
    isAdmin,
    signOut,
    loading
  } = useAuth();
  const {
    data: ideias,
    refetch: refetchIdeias
  } = useIdeias();
  const createIdeia = useCreateIdeia();
  const updateIdeia = useUpdateIdeia();
  const deleteIdeia = useDeleteIdeia();
  const [ideaForm, setIdeaForm] = useState<{
    titulo: string;
    descricao: string;
    nome_id_saipos_cnpj: string;
    cliente_tipo: 'cliente' | 'nao_cliente';
    whatsapp: string;
    nome: string;
    complexidade: '1h30' | '3h' | '1turno' | 'caixinha';
    status: 'caixinha' | 'votacao' | 'desenvolvimento' | 'finalizado' | 'backlog';
    observacao: string;
    jira: string;
  }>({
    titulo: '',
    descricao: '',
    nome_id_saipos_cnpj: '',
    cliente_tipo: 'cliente',
    whatsapp: '',
    nome: '',
    complexidade: '1h30',
    status: 'caixinha',
    observacao: '',
    jira: ''
  });
  const [editingIdea, setEditingIdea] = useState<Ideia | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState<string | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('total');
  const [filters, setFilters] = useState({
    complexidade: 'all',
    criador: 'all'
  });
  const [admins, setAdmins] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'votos' | 'criado_em'>('criado_em');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Real-time subscription for ideas and votes
  useEffect(() => {
    if (!isAdmin) return;
    
    const ideiasChannel = supabase.channel('admin-ideias').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'ideias'
    }, () => refetchIdeias()).subscribe();

    const votosChannel = supabase.channel('admin-votos').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'votos'
    }, () => refetchIdeias()).subscribe();
    
    return () => {
      supabase.removeChannel(ideiasChannel);
      supabase.removeChannel(votosChannel);
    };
  }, [isAdmin, refetchIdeias]);

  // Load admins data
  useEffect(() => {
    if (isAdmin) {
      const fetchAdmins = async () => {
        const { data } = await supabase.from('admins').select('nome').order('nome');
        if (data) {
          setAdmins(data.map(admin => admin.nome));
        }
      };
      fetchAdmins();
    }
  }, [isAdmin]);

  // Add example ideas on first load
  useEffect(() => {
    if (isAdmin && ideias && ideias.length === 0) {
      addExampleIdeas();
    }
  }, [isAdmin, ideias]);
  const addExampleIdeas = async () => {
    const exampleIdeas = [{
      titulo: "Melhorar filtros de busca",
      descricao: "Adicionar mais opções de filtro para facilitar a busca de restaurantes",
      complexidade: "1h30" as const,
      status: "votacao" as const,
      criado_por: "João Silva",
      nome_restaurante: "Pizzaria Central",
      whatsapp_criador: "(11) 99999-9999",
      desenvolvedor: "",
      observacao: "",
      tipo_cliente: "cliente" as const,
      nome_cliente: "João Silva",
      admin_criador: adminEmail || "admin@sistema.com",
      jira: ""
    }, {
      titulo: "Sistema de avaliações detalhadas",
      descricao: "Permitir avaliações mais específicas dos pratos e serviços",
      complexidade: "3h" as const,
      status: "votacao" as const,
      criado_por: "Nome do dev",
      nome_restaurante: "Restaurante ABC",
      whatsapp_criador: "(11) 88888-8888",
      desenvolvedor: "",
      observacao: "",
      tipo_cliente: "cliente" as const,
      nome_cliente: "Maria Silva",
      admin_criador: adminEmail || "admin@sistema.com",
      jira: ""
    }, {
      titulo: "Chat em tempo real com restaurante",
      descricao: "Sistema de mensagens diretas entre cliente e restaurante",
      complexidade: "1turno" as const,
      status: "desenvolvimento" as const,
      criado_por: "Maria Santos",
      nome_restaurante: "Bistro Gourmet",
      whatsapp_criador: "(11) 77777-7777",
      desenvolvedor: "",
      observacao: "",
      tipo_cliente: "cliente" as const,
      nome_cliente: "Maria Santos",
      admin_criador: adminEmail || "admin@sistema.com",
      jira: ""
    }];
    const ideiasComVotos = exampleIdeas.map((idea, index) => ({
      ...idea,
      votos: [5, 3, 8][index] // Votos específicos para cada ideia
    }));
    for (const idea of ideiasComVotos) {
      try {
        await createIdeia.mutateAsync(idea);
      } catch (error) {
        console.error('Erro ao criar ideia:', idea.titulo, error);
      }
    }
  };
  const handleSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault();

    // Map form fields to new database structure
    const ideaData = {
      titulo: ideaForm.titulo,
      descricao: ideaForm.descricao,
      complexidade: ideaForm.complexidade === 'caixinha' ? 'complexa' as const : ideaForm.complexidade,
      status: ideaForm.status,
      criado_por: ideaForm.nome, // Mantido por compatibilidade
      nome_restaurante: ideaForm.cliente_tipo === 'nao_cliente' ? 'Não é cliente' : ideaForm.nome_id_saipos_cnpj,
      whatsapp_criador: ideaForm.whatsapp,
      desenvolvedor: '',
      observacao: ideaForm.observacao,
      tipo_cliente: ideaForm.cliente_tipo,
      nome_cliente: ideaForm.nome,
      admin_criador: adminEmail || "admin@sistema.com",
      jira: ideaForm.jira
    };
    
    if (editingIdea) {
      await updateIdeia.mutateAsync({
        id: editingIdea.id,
        updates: ideaData
      });
    } else {
      await createIdeia.mutateAsync(ideaData);
    }

    // Reset form
    setIdeaForm({
      titulo: '',
      descricao: '',
      nome_id_saipos_cnpj: '',
      cliente_tipo: 'cliente',
      whatsapp: '',
      nome: '',
      complexidade: '1h30',
      status: 'caixinha',
      observacao: '',
      jira: ''
    });
    setEditingIdea(null);
    setIsFormOpen(false);
  };
  const handleEdit = (ideia: Ideia) => {
    // Extract jira from new field or observacao if it contains concatenated data
    const jira = ideia.jira || '';
    const observacao = ideia.observacao || '';
    
    setIdeaForm({
      titulo: ideia.titulo,
      descricao: ideia.descricao || '',
      nome_id_saipos_cnpj: ideia.tipo_cliente === 'nao_cliente' ? '' : ideia.nome_restaurante || '',
      cliente_tipo: ideia.tipo_cliente || 'cliente',
      whatsapp: ideia.whatsapp_criador || '',
      nome: ideia.nome_cliente || ideia.criado_por,
      complexidade: ideia.complexidade === 'complexa' ? 'caixinha' : ideia.complexidade,
      status: ideia.status,
      observacao: observacao,
      jira: jira
    });
    setEditingIdea(ideia);
    setIsFormOpen(true);
  };
  const handleDeleteClick = (id: string) => {
    setIdeaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (ideaToDelete) {
      await deleteIdeia.mutateAsync(ideaToDelete);
      setDeleteDialogOpen(false);
      setIdeaToDelete(null);
    }
  };
  const handleExportVotes = async (ideiaId: string) => {
    const {
      data: votos
    } = await supabase.from('votos').select('*').eq('ideia_id', ideiaId);
    if (votos && votos.length > 0) {
      const csv = ['Nome Restaurante,Telefone,WhatsApp,Data', ...votos.map(voto => `${voto.nome_restaurante_votante},${voto.telefone_votante},${voto.whatsapp_votante},${new Date(voto.created_at).toLocaleString('pt-BR')}`)].join('\n');
      const blob = new Blob([csv], {
        type: 'text/csv'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `votantes-${ideiaId}.csv`;
      a.click();
    }
  };
  const handleUpdateComplexity = async (ideiaId: string, newComplexity: '1h30' | '3h' | '1turno' | 'complexa') => {
    await updateIdeia.mutateAsync({
      id: ideiaId,
      updates: {
        complexidade: newComplexity
      }
    });
  };
  const handleUpdateStatus = async (ideiaId: string, newStatus: 'caixinha' | 'votacao' | 'desenvolvimento' | 'finalizado' | 'backlog') => {
    await updateIdeia.mutateAsync({
      id: ideiaId,
      updates: {
        status: newStatus
      }
    });
  };
  // Helper function to extract first name from admin email
  const getAdminFirstName = (adminEmail: string) => {
    if (!adminEmail) return 'Sistema';
    
    // Extract the part before @ symbol
    const emailPrefix = adminEmail.split('@')[0];
    
    // If there's a dot, take the part before the first dot
    // Otherwise, take the whole prefix
    const firstName = emailPrefix.includes('.') ? emailPrefix.split('.')[0] : emailPrefix;
    
    return firstName;
  };

  const filteredAndSortedIdeias = ideias?.filter(ideia => {
    const statusMatch = activeStatusFilter === 'total' || ideia.status === activeStatusFilter;
    const complexityMatch = filters.complexidade === 'all' || ideia.complexidade === filters.complexidade;
    const creatorMatch = filters.criador === 'all' || (ideia.admin_criador && ideia.admin_criador.includes(filters.criador));
    
    return statusMatch && complexityMatch && creatorMatch;
  })?.sort((a, b) => {
    if (sortBy === 'votos') {
      return sortOrder === 'asc' ? a.votos - b.votos : b.votos - a.votos;
    } else {
      const dateA = new Date(a.criado_em).getTime();
      const dateB = new Date(b.criado_em).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
  }) || [];
  const stats = {
    total: ideias?.length || 0,
    caixinha: ideias?.filter(i => i.status === 'caixinha').length || 0,
    backlog: ideias?.filter(i => i.status === 'backlog').length || 0,
    votacao: ideias?.filter(i => i.status === 'votacao').length || 0,
    desenvolvimento: ideias?.filter(i => i.status === 'desenvolvimento').length || 0,
    finalizado: ideias?.filter(i => i.status === 'finalizado').length || 0
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>;
  }
  if (!adminEmail || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
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
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600">Gerencie as ideias coletadas no evento</p>
            <p className="text-sm text-gray-500">Logado como: {adminEmail}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => {
            setEditingIdea(null);
            setIdeaForm({
              titulo: '',
              descricao: '',
              nome_id_saipos_cnpj: '',
              cliente_tipo: 'cliente',
              whatsapp: '',
              nome: '',
              complexidade: '1h30',
              status: 'caixinha',
              observacao: '',
              jira: ''
            });
            setIsFormOpen(true);
          }} className="bg-black text-white hover:bg-gray-800" data-qa="admin-create-idea-button">
              <Plus className="h-4 w-4 mr-2" />
              Nova Ideia
            </Button>
            <Button 
              onClick={signOut}
              variant="outline"
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Stats Dashboard - Now Clickable Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card 
            className={`cursor-pointer transition-all hover:scale-105 ${
              activeStatusFilter === 'total' 
                ? 'bg-primary text-primary-foreground shadow-lg border-primary' 
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => setActiveStatusFilter('total')}
            data-qa="admin-filter-total"
          >
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold mb-1">{stats.total}</div>
              <div className="text-sm">Total de Ideias</div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all hover:scale-105 ${
              activeStatusFilter === 'caixinha' 
                ? 'bg-primary text-primary-foreground shadow-lg border-primary' 
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => setActiveStatusFilter('caixinha')}
            data-qa="admin-filter-caixinha"
          >
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold mb-1">{stats.caixinha}</div>
              <div className="text-sm">Caixinha</div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all hover:scale-105 ${
              activeStatusFilter === 'backlog' 
                ? 'bg-primary text-primary-foreground shadow-lg border-primary' 
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => setActiveStatusFilter('backlog')}
            data-qa="admin-filter-backlog"
          >
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold mb-1">{stats.backlog}</div>
              <div className="text-sm">Backlog</div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all hover:scale-105 ${
              activeStatusFilter === 'votacao' 
                ? 'bg-primary text-primary-foreground shadow-lg border-primary' 
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => setActiveStatusFilter('votacao')}
            data-qa="admin-filter-votacao"
          >
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold mb-1">{stats.votacao}</div>
              <div className="text-sm">Votação</div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all hover:scale-105 ${
              activeStatusFilter === 'desenvolvimento' 
                ? 'bg-primary text-primary-foreground shadow-lg border-primary' 
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => setActiveStatusFilter('desenvolvimento')}
            data-qa="admin-filter-desenvolvimento"
          >
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold mb-1">{stats.desenvolvimento}</div>
              <div className="text-sm">Desenvolvimento</div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all hover:scale-105 ${
              activeStatusFilter === 'finalizado' 
                ? 'bg-primary text-primary-foreground shadow-lg border-primary' 
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => setActiveStatusFilter('finalizado')}
            data-qa="admin-filter-finalizado"
          >
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold mb-1">{stats.finalizado}</div>
              <div className="text-sm">Finalizado</div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Filters */}
        <Card className="bg-white mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              {/* Complexity Filter */}
              <div className="space-y-2 flex-1">
                <Label>Filtrar por Complexidade</Label>
                <Select value={filters.complexidade} onValueChange={value => setFilters(prev => ({
                  ...prev,
                  complexidade: value
                }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas complexidades" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="1h30">⚡ 1h30</SelectItem>
                    <SelectItem value="3h">🕒 3h</SelectItem>
                    <SelectItem value="1turno">🌙 1 turno</SelectItem>
                    <SelectItem value="complexa">📦 Complexa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Creator Filter */}
              <div className="space-y-2 flex-1">
                <Label>Filtrar por Admin Criador</Label>
                <Select value={filters.criador} onValueChange={value => setFilters(prev => ({
                  ...prev,
                  criador: value
                }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os admins" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">Todos</SelectItem>
                    {admins.map(admin => (
                      <SelectItem key={admin} value={admin}>{admin}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {(filters.complexidade !== 'all' || filters.criador !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({ complexidade: 'all', criador: 'all' })}
                  className="whitespace-nowrap"
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
            
            {/* Active Filters Display */}
            {(activeStatusFilter !== 'total' || filters.complexidade !== 'all' || filters.criador !== 'all') && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Filtros ativos:</span>
                {activeStatusFilter !== 'total' && (
                  <Badge variant="secondary">
                    Status: {activeStatusFilter}
                  </Badge>
                )}
                {filters.complexidade !== 'all' && (
                  <Badge variant="secondary">
                    Complexidade: {filters.complexidade}
                  </Badge>
                )}
                {filters.criador !== 'all' && (
                  <Badge variant="secondary">
                    Admin: {filters.criador}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ideias List */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900">
              {activeStatusFilter === 'total' ? 'Todas as Ideias' : `Ideias em ${activeStatusFilter}`} ({filteredAndSortedIdeias.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ideia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Complexidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => {
                      if (sortBy === 'votos') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('votos');
                        setSortOrder('desc');
                      }
                    }}>
                      Votos {sortBy === 'votos' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => {
                      if (sortBy === 'criado_em') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('criado_em');
                        setSortOrder('desc');
                      }
                    }}>
                      Criado em {sortBy === 'criado_em' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedIdeias.map(ideia => <tr key={ideia.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ideia.titulo}</div>
                          <div className="text-xs text-gray-500 mt-1">{ideia.descricao}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Select value={ideia.complexidade} onValueChange={(value: '1h30' | '3h' | '1turno' | 'complexa') => handleUpdateComplexity(ideia.id, value)}>
                          <SelectTrigger className="w-auto">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="1h30">⚡ 1h30</SelectItem>
                            <SelectItem value="3h">🕒 3h</SelectItem>
                            <SelectItem value="1turno">🌙 1 turno</SelectItem>
                            <SelectItem value="complexa">📦 Complexa</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4">
                        <Select value={ideia.status} onValueChange={(value: 'caixinha' | 'votacao' | 'desenvolvimento' | 'finalizado' | 'backlog') => handleUpdateStatus(ideia.id, value)}>
                          <SelectTrigger className="w-auto">
                            <SelectValue />
                          </SelectTrigger>
                           <SelectContent className="bg-white z-50">
                            <SelectItem value="caixinha">Caixinha</SelectItem>
                            <SelectItem value="backlog">Backlog</SelectItem>
                            <SelectItem value="votacao">Votação</SelectItem>
                            <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                            <SelectItem value="finalizado">Finalizado</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{ideia.votos}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {getAdminFirstName(ideia.admin_criador || 'Sistema')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">
                          {new Date(ideia.criado_em).toLocaleString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button onClick={() => handleEdit(ideia)} variant="outline" size="sm" data-qa={`admin-edit-${ideia.id}`}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => handleDeleteClick(ideia.id)} variant="destructive" size="sm" data-qa={`admin-delete-${ideia.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog for adding/editing ideas */}
        <Dialog open={isFormOpen} onOpenChange={() => {
          // Impede o fechamento automático por clique no overlay
          // Modal só fecha via botões específicos
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingIdea ? 'Editar Ideia' : 'Nova Ideia'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitIdea} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input id="titulo" value={ideaForm.titulo} onChange={e => setIdeaForm(prev => ({
                ...prev,
                titulo: e.target.value
              }))} required data-qa="admin-form-titulo" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea id="descricao" value={ideaForm.descricao} onChange={e => setIdeaForm(prev => ({
                ...prev,
                descricao: e.target.value
              }))} rows={3} required />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Cliente *</Label>
                <RadioGroup 
                  value={ideaForm.cliente_tipo} 
                  onValueChange={(value: 'cliente' | 'nao_cliente') => {
                    setIdeaForm(prev => ({
                      ...prev,
                      cliente_tipo: value,
                      nome_id_saipos_cnpj: value === 'nao_cliente' ? '' : prev.nome_id_saipos_cnpj
                    }));
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cliente" id="cliente" />
                    <Label htmlFor="cliente">Sou cliente</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao_cliente" id="nao_cliente" />
                    <Label htmlFor="nao_cliente">Não sou cliente</Label>
                  </div>
                </RadioGroup>
              </div>

              {ideaForm.cliente_tipo === 'cliente' && (
                <div className="space-y-2">
                  <Label htmlFor="nome_id_saipos_cnpj">Nome da loja ou ID Saipos ou CNPJ</Label>
                  <Input 
                    id="nome_id_saipos_cnpj" 
                    value={ideaForm.nome_id_saipos_cnpj} 
                    onChange={e => setIdeaForm(prev => ({
                      ...prev,
                      nome_id_saipos_cnpj: e.target.value
                    }))} 
                    placeholder="Nome da loja ou ID Saipos ou CNPJ" 
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <Input id="whatsapp" value={ideaForm.whatsapp} onChange={e => setIdeaForm(prev => ({
                ...prev,
                whatsapp: e.target.value
              }))} placeholder="(11) 99999-9999" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input id="nome" value={ideaForm.nome} onChange={e => setIdeaForm(prev => ({
                ...prev,
                nome: e.target.value
              }))} required />
              </div>

               <div className="space-y-2">
                 <Label htmlFor="complexidade">Complexidade *</Label>
                 <Select value={ideaForm.complexidade} onValueChange={(value: '1h30' | '3h' | '1turno' | 'caixinha') => setIdeaForm(prev => ({
                ...prev,
                complexidade: value
              }))}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-white z-50">
                     <SelectItem value="1h30">⚡ 1h30</SelectItem>
                     <SelectItem value="3h">🕒 3h</SelectItem>
                     <SelectItem value="1turno">🌙 1 turno</SelectItem>
                     <SelectItem value="caixinha">📦 Caixinha</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="status">Status *</Label>
                 <Select value={ideaForm.status} onValueChange={(value: 'caixinha' | 'votacao' | 'desenvolvimento' | 'finalizado' | 'backlog') => setIdeaForm(prev => ({
                ...prev,
                status: value
              }))}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-white z-50">
                      <SelectItem value="caixinha">Caixinha</SelectItem>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="votacao">Votação</SelectItem>
                      <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

              <div className="space-y-2">
                <Label htmlFor="observacao">Observação</Label>
                <Textarea id="observacao" value={ideaForm.observacao} onChange={e => setIdeaForm(prev => ({
                ...prev,
                observacao: e.target.value
              }))} rows={2} placeholder="Campo opcional" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jira">Jira</Label>
                <Input id="jira" value={ideaForm.jira} onChange={e => setIdeaForm(prev => ({
                ...prev,
                jira: e.target.value
              }))} placeholder="Campo opcional" />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="flex-1" data-qa="admin-form-cancel">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" data-qa="admin-form-submit">
                  {editingIdea ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta ideia? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>;
};
export default Admin;