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
  const canCreate = user.role === Role.CPH || user.role === Role.STAFF || user.role === Role.ADMIN;
  
  const [activeMainTab, setActiveMainTab] = useState<'calendar' | 'notices'>('calendar');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [calViewMode, setCalViewMode] = useState<'Month'|'Week'|'Day'>('Month');
  const [viewEvent, setViewEvent] = useState<CalendarEvent | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);

  // Modals State for Events
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  
  // Modals State for Notices
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  
  // Initial States for resetting
  const initialEventState: Partial<CalendarEvent> = { 
      title: '', type: 'Drive', date: new Date().toISOString().split('T')[0], 
      targetBranches: ['All'], targetYears: [], description: '',
      startTime: '', endTime: '', schedule: []
  };

  const initialNoticeState: Partial<Notice> = { 
      title: '', description: '', type: 'Notice', date: new Date().toISOString().split('T')[0]
  };

  const [editingEventData, setEditingEventData] = useState<Partial<CalendarEvent>>(initialEventState);
  const [editingNoticeData, setEditingNoticeData] = useState<Partial<Notice>>(initialNoticeState);

  const [deleteState, setDeleteState] = useState<{ isOpen: boolean, type: 'event' | 'notice', id: string | null }>({ 
      isOpen: false, type: 'event', id: null 
  });

  useEffect(() => {
      refreshData();
  }, [activeMainTab, user.collegeId]);

  const refreshData = async () => {
      if (!user.collegeId) return;
      try {
        const [allEvents, upcoming, allNotices] = await Promise.all([
            CalendarService.getEvents(user.collegeId),
            CalendarService.getUpcomingEvents(user.collegeId),
            CalendarService.getNotices(user.collegeId)
        ]);
        setEvents(allEvents);
        setUpcomingEvents(upcoming);
        setNotices(allNotices);
      } catch (error) {
          console.error("Error refreshing calendar data:", error);
      }
  };

  // --- NAVIGATION LOGIC ---
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

  // --- EVENT HANDLERS ---
  const handleOpenAddEvent = () => {
      setIsEditingEvent(false);
      setEditingEventData({ ...initialEventState, date: new Date().toISOString().split('T')[0] });
      setShowAddEvent(true);
  };

  const handleOpenEditEvent = (e: React.MouseEvent, evt: CalendarEvent) => {
      e.stopPropagation();
      setIsEditingEvent(true);
      setEditingEventData({ ...evt }); // Shallow copy to trigger state update
      setShowAddEvent(true);
      setViewEvent(null);
  };

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    if(!eventData.title || !eventData.date) return alert("Title and Start Date required.");
    
    try {
        if(isEditingEvent && eventData.id) {
            await CalendarService.updateEvent(eventData as CalendarEvent);
        } else {
            await CalendarService.createEvent(eventData, user);
        }
        await refreshData();
        setShowAddEvent(false);
    } catch (err) {
        console.error("Save Event Failed", err);
    }
  };

  // --- NOTICE HANDLERS ---
  const handleOpenAddNotice = () => {
      setIsEditingNotice(false);
      setEditingNoticeData({ ...initialNoticeState }); // Ensure fresh state
      setShowNoticeModal(true);
  };

  const handleOpenEditNotice = (e: React.MouseEvent, notice: Notice) => {
      e.stopPropagation();
      setIsEditingNotice(true);
      // Ensure we pass a fresh object reference so Modal's useEffect triggers
      setEditingNoticeData({ ...notice }); 
      setShowNoticeModal(true);
  };

  const handleSaveNotice = async (noticeData: Partial<Notice>) => {
      if (!noticeData.title || !noticeData.description) return alert("Title and Description are required.");
      
      try {
          if (isEditingNotice && noticeData.id) {
              await CalendarService.updateNotice(noticeData as Notice);
          } else {
              await CalendarService.createNotice(noticeData, user);
          }
          await refreshData();
          setShowNoticeModal(false);
      } catch (err) {
          console.error("Save Notice Failed", err);
      }
  };

  // --- DELETE LOGIC ---
  const requestDeleteEvent = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setDeleteState({ isOpen: true, type: 'event', id });
  };

  const requestDeleteNotice = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setDeleteState({ isOpen: true, type: 'notice', id });
  };

  const confirmDelete = async () => {
      if (!deleteState.id) return;

      try {
          if (deleteState.type === 'event') {
              await CalendarService.deleteEvent(deleteState.id);
              if (viewEvent?.id === deleteState.id) setViewEvent(null);
          } else {
              await CalendarService.deleteNotice(deleteState.id);
          }
          await refreshData();
      } catch (err) {
          console.error("Delete failed", err);
          alert("Could not delete. Check your permissions.");
      } finally {
          setDeleteState({ isOpen: false, type: 'event', id: null });
      }
  };

  return (
      <div className="flex flex-col h-[calc(100vh-100px)] overflow-y-auto pb-8 relative">
          {/* Main Tab Switcher */}
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
                              canEdit={canCreate}
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
                      canEdit={canCreate} 
                      onAddNotice={handleOpenAddNotice} 
                      onEditNotice={handleOpenEditNotice}
                      onDeleteNotice={requestDeleteNotice} 
                      user={user}
                  />
              )}
          </div>

          {/* Modals */}
          <EventFormModal 
              isOpen={showAddEvent && canCreate} 
              onClose={() => setShowAddEvent(false)} 
              onSave={handleSaveEvent}
              isEditing={isEditingEvent}
              initialData={editingEventData}
              availableBranches={[]}
          />

          <NoticeFormModal 
              isOpen={showNoticeModal && canCreate} 
              onClose={() => setShowNoticeModal(false)} 
              onSave={handleSaveNotice}
              isEditing={isEditingNotice}
              initialData={editingNoticeData}
          />

          <EventDetailModal 
              event={viewEvent} 
              isOpen={!!viewEvent && !showAddEvent} 
              onClose={() => setViewEvent(null)}
              onEdit={handleOpenEditEvent}
              onDelete={requestDeleteEvent}
              user={user}
              canEditGlobal={canCreate}
          />

          <DeleteConfirmationModal 
              isOpen={deleteState.isOpen && !!deleteState.id}
              onClose={() => setDeleteState({ isOpen: false, type: 'event', id: null})}
              onConfirm={confirmDelete}
              title={`Delete ${deleteState.type === 'event' ? 'Event' : 'Notice'}?`}
              message="This action cannot be undone and will permanently remove the data."
          />
      </div>
  );
};