'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Briefcase, User, Bell } from 'lucide-react';
import { Dialog } from '@headlessui/react';

export default function CalendarView({ notes }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

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
      return direction === 1 ? addMonths(prev, 1) : subMonths(prev, 1);
    });
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedDay(null);
      setIsClosing(false);
    }, 200);
  };

  const firstDayOfMonth = monthStart.getDay();

  // Enhanced color styles per event type with better visual hierarchy
  const eventColors = {
    work: 'bg-green-50 text-green-800 border-l-4 border-green-500 hover:bg-green-100',
    personal: 'bg-purple-50 text-purple-800 border-l-4 border-purple-500 hover:bg-purple-100',
    reminder: 'bg-red-50 text-red-800 border-l-4 border-red-500 hover:bg-red-100',
    default: 'bg-blue-50 text-blue-800 border-l-4 border-blue-500 hover:bg-blue-100',
  };

  const eventTypeIcons = {
    work: <Briefcase className="w-3 h-3 mr-1" />,
    personal: <User className="w-3 h-3 mr-1" />,
    reminder: <Bell className="w-3 h-3 mr-1" />,
    default: <CalendarIcon className="w-3 h-3 mr-1" />,
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h3 className="text-xl font-semibold text-gray-900 min-w-[180px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h3>

          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-gray-600 py-2 text-sm uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="min-h-[100px] p-2 border border-gray-100 rounded-lg bg-gray-50/50"
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
              className={`min-h-[100px] p-2 border rounded-lg transition-all cursor-pointer flex flex-col ${
                isCurrentMonth
                  ? isToday
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                  : 'bg-gray-50/30 text-gray-400 border-gray-100'
              }`}
            >
              <div
                className={`text-sm font-medium mb-1 text-right ${
                  isToday
                    ? 'inline-flex items-center justify-center w-6 h-6 ml-auto rounded-full bg-blue-500 text-white'
                    : 'text-gray-700'
                }`}
              >
                {format(day, 'd')}
              </div>

              <div className="space-y-1 mt-auto">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs px-2 py-1 rounded-md truncate transition-colors flex items-center ${
                      eventColors[event.subtype] || eventColors.default
                    }`}
                    title={event.title}
                  >
                    {eventTypeIcons[event.subtype] || eventTypeIcons.default}
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
        onClose={closeModal}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="fixed inset-0 bg-black/30 transition-opacity" aria-hidden="true" />
        
        <Dialog.Panel className={`relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md transform transition-transform ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {selectedDay ? format(selectedDay, 'EEEE, MMMM d, yyyy') : ''}
            </Dialog.Title>
            <button
              onClick={closeModal}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {selectedDay && getEventsForDay(selectedDay).length > 0 ? (
              getEventsForDay(selectedDay).map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg flex items-start ${eventColors[event.subtype] || eventColors.default}`}
                >
                  <div className="mr-2 mt-0.5">
                    {eventTypeIcons[event.subtype] || eventTypeIcons.default}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    {event.description && (
                      <p className="text-sm text-gray-700 mt-1">{event.description}</p>
                    )}
                    {event.due_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(event.due_date), 'h:mm a')}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No events scheduled for this day</p>
              </div>
            )}
          </div>

          <button
            onClick={closeModal}
            className="mt-6 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
