import React, { useState, useEffect } from 'react';
// Fix: Added ScheduleItem import
import { CalendarEvent, ScheduleItem } from '../../../../types';
import { Modal } from '../../../common/Modal';
import { List, Plus, X, Trash2, AlertCircle } from 'lucide-react';

/**
 * Component Name: EventFormModal
 * Directory: components/colleges/shared/calendar/EventFormModal.tsx
 * 
 * Functionality:
 * - Form to Add or Edit calendar events.
 * - **UPDATE**: Added inline validation errors.
 */

interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (eventData: Partial<CalendarEvent>) => void;
    isEditing: boolean;
    initialData: Partial<CalendarEvent>;
    onDelete?: (id: string) => void;
    availableBranches: string[];
}

export const EventFormModal: React.FC<EventFormModalProps> = ({ 
    isOpen, onClose, onSave, isEditing, initialData, onDelete, availableBranches 
}) => {
    const [eventData, setEventData] = useState<Partial<CalendarEvent>>(initialData);
    const [scheduleItem, setScheduleItem] = useState<Partial<ScheduleItem>>({ timeRange: '', activity: '', type: 'Class' });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setEventData(JSON.parse(JSON.stringify(initialData)));
            setScheduleItem({ timeRange: '', activity: '', type: 'Class' });
            setErrorMsg(null);
        }
    }, [isOpen, initialData]);

    const addScheduleItem = () => {
        if(!scheduleItem.timeRange || !scheduleItem.activity) return;
        const newItem: ScheduleItem = {
            id: `sch_${Date.now()}`,
            timeRange: scheduleItem.timeRange!,
            activity: scheduleItem.activity!,
            type: scheduleItem.type as any
        };
        setEventData({ ...eventData, schedule: [...(eventData.schedule || []), newItem] });
        setScheduleItem({ timeRange: '', activity: '', type: 'Class' });
    };

    const removeScheduleItem = (idx: number) => {
        const updated = [...(eventData.schedule || [])];
        updated.splice(idx, 1);
        setEventData({ ...eventData, schedule: updated });
    };

    const handleSave = () => {
        if (!eventData.title?.trim() || !eventData.date) {
            setErrorMsg("Please fill in the Event Title and Start Date.");
            return;
        }
        onSave(eventData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Event' : 'Add Calendar Event'} maxWidth="max-w-lg">
            <div className="p-6 space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Event Title <span className="text-red-500">*</span></label>
                        <input className="w-full border border-gray-300 bg-white text-gray-900 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" placeholder="e.g. Placement Training Day 1" value={eventData.title || ''} onChange={e => { setEventData({...eventData, title: e.target.value}); setErrorMsg(null); }} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date <span className="text-red-500">*</span></label>
                            <input type="date" className="w-full border border-gray-300 bg-white text-gray-900 p-2.5 rounded-lg text-sm" value={eventData.date || ''} onChange={e => { setEventData({...eventData, date: e.target.value}); setErrorMsg(null); }} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date (Optional)</label>
                            <input type="date" className="w-full border border-gray-300 bg-white text-gray-900 p-2.5 rounded-lg text-sm" value={eventData.endDate || ''} onChange={e => setEventData({...eventData, endDate: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Event Type</label>
                        <select className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 text-sm" value={eventData.type || 'Drive'} onChange={e => setEventData({...eventData, type: e.target.value as any})}>
                            <option>Drive</option>
                            <option>Class</option>
                            <option>Training</option>
                            <option>Workshop</option>
                            <option>Exam</option>
                            <option>Meeting</option>
                            <option>Holiday</option>
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Time</label>
                            <input type="time" className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white text-gray-900" value={eventData.startTime || ''} onChange={e => setEventData({...eventData, startTime: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Time</label>
                            <input type="time" className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white text-gray-900" value={eventData.endTime || ''} onChange={e => setEventData({...eventData, endTime: e.target.value})} />
                        </div>
                    </div>

                    {/* Dynamic Schedule Builder */}
                    {(eventData.type === 'Training' || eventData.type === 'Time Table') && (
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 space-y-4">
                            <h4 className="font-bold text-purple-900 text-sm flex items-center gap-2"><List size={16}/> Daily Timetable Builder</h4>
                            <p className="text-[10px] text-purple-700">Define the schedule breakdown (classes, breaks, exams) for the selected dates.</p>
                            
                            {/* Add Item Row */}
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <input placeholder="Time (e.g. 09:00 - 10:30)" className="w-full p-2 text-xs border rounded bg-white text-gray-900" value={scheduleItem.timeRange || ''} onChange={e => setScheduleItem({...scheduleItem, timeRange: e.target.value})} />
                                </div>
                                <div className="flex-[2]">
                                    <input placeholder="Activity (e.g. Aptitude Class)" className="w-full p-2 text-xs border rounded bg-white text-gray-900" value={scheduleItem.activity || ''} onChange={e => setScheduleItem({...scheduleItem, activity: e.target.value})} />
                                </div>
                                <div className="w-24">
                                    <select className="w-full p-2 text-xs border rounded bg-white text-gray-900" value={scheduleItem.type || 'Class'} onChange={e => setScheduleItem({...scheduleItem, type: e.target.value as any})}>
                                        <option>Class</option><option>Break</option><option>Exam</option><option>Activity</option>
                                    </select>
                                </div>
                                <button onClick={addScheduleItem} className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700"><Plus size={16}/></button>
                            </div>

                            {/* List */}
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                                {eventData.schedule?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border text-xs">
                                        <span className="font-mono text-gray-500 w-24 shrink-0">{item.timeRange}</span>
                                        <span className="font-bold text-gray-800 flex-1 px-2">{item.activity}</span>
                                        <span className={`px-2 py-0.5 rounded text-[9px] mr-2 text-white ${item.type === 'Break' ? 'bg-orange-400' : 'bg-blue-400'}`}>{item.type}</span>
                                        <button onClick={() => removeScheduleItem(idx)} className="text-red-500 hover:text-red-700"><X size={14}/></button>
                                    </div>
                                ))}
                                {(!eventData.schedule || eventData.schedule.length === 0) && <p className="text-xs text-gray-400 text-center italic">No slots added yet.</p>}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Target Branches</label>
                        <div className="flex flex-wrap gap-2">
                            {availableBranches.map(b => (
                                <button 
                                    key={b} 
                                    onClick={() => setEventData(prev => ({...prev, targetBranches: prev.targetBranches?.includes(b) ? prev.targetBranches.filter(br => br !== b) : [...(prev.targetBranches || []), b]}))} 
                                    className={`px-3 py-1 text-xs border rounded-full transition-colors ${eventData.targetBranches?.includes(b) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                                >
                                    {b}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Target Years</label>
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4].map(y => (
                                <button 
                                    key={y} 
                                    onClick={() => setEventData(prev => ({...prev, targetYears: prev.targetYears?.includes(y) ? prev.targetYears.filter(yr => yr !== y) : [...(prev.targetYears || []), y]}))} 
                                    className={`px-3 py-1 text-xs border rounded-full transition-colors ${eventData.targetYears?.includes(y) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                                >
                                    Year {y}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                        <textarea className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none" rows={3} placeholder="Add details..." value={eventData.description || ''} onChange={e => setEventData({...eventData, description: e.target.value})} />
                    </div>
                </div>
                
                {/* Inline Error */}
                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-700 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                        <AlertCircle size={16}/> {errorMsg}
                    </div>
                )}

                <div className="flex justify-between pt-2 border-t mt-4">
                    {isEditing && onDelete && eventData.id && (
                        <button type="button" onClick={(e) => onDelete(eventData.id!)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 border border-red-200 flex items-center gap-2">
                            <Trash2 size={16}/> Delete
                        </button>
                    )}
                    <div className="flex gap-3 ml-auto">
                        <button onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button onClick={handleSave} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm">{isEditing ? 'Update' : 'Add Event'}</button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};