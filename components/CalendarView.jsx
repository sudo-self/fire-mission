'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog } from '@headlessui/react';

export default function CalendarView({ notes }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const events = notes.filter((note) => note.type === 'event' && note.due_date);

  const getEventsForDay = (day) => {
    return events.filter((event) => {
      if (!event.due_date) return false;
      return isSameDay(new Date(event.due_date), day);
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const firstDayOfMonth = monthStart.getDay();

  // Color styles per event type
  const eventColors = {
    work: 'bg-green-100 text-green-800 hover:bg-green-200',
    personal: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    reminder: 'bg-red-100 text-red-800 hover:bg-red-200',
    default: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>

        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center font-medium text-gray-500 py-2 text-sm"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="min-h-[80px] p-1 border border-gray-100 rounded bg-gray-50"
          ></div>
        ))}

        {/* Days of month */}
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={`min-h-[80px] p-1 border rounded transition-colors cursor-pointer ${
                isCurrentMonth
                  ? isToday
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                  : 'bg-gray-50 text-gray-400 border-gray-100'
              }`}
            >
              <div
                className={`text-sm font-medium mb-1 text-right ${
                  isToday ? 'text-blue-600' : 'text-gray-900'
                }`}
              >
                {format(day, 'd')}
              </div>

              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs px-1 py-0.5 rounded truncate transition-colors ${
                      eventColors[event.subtype] || eventColors.default
                    }`}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}

                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500 px-1">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Modal */}
      <Dialog
        open={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <Dialog.Panel className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-lg font-semibold mb-4">
            {selectedDay ? format(selectedDay, 'MMMM d, yyyy') : ''}
          </Dialog.Title>

          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {selectedDay &&
              getEventsForDay(selectedDay).map((event) => (
                <li
                  key={event.id}
                  className={`p-2 rounded ${eventColors[event.subtype] || eventColors.default}`}
                >
                  <p className="font-medium">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-gray-700">{event.description}</p>
                  )}
                </li>
              ))}

            {selectedDay && getEventsForDay(selectedDay).length === 0 && (
              <p className="text-gray-500">No events for this day</p>
            )}
          </ul>

          <button
            onClick={() => setSelectedDay(null)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}

