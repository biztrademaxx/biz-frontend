// components/EventCalendar.tsx
import React from 'react';

interface Event {
  id: number;
  day: string;
  month: string;
  name: string;
}

const EventCalendar: React.FC = () => {
  // Sample event data - you can replace this with data from an API or props
  const events: Event[] = [
    { id: 1, day: '19', month: 'Jan', name: 'Yoga Event 2025' },
    { id: 2, day: '10', month: 'May', name: 'GPEX 2025' },
    { id: 3, day: '02', month: 'Oct', name: 'Fitness Fest 2024' },
    { id: 4, day: '11', month: 'Jun', name: 'Food Fair 2024' },
    { id: 5, day: '23', month: 'Feb', name: 'Property Show 2025' },
  ];

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Upcoming Events</h1>
      
      <div className="space-y-6">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-4">
            {/* Date Box */}
            <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-100 rounded-lg">
              <span className="text-2xl font-bold text-blue-800">{event.day}</span>
              <span className="text-sm font-semibold text-blue-600">{event.month}</span>
            </div>
            
            {/* Event Name */}
            <div className="flex-1 pt-2">
              <h3 className="text-lg font-semibold text-gray-800">{event.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCalendar;