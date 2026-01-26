import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phone: string;
  clientName: string;
  appointmentTime: string;
  className?: string;
}

export function WhatsAppButton({ phone, clientName, appointmentTime, className }: WhatsAppButtonProps) {
  const handleClick = () => {
    const formattedPhone = phone.replace(/\D/g, '');
    const phoneWithCountry = formattedPhone.startsWith('55')
      ? formattedPhone
      : `55${formattedPhone}`;

    const message = `Olá ${clientName}! 👋\n\nEste é um lembrete do seu agendamento na barbearia às *${appointmentTime}*.\n\nEstamos te esperando! ✂️💈`;
    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      className={`text-green-600 hover:bg-green-100 hover:text-green-700 ${className}`}
      onClick={handleClick}
      title="Enviar lembrete no WhatsApp"
    >
      <MessageCircle className="w-4 h-4" />
    </Button>
  );
}
