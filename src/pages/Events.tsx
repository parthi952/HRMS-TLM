import React from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useTheme } from "../ThemeContext";
import CalendarView from "../Common/Calander/CalendarView";
import { getGlassmorphicStyle } from "../Themes/PageThemes/SideMenu";

export const Events: React.FC = () => {
  const { currentPreset } = useTheme();

  const events = [
    { title: "Monthly All-Hands Meeting", date: "May 25, 2026", time: "10:00 AM", type: "Corporate", loc: "Main Conference Hall", start: "2026-05-25" },
    { title: "React 19 Tech Workshop", date: "May 29, 2026", time: "02:00 PM", type: "Training", loc: "Virtual Room A", start: "2026-05-29" },
    { title: "Memorial Day Holiday", date: "May 31, 2026", time: "All Day", type: "Holiday", loc: "Office Closed", start: "2026-05-31" },
    { title: "Q3 Project Kick-off", date: "June 02, 2026", time: "11:00 AM", type: "Strategic", loc: "Management Boardroom", start: "2026-06-02" }
  ];

  const calendarEvents = events.map(ev => ({
    title: ev.title,
    start: ev.start,
    className: "custom-event"
  }));

  const handleDateClick = (arg: any) => {
    console.log("Date clicked:", arg.dateStr);
  };

  return (
    <div className="p-8 font-sans h-[calc(100vh-3.5rem)] flex flex-col bg-bg overflow-hidden">
      {/* Page Header */}
      <div className="mb-6 shrink-0">
        <span
          className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest rounded-full"
          style={{ color: currentPreset.primaryHex, backgroundColor: `${currentPreset.primaryHex}15` }}
        >
          Calendar & Gatherings
        </span>
        <div className="text-3xl tracking-tight mt-2 leading-none" style={{ color: currentPreset.primaryHex, fontFamily: currentPreset.titleFont, fontWeight: 900 }}>Corporate Events</div>
        <p className="text-slate-400 text-xs font-semibold mt-1.5">Keep track of corporate meetings, training events, and public holidays.</p>
      </div>

      {/* Grid Layout: Calendar on Left, Event list on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 mb-2">
        {/* Left Column: Calendar Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col min-h-0 overflow-hidden">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3.5 shrink-0 flex items-center gap-1.5">
            <Calendar size={12} style={{ color: currentPreset.primaryHex }} />
            Interactive Calendar :
          </h3>
          <div className="flex-1 min-h-0 overflow-hidden">
            <CalendarView
              events={calendarEvents}
              handleDateClick={handleDateClick}
              EventColor={currentPreset.primaryHex}
            />
          </div>
        </div>

        {/* Right Column: Events Sidebar Card */}
        <div className="flex flex-col min-h-0">
          <div 
            className="rounded-3xl p-5 border border-slate-200/55 shadow-lg flex flex-col h-full min-h-0 overflow-y-auto no-scrollbar"
            style={getGlassmorphicStyle(currentPreset.primaryHex, "1C", 16)}
          >
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-800/20 mb-4 shrink-0 flex items-center gap-1.5">
              <Calendar size={12} className="text-slate-800" />
              Upcoming Events List :
            </h3>

            <div className="space-y-3.5 flex-1 overflow-y-auto no-scrollbar pr-0.5">
              {events.map((ev, idx) => (
                <div key={idx} className="bg-white/50 border border-white/30 p-4 rounded-2xl hover:bg-white/70 transition-all shadow-sm">
                  <span className="px-2 py-0.5 bg-white border border-slate-200/55 rounded text-[8px] font-extrabold uppercase tracking-widest text-slate-500">
                    {ev.type}
                  </span>
                  <h4 className="text-xs font-black text-slate-800 mt-2">{ev.title}</h4>
                  <div className="mt-3 space-y-1.5 text-[9px] font-bold text-slate-400">
                    <p className="flex items-center gap-1.5">
                      <Clock size={10} className="text-slate-500" />
                      {ev.date} at {ev.time}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin size={10} className="text-slate-500" />
                      {ev.loc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
