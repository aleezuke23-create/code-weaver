import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scissors, Smartphone } from 'lucide-react';
import { useDeviceFingerprint } from '@/hooks/useDeviceFingerprint';

const Auth = () => {
  const navigate = useNavigate();
  const deviceId = useDeviceFingerprint();

  useEffect(() => {
    // Device fingerprint is automatically generated, redirect to app
    if (deviceId) {
      navigate('/');
    }
  }, [deviceId, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-xl">
              <Scissors className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl text-card-foreground">BarberPro</CardTitle>
          <CardDescription className="text-muted-foreground">
            Seus dados são salvos automaticamente neste dispositivo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-3 p-4 bg-accent rounded-lg">
            <Smartphone className="w-6 h-6 text-primary" />
            <div className="text-left">
              <p className="font-medium text-card-foreground">Dispositivo identificado</p>
              <p className="text-xs text-muted-foreground">ID: {deviceId}</p>
            </div>
          </div>

          <Button className="w-full" onClick={() => navigate('/')}>
            Continuar para o App
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Seus dados ficam salvos neste dispositivo e não serão perdidos ao trocar de internet
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
