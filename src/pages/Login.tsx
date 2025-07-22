import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    signIn,
    adminEmail
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (adminEmail) {
      navigate('/admin');
    }
  }, [adminEmail, navigate]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await signIn(email);
    if (!error) {
      navigate('/admin');
    }
    setLoading(false);
  };
  return <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            iFood Move 2024
          </CardTitle>
          <CardDescription>Sistema Administrador Saipos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Administrador</Label>
              <Input id="email" type="email" placeholder="admin.saipos@ifoodmove.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verificando...' : 'Acessar Sistema'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground font-medium mb-2">Emails Autorizados:</p>
            <div className="space-y-1 text-xs">
              <p><strong>Admin:</strong> admin.saipos@ifoodmove.com</p>
              <p><strong>Tech:</strong> tech.saipos@ifoodmove.com</p>
              <p><strong>Manager:</strong> manager.saipos@ifoodmove.com</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              * Digite seu email autorizado para acessar o sistema
            </p>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default Login;