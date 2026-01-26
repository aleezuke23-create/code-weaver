import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const date = parseISO(selectedDate);

  const handlePrevDay = () => {
    onDateChange(subDays(date, 1).toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    onDateChange(addDays(date, 1).toISOString().split('T')[0]);
  };

  const handleSelectDate = (newDate: Date | undefined) => {
    if (newDate) {
      onDateChange(newDate.toISOString().split('T')[0]);
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={handlePrevDay}>
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "min-w-[180px] justify-start text-left font-normal",
              isToday && "border-primary"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(date, "dd 'de' MMMM, yyyy", { locale: ptBR })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-popover" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelectDate}
            initialFocus
            locale={ptBR}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="icon" onClick={handleNextDay}>
        <ChevronRight className="w-4 h-4" />
      </Button>

      {!isToday && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateChange(new Date().toISOString().split('T')[0])}
        >
          Hoje
        </Button>
      )}
    </div>
  );
}
