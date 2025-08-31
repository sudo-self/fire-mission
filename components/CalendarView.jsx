'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  addDays,
  isWeekend,
  isBefore,
  isAfter,
  setHours,
  setMinutes,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Briefcase, User, Bell, Plus, MoreHorizontal } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function CalendarView({ notes, onEventCreate, onEventEdit }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState('month'); // 'month' or 'day'
  const [isClosing, setIsClosing] = useState(false);


  const events = useMemo(() => 
    notes.filter((note) => note.type === 'event' && note.due_date)
    .map(event => ({
      ...event,
      due_date: parseISO(event.due_date)
    }))
    .sort((a, b) => a.due_date - b.due_date),
    [notes]
  );


  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);


  const getEventsForDay = useCallback((day) => {
    return events.filter((event) => {
      if (!event.due_date) return false;
      return isSameDay(event.due_date, day);
    });
  }, [events]);


  const navigateMonth = useCallback((direction) => {
    setCurrentDate(prev => direction === 1 ? addMonths(prev, 1) : subMonths(prev, 1));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);


  const closeModal = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedDay(null);
      setSelectedEvent(null);
      setIsClosing(false);
    }, 200);
  }, []);

  const handleDayClick = useCallback((day) => {
    setSelectedDay(day);
    setSelectedEvent(null);
  }, []);

  const handleEventClick = useCallback((event, day, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setSelectedDay(day);
  }, []);


  const eventColors = {
    work: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-l-4 border-green-500',
      hover: 'hover:bg-green-100',
      full: 'bg-green-100 border-green-200'
    },
    personal: {
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-l-4 border-purple-500',
      hover: 'hover:bg-purple-100',
      full: 'bg-purple-100 border-purple-200'
    },
    reminder: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-l-4 border-red-500',
      hover: 'hover:bg-red-100',
      full: 'bg-red-100 border-red-200'
    },
    default: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-l-4 border-blue-500',
      hover: 'hover:bg-blue-100',
      full: 'bg-blue-100 border-blue-200'
    },
  };

  const eventTypeIcons = {
    work: <Briefcase className="w-3 h-3 mr-1 flex-shrink-0" />,
    personal: <User className="w-3 h-3 mr-1 flex-shrink-0" />,
    reminder: <Bell className="w-3 h-3 mr-1 flex-shrink-0" />,
    default: <CalendarIcon className="w-3 h-3 mr-1 flex-shrink-0" />,
  };

  const timeSlots = useMemo(() => {
    const slots = {};
    for (let hour = 7; hour < 20; hour++) {
      const time = setHours(setMinutes(selectedDay, 0), hour);
      slots[format(time, 'h a')] = events.filter(event => 
        event.due_date && 
        isSameDay(event.due_date, selectedDay) &&
        event.due_date.getHours() === hour
      );
    }
    return slots;
  }, [selectedDay, events]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 text-sm font-medium ${view === 'month' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Month
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1 text-sm font-medium ${view === 'day' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Day
            </button>
          </div>

          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Today
          </button>

          <div className="flex items-center gap-2">
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

          <button
            onClick={() => onEventCreate && onEventCreate(new Date())}
            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {view === 'month' ? (
        <>
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
            {calendarDays.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);
              const isPast = isBefore(day, new Date()) && !isDayToday;
              const isWeekendDay = isWeekend(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[120px] p-2 border rounded-lg transition-all cursor-pointer flex flex-col ${
                    isCurrentMonth
                      ? isDayToday
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : isPast
                        ? 'bg-gray-50 text-gray-400 border-gray-100'
                        : isWeekendDay
                        ? 'bg-gray-50 border-gray-100'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                      : 'bg-gray-50/30 text-gray-400 border-gray-100'
                  }`}
                >
                  <div
                    className={`text-sm font-medium mb-1 flex justify-between items-center ${
                      isDayToday
                        ? 'inline-flex items-center justify-center w-6 h-6 ml-auto rounded-full bg-blue-500 text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    <span className={isWeekendDay && isCurrentMonth ? 'text-red-500' : ''}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    )}
                  </div>

                  <div className="space-y-1 mt-auto overflow-hidden">
                    {dayEvents.slice(0, 3).map((event) => {
                      const eventStyle = eventColors[event.subtype] || eventColors.default;
                      return (
                        <div
                          key={event.id}
                          onClick={(e) => handleEventClick(event, day, e)}
                          className={`text-xs px-2 py-1 rounded-md truncate transition-colors flex items-center ${eventStyle.bg} ${eventStyle.text} ${eventStyle.border} ${eventStyle.hover}`}
                          title={event.title}
                        >
                          {eventTypeIcons[event.subtype] || eventTypeIcons.default}
                          <span className="truncate">{event.title}</span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
 
        <div className="border rounded-lg overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </h3>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {Object.entries(timeSlots).map(([time, events]) => (
              <div key={time} className="flex border-b">
                <div className="w-20 py-4 px-2 text-sm text-gray-500 font-medium border-r bg-gray-50">
                  {time}
                </div>
                <div className="flex-1 p-2 min-h-[80px]">
                  {events.length > 0 ? (
                    events.map(event => {
                      const eventStyle = eventColors[event.subtype] || eventColors.default;
                      return (
                        <div
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event);
                            setSelectedDay(event.due_date);
                          }}
                          className={`p-2 rounded-lg mb-2 cursor-pointer ${eventStyle.full} border`}
                        >
                          <div className="flex items-center">
                            {eventTypeIcons[event.subtype] || eventTypeIcons.default}
                            <span className="font-medium">{event.title}</span>
                          </div>
                          {event.description && (
                            <p className="text-sm mt-1 text-gray-700 truncate">{event.description}</p>
                          )}
                          <p className="text-xs mt-1 text-gray-500">
                            {format(event.due_date, 'h:mm a')}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      No events
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day/Event Modal */}
      <Transition show={!!selectedDay} as={Fragment}>
        <Dialog onClose={closeModal} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 transition-opacity" aria-hidden="true" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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

              {selectedEvent ? (
             
                <div>
                  <div className={`p-4 rounded-lg mb-4 ${eventColors[selectedEvent.subtype]?.bg || eventColors.default.bg}`}>
                    <h3 className="text-xl font-semibold mb-2">{selectedEvent.title}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(selectedEvent.due_date, 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Bell className="w-4 h-4 mr-2" />
                      {format(selectedEvent.due_date, 'h:mm a')}
                    </div>
                  </div>
                  
                  {selectedEvent.description && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-700">{selectedEvent.description}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => {
                        onEventEdit && onEventEdit(selectedEvent);
                        closeModal();
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
            
                <>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {selectedDay && getEventsForDay(selectedDay).length > 0 ? (
                      getEventsForDay(selectedDay).map((event) => {
                        const eventStyle = eventColors[event.subtype] || eventColors.default;
                        return (
                          <div
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className={`p-3 rounded-lg flex items-start cursor-pointer ${eventStyle.bg} ${eventStyle.border} ${eventStyle.hover}`}
                          >
                            <div className="mr-2 mt-0.5">
                              {eventTypeIcons[event.subtype] || eventTypeIcons.default}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{event.title}</p>
                              {event.description && (
                                <p className="text-sm text-gray-700 mt-1 line-clamp-2">{event.description}</p>
                              )}
                              {event.due_date && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {format(event.due_date, 'h:mm a')}
                                </p>
                              )}
                            </div>
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p>No events scheduled for this day</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onEventCreate && onEventCreate(selectedDay);
                      closeModal();
                    }}
                    className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Event
                  </button>
                </>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  );
}
