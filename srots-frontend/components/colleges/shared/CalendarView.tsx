
import React, { useState, useEffect } from 'react';
import { CalendarEvent, User, Role, Notice } from '../../../types';
import { CalendarService } from '../../../services/calendarService';
import { DeleteConfirmationModal } from '../../common/DeleteConfirmationModal';

// Sub-Components
import { CalendarHeader } from './calendar/CalendarHeader';
import { MonthView } from './calendar/MonthView';
import { WeekView } from './calendar/WeekView';
import { DayView } from './calendar/DayView';
import { UpcomingEventsList } from './calendar/UpcomingEventsList';
import { NoticesTab } from './calendar/NoticesTab';
import { EventFormModal } from './calendar/EventFormModal';
import { NoticeFormModal } from './calendar/NoticeFormModal';
import { EventDetailModal } from './calendar/EventDetailModal';

interface CalendarViewProps {
  user: User;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ user }) => {
  const canEditGlobal = user.role === Role.CPH || user.role === Role.ADMIN;
  const [activeMainTab, setActiveMainTab] = useState<'calendar' | 'notices'>('calendar');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [calViewMode, setCalViewMode] = useState<'Month'|'Week'|'Day'>('Month');
  const [viewEvent, setViewEvent] = useState<CalendarEvent | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);

  // Modals State
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [showAddNotice, setShowAddNotice] = useState(false);
  
  const initialEventState: Partial<CalendarEvent> = { 
      title: '', type: 'Drive', date: new Date().toISOString().split('T')[0], 
      targetBranches: ['All'], targetYears: [], description: '',
      startTime: '', endTime: '', schedule: []
  };
  const [editingEventData, setEditingEventData] = useState<Partial<CalendarEvent>>(initialEventState);
  const [deleteState, setDeleteState] = useState<{ isOpen: boolean, type: 'event' | 'notice', id: string | null }>({ isOpen: false, type: 'event', id: null });

  useEffect(() => {
      refreshData();
  }, [activeMainTab, user.collegeId]);

  const refreshData = async () => {
      if (!user.collegeId) return;
      const allEvents = await CalendarService.getEvents(user.collegeId);
      setEvents(allEvents);
      
      const upcoming = await CalendarService.getUpcomingEvents(user.collegeId);
      setUpcomingEvents(upcoming);

      const allNotices = await CalendarService.getNotices(user.collegeId);
      setNotices(allNotices);
  };

  const handleNext = () => {
      const d = new Date(currentDate);
      if (calViewMode === 'Month') d.setMonth(d.getMonth() + 1);
      else if (calViewMode === 'Week') d.setDate(d.getDate() + 7);
      else d.setDate(d.getDate() + 1);
      setCurrentDate(d);
  };

  const handlePrev = () => {
      const d = new Date(currentDate);
      if (calViewMode === 'Month') d.setMonth(d.getMonth() - 1);
      else if (calViewMode === 'Week') d.setDate(d.getDate() - 7);
      else d.setDate(d.getDate() - 1);
      setCurrentDate(d);
  };

  const handleOpenAddEvent = () => {
      setEditingEventData({ ...initialEventState, date: new Date().toISOString().split('T')[0] });
      setIsEditingEvent(false);
      setShowAddEvent(true);
  };

  const handleOpenEditEvent = (e: React.MouseEvent, evt: CalendarEvent) => {
      e.stopPropagation();
      setEditingEventData(JSON.parse(JSON.stringify(evt)));
      setIsEditingEvent(true);
      setShowAddEvent(true);
      setViewEvent(null);
  };

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
      if(!eventData.title || !eventData.date) return alert("Title and Start Date required.");
      
      if(isEditingEvent && eventData.id) {
          await CalendarService.updateEvent(eventData as CalendarEvent);
      } else {
          await CalendarService.createEvent(eventData, user);
      }
      
      refreshData();
      setShowAddEvent(false);
  };

  const requestDeleteEvent = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setDeleteState({ isOpen: true, type: 'event', id });
  };

  const handleSaveNotice = async (noticeData: Partial<Notice>, file?: File) => {
      if (!noticeData.title || !noticeData.description) return alert("Title and Description are required.");
      await CalendarService.createNotice(noticeData, user, file);
      refreshData();
      setShowAddNotice(false);
  };

  const requestDeleteNotice = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setDeleteState({ isOpen: true, type: 'notice', id });
  };

  const confirmDelete = async () => {
      if (deleteState.id) {
          if (deleteState.type === 'event') {
              await CalendarService.deleteEvent(deleteState.id);
              if (viewEvent?.id === deleteState.id) setViewEvent(null);
          } else {
              await CalendarService.deleteNotice(deleteState.id);
          }
          refreshData();
          setDeleteState({ isOpen: false, type: 'event', id: null });
      }
  };

  return (
      <div className="flex flex-col h-[calc(100vh-100px)] overflow-y-auto pb-8 relative">
          <div className="sticky top-0 z-30 bg-gray-50 pb-4 pt-1 w-full">
              <div className="flex bg-white rounded-xl border p-1 shadow-sm w-fit mx-auto">
                  <button onClick={() => setActiveMainTab('calendar')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeMainTab === 'calendar' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}>Calendar Events</button>
                  <button onClick={() => setActiveMainTab('notices')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeMainTab === 'notices' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}>Notices & Time Tables</button>
              </div>
          </div>

          <div className="flex flex-col gap-6">
              {activeMainTab === 'calendar' && (
                  <>
                      <div className="bg-white rounded-2xl border shadow-sm flex flex-col overflow-hidden relative min-h-[600px]">
                          <CalendarHeader 
                              currentDate={currentDate} 
                              viewMode={calViewMode} 
                              onNext={handleNext} 
                              onPrev={handlePrev} 
                              onViewChange={setCalViewMode}
                              onAddEvent={handleOpenAddEvent}
                              canEdit={canEditGlobal}
                          />
                          
                          {calViewMode === 'Month' && <MonthView currentDate={currentDate} events={events} onViewEvent={setViewEvent} />}
                          {calViewMode === 'Week' && <WeekView currentDate={currentDate} events={events} onViewEvent={setViewEvent} />}
                          {calViewMode === 'Day' && (
                              <DayView 
                                  currentDate={currentDate} 
                                  events={events} 
                                  user={user} 
                                  onViewEvent={setViewEvent}
                                  onEditEvent={handleOpenEditEvent}
                                  onDeleteEvent={requestDeleteEvent}
                              />
                          )}
                      </div>
                      
                      <UpcomingEventsList 
                          events={upcomingEvents} 
                          user={user} 
                          onViewEvent={setViewEvent}
                          onEditEvent={handleOpenEditEvent}
                          onDeleteEvent={requestDeleteEvent}
                      />
                  </>
              )}

              {activeMainTab === 'notices' && (
                  <NoticesTab 
                      notices={notices} 
                      canEdit={canEditGlobal} 
                      onAddNotice={() => setShowAddNotice(true)} 
                      onDeleteNotice={requestDeleteNotice} 
                  />
              )}
          </div>

          <EventFormModal 
              isOpen={showAddEvent && canEditGlobal} 
              onClose={() => setShowAddEvent(false)} 
              onSave={handleSaveEvent}
              isEditing={isEditingEvent}
              initialData={editingEventData}
              availableBranches={[]}
          />

          <NoticeFormModal 
              isOpen={showAddNotice && canEditGlobal} 
              onClose={() => setShowAddNotice(false)} 
              onSave={handleSaveNotice}
          />

          <EventDetailModal 
              event={viewEvent} 
              isOpen={!!viewEvent && !showAddEvent} 
              onClose={() => setViewEvent(null)}
              onEdit={handleOpenEditEvent}
              onDelete={requestDeleteEvent}
              user={user}
              canEditGlobal={canEditGlobal}
          />

          <DeleteConfirmationModal 
              isOpen={deleteState.isOpen && !!deleteState.id}
              onClose={() => setDeleteState({isOpen: false, type: 'event', id: null})}
              onConfirm={confirmDelete}
              title={`Delete ${deleteState.type === 'event' ? 'Event' : 'Notice'}?`}
              message="This action cannot be undone."
          />
      </div>
  );
};
