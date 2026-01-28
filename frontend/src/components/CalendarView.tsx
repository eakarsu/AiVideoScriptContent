import { useState, useMemo } from 'react';
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
} from 'date-fns';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import StatusBadge from './StatusBadge';

export interface CalendarItem {
  id: string;
  title: string;
  type: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: string;
  color?: string;
}

interface CalendarViewProps {
  items: CalendarItem[];
  onItemClick?: (item: CalendarItem) => void;
  onDateDrop?: (item: CalendarItem, newDate: Date) => void;
}

interface DraggableItemProps {
  item: CalendarItem;
  onClick?: () => void;
}

function DraggableItem({ item, onClick }: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`${item.color || 'bg-primary-100'} text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 mb-1`}
    >
      {item.title}
    </div>
  );
}

function DroppableDay({
  date,
  items,
  isCurrentMonth,
  isToday,
  onItemClick,
}: {
  date: Date;
  items: CalendarItem[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onItemClick?: (item: CalendarItem) => void;
}) {
  return (
    <div
      className={`min-h-[100px] p-2 border-b border-r border-gray-100 ${
        !isCurrentMonth ? 'bg-gray-50' : ''
      }`}
      data-date={format(date, 'yyyy-MM-dd')}
    >
      <div
        className={`text-sm font-medium mb-1 ${
          isToday
            ? 'w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center'
            : isCurrentMonth
            ? 'text-gray-900'
            : 'text-gray-400'
        }`}
      >
        {format(date, 'd')}
      </div>
      <div className="space-y-1">
        {items.slice(0, 3).map((item) => (
          <DraggableItem key={item.id} item={item} onClick={() => onItemClick?.(item)} />
        ))}
        {items.length > 3 && (
          <div className="text-xs text-gray-500">+{items.length - 3} more</div>
        )}
      </div>
    </div>
  );
}

export default function CalendarView({ items, onItemClick, onDateDrop }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeItem, setActiveItem] = useState<CalendarItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart, calendarEnd]
  );

  const itemsByDate = useMemo(() => {
    const map: Record<string, CalendarItem[]> = {};
    items.forEach((item) => {
      if (item.scheduledAt) {
        const dateKey = format(new Date(item.scheduledAt), 'yyyy-MM-dd');
        if (!map[dateKey]) {
          map[dateKey] = [];
        }
        map[dateKey].push(item);
      }
    });
    return map;
  }, [items]);

  const handleDragStart = (event: DragStartEvent) => {
    const item = items.find((i) => i.id === event.active.id);
    if (item) {
      setActiveItem(item);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);

    if (!event.over || !onDateDrop) return;

    const item = items.find((i) => i.id === event.active.id);
    const dateElement = document.querySelector(`[data-date="${event.over.id}"]`);

    if (item && dateElement) {
      const newDate = new Date(event.over.id as string);
      onDateDrop(item, newDate);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm font-medium hover:bg-gray-100 rounded-lg"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-6 py-2 border-b bg-gray-50">
        <div className="flex items-center gap-2 text-sm">
          <StatusBadge status="draft" size="sm" />
          <StatusBadge status="scheduled" size="sm" />
          <StatusBadge status="published" size="sm" />
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="px-2 py-3 text-center text-sm font-medium text-gray-500 bg-gray-50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayItems = itemsByDate[dateKey] || [];

            return (
              <DroppableDay
                key={dateKey}
                date={day}
                items={dayItems}
                isCurrentMonth={isSameMonth(day, currentDate)}
                isToday={isSameDay(day, new Date())}
                onItemClick={onItemClick}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeItem && (
            <div className={`${activeItem.color || 'bg-primary-100'} text-xs px-2 py-1 rounded shadow-lg`}>
              {activeItem.title}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
