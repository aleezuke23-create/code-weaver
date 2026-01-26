import { cn } from '@/lib/utils';
import { Service } from '@/types/barber';

interface ServiceButtonProps {
  service: Service;
  selected: boolean;
  onToggle: (serviceId: string) => void;
}

export function ServiceButton({ service, selected, onToggle }: ServiceButtonProps) {
  return (
    <button
      onClick={() => onToggle(service.id)}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 min-w-[100px]",
        selected
          ? "border-primary bg-primary/10 shadow-md"
          : "border-border bg-card hover:border-primary/50 hover:bg-accent"
      )}
    >
      <span className="text-2xl mb-2">{service.icon}</span>
      <span className="font-medium text-sm text-card-foreground">{service.name}</span>
      <span className="text-xs text-muted-foreground">R$ {service.price.toFixed(2)}</span>
    </button>
  );
}
