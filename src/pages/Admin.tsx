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
      {
        titulo: "Melhorar filtros de busca",
        descricao: "Adicionar mais opções de filtro para facilitar a busca de restaurantes",
        complexidade: "1h30" as const,
        status: "votacao" as const,
        criado_por: "João Silva",
        nome_restaurante: "Pizzaria Central",
        whatsapp_criador: "(11) 99999-9999",
        desenvolvedor: "",
        observacao: ""
      },
      {
        titulo: "Sistema de avaliações detalhadas",
        descricao: "Permitir avaliações mais específicas dos pratos e serviços",
        complexidade: "3h" as const,
        status: "votacao" as const,
        criado_por: "Nome do dev",
        nome_restaurante: "Restaurante ABC",
        whatsapp_criador: "(11) 88888-8888",
        desenvolvedor: "",
        observacao: ""
      },
      {
        titulo: "Chat em tempo real com restaurante",
        descricao: "Sistema de mensagens diretas entre cliente e restaurante",
        complexidade: "1turno" as const,
        status: "desenvolvimento" as const,
        criado_por: "Maria Santos",
        nome_restaurante: "Bistro Gourmet",
        whatsapp_criador: "(11) 77777-7777",
        desenvolvedor: "",
        observacao: ""
      }
    ];

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600">Gerencie as ideias coletadas no evento</p>
          </div>
          <Button 
            onClick={() => {
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
              setIsFormOpen(true);
            }}
            className="bg-black text-white hover:bg-gray-800"
          >
            + Nova Ideia
          </Button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
              <div className="text-sm text-gray-600">Total de Ideias</div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.votacao}</div>
              <div className="text-sm text-gray-600">Em Votação</div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.desenvolvimento}</div>
              <div className="text-sm text-gray-600">Desenvolvimento</div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.finalizada}</div>
              <div className="text-sm text-gray-600">Finalizadas</div>
            </CardContent>
          </Card>
        </div>

        {/* Ideias List */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900">Todas as Ideias</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Votos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Desenvolvedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredIdeias.map((ideia) => (
                    <tr key={ideia.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ideia.titulo}</div>
                          <div className="text-sm text-gray-500">{ideia.descricao}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ComplexityBadge complexity={ideia.complexidade} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={ideia.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{ideia.votos} votos</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{ideia.desenvolvedor || 'Nome do dev'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => handleDelete(ideia.id)}
                          variant="destructive"
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Excluir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog for adding/editing ideas */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
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
                  <Label htmlFor="complexidade">Complexidade *</Label>
                  <Select value={ideaForm.complexidade} onValueChange={(value: '1h30' | '3h' | '1turno' | 'complexa') => setIdeaForm(prev => ({ ...prev, complexidade: value }))}>
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
                  <Label htmlFor="status">Status *</Label>
                  <Select value={ideaForm.status} onValueChange={(value: 'caixinha' | 'votacao' | 'desenvolvimento' | 'finalizada') => setIdeaForm(prev => ({ ...prev, status: value }))}>
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
                  <Label htmlFor="nome_restaurante">Nome do Restaurante</Label>
                  <Input
                    id="nome_restaurante"
                    value={ideaForm.nome_restaurante}
                    onChange={(e) => setIdeaForm(prev => ({ ...prev, nome_restaurante: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_criador">WhatsApp do Criador</Label>
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
    </div>
  );
};

export default Admin;