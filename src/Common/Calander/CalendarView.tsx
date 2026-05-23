import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./calendar.css"; // We will create this file below

export type CalendarEvent = {
  title: string;
  start: string;
  
  end?: string;
  className?: string; // Allow custom classes for specific events
};

type CalendarViewProps = {
  events: CalendarEvent[];
  handleDateClick: (arg: any) => void;
  handleEventClick?: (arg: any) => void;
  EventColor?: string;
};

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  handleDateClick,
  handleEventClick,
  EventColor
}) => {
  return (
    <div className="w-full h-full min-h-0">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek",
        }}
        
        // Modern UI tweaks
        dayMaxEvents={2}
        height="100%"
        aspectRatio={2}
        fixedWeekCount={false}
        nowIndicator={true}
        handleWindowResize={true}
        stickyHeaderDates={true}
        eventColor={EventColor || 'hsl(var(--primary-hsl))'}
        
        // Customizing the event display
        eventClassNames="custom-event-card"
        eventContent={(eventInfo) => (
          <div className="flex items-center gap-1.5 px-1 py-0.5 overflow-hidden">
            <div 
              className="w-1.5 h-1.5 rounded-full shrink-0" 
              style={{ backgroundColor: eventInfo.event.backgroundColor || eventInfo.backgroundColor || EventColor || 'hsl(var(--primary-hsl))' }}
            />
            <div className="text-[11px] font-bold truncate tracking-tight">
              {eventInfo.timeText && <span className="opacity-60 mr-1">{eventInfo.timeText}</span>}
              {eventInfo.event.title}
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default CalendarView;