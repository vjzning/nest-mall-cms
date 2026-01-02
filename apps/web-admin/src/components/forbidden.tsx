import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { ShieldAlert, Home, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

export function Forbidden() {
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  return (
    <div className="flex overflow-hidden relative flex-col justify-center items-center p-4 w-full h-screen text-center bg-background text-foreground">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-50 blur-3xl pointer-events-none bg-red-500/10" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full opacity-50 blur-3xl pointer-events-none bg-orange-500/10" />

      <div className="flex relative z-10 flex-col items-center duration-500 animate-in fade-in zoom-in">
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-gradient-to-r rounded-full opacity-50 blur-2xl from-red-500/20 to-orange-500/20" />
          <ShieldAlert
            className="relative z-10 w-24 h-24 animate-pulse text-destructive"
            strokeWidth={1.5}
          />
        </div>

        <h1 className="mb-2 text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br select-none from-foreground to-muted-foreground/50">
          403
        </h1>

        <h2 className="mb-3 text-2xl font-bold tracking-tight">访问被拒绝</h2>

        <p className="text-muted-foreground max-w-[500px] mb-8 leading-relaxed">
          抱歉，您没有权限访问此页面。如果您认为这是一个错误，请联系管理员。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 min-w-[300px] justify-center">
          <Button
            variant="default"
            onClick={() => navigate({ to: '/' })}
            size="lg"
            className="gap-2 shadow-lg transition-all hover:shadow-primary/25"
          >
            <Home className="w-4 h-4" />
            返回仪表盘
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            size="lg"
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
          >
            <LogOut className="w-4 h-4" />
            使用其他账号登录
          </Button>
        </div>
      </div>
    </div>
  );
}
