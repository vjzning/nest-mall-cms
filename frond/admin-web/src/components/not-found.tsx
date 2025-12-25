import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4 text-center overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-2xl rounded-full opacity-50" />
          <FileQuestion className="h-24 w-24 text-primary relative z-10 animate-pulse" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground/50 select-none mb-2">
          404
        </h1>
        
        <h2 className="text-2xl font-bold tracking-tight mb-3">Page not found</h2>
        
        <p className="text-muted-foreground max-w-[500px] mb-8 leading-relaxed">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or possibly never existed.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 min-w-[300px] justify-center">
          <Button 
            variant="default" 
            onClick={() => navigate({ to: '/' })}
            size="lg"
            className="gap-2 shadow-lg hover:shadow-primary/25 transition-all"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            size="lg"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
