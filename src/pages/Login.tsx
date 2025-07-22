
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const { signIn, registerAdmin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (!error) {
      navigate('/admin');
    }
    
    setLoading(false);
  };

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    
    const { error } = await registerAdmin(email, password);
    
    if (!error) {
      // Após registro bem-sucedido, tentar fazer login automaticamente
      setTimeout(async () => {
        await signIn(email, password);
      }, 1000);
    }
    
    setRegisterLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            iFood Move 2024
          </CardTitle>
          <CardDescription>
            Sistema Administrativo Saipos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Primeiro Acesso</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin.saipos@ifoodmove.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegisterAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email Administrativo</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="admin.saipos@ifoodmove.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Nova Senha</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Digite sua nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={registerLoading}
                >
                  {registerLoading ? 'Registrando...' : 'Registrar Acesso'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  * Apenas emails autorizados podem se registrar como admin
                </p>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground font-medium mb-2">Emails Autorizados:</p>
            <div className="space-y-1 text-xs">
              <p><strong>Admin:</strong> admin.saipos@ifoodmove.com</p>
              <p><strong>Tech:</strong> tech.saipos@ifoodmove.com</p>
              <p><strong>Manager:</strong> manager.saipos@ifoodmove.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
