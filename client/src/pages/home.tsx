import { useEffect, useRef } from "react";

export default function Home() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add fade-in effect on component mount
    const card = cardRef.current;
    if (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      
      const timeout = setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-4" data-testid="main-container">
      <div 
        ref={cardRef}
        className="bg-card text-card-foreground rounded-lg border border-border shadow-lg p-8 md:p-12 lg:p-16 max-w-2xl w-full mx-auto"
        data-testid="content-card"
      >
        <div className="text-center space-y-6">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 tracking-tight"
            data-testid="text-main-heading"
          >
            Hola mundo
          </h1>
          
          <p 
            className="text-lg md:text-xl text-muted-foreground leading-relaxed"
            data-testid="text-subtitle"
          >
            ¡Bienvenido a mi primera página web!
          </p>
          
          <div className="flex justify-center mt-8" data-testid="decorative-element">
            <div className="w-24 h-1 bg-primary rounded-full"></div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <p 
              className="text-sm text-muted-foreground"
              data-testid="text-description"
            >
              Una página simple y elegante para mostrar el clásico mensaje de saludo.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
