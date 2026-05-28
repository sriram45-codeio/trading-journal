import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

// Custom Click Outside hook
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export function CustomDatePicker({ value, onChange, error, accentColor = '#f35936' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef();
  
  // Local calendar state (current displayed month/year)
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  useClickOutside(containerRef, () => setIsOpen(false));

  // Sync calendar display month when value changes
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setCurrentYear(parseInt(parts[0], 10));
        setCurrentMonth(parseInt(parts[1], 10) - 1);
      }
    }
  }, [value]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Helper calendar calculations
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const handlePrevMonth = (e) => {
    e.preventDefault();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const selectedDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onChange(selectedDateStr);
    setIsOpen(false);
  };

  // Generate day cells
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
  
  const cells = [];
  // Empty padding cells for start of the month
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push(<div key={`empty-${i}`} className="w-8 h-8" />);
  }
  
  // Date cells
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(d).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    const isSelected = value === dateStr;
    
    const isToday = today.getDate() === d && 
                    today.getMonth() === currentMonth && 
                    today.getFullYear() === currentYear;

    cells.push(
      <button
        key={`day-${d}`}
        type="button"
        onClick={() => handleSelectDay(d)}
        className="w-8 h-8 text-xs font-medium rounded-full flex items-center justify-center transition-all"
        style={{
          background: isSelected ? accentColor : 'transparent',
          color: isSelected ? '#fff' : isToday ? accentColor : 'var(--text-primary)',
          border: isToday && !isSelected ? `1.5px solid ${accentColor}` : 'none',
          boxShadow: isSelected ? `0 4px 10px rgba(0,0,0,0.15)` : 'none'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'var(--bg-row-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        {d}
      </button>
    );
  }

  // Display value nicely formatted (e.g. 28-05-2026)
  const displayValue = () => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return value;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className={`kite-input flex items-center justify-between cursor-pointer ${error ? 'error' : ''}`}
        style={{ paddingRight: '12px' }}
      >
        <span className={value ? 'text-primary' : 'text-muted'} style={{ fontSize: '13px' }}>
          {displayValue() || 'dd-mm-yyyy'}
        </span>
        <CalendarIcon size={14} className="text-muted" style={{ color: value ? accentColor : 'var(--text-muted)' }} />
      </div>

      {isOpen && (
        <div 
          className="absolute left-0 mt-2 p-4 kite-card animate-slide-down z-50"
          style={{ 
            width: '272px', 
            background: 'var(--bg-card)', 
            borderColor: 'var(--border-color)',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.2)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-primary" style={{ color: 'var(--text-primary)' }}>
              {monthNames[currentMonth]} {currentYear}
            </span>
            <div className="flex gap-1">
              <button 
                type="button" 
                onClick={handlePrevMonth} 
                className="p-1 rounded hover:bg-hover text-muted flex items-center justify-center transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-row-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                type="button" 
                onClick={handleNextMonth} 
                className="p-1 rounded hover:bg-hover text-muted flex items-center justify-center transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-row-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-xxs font-bold text-muted uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells}
          </div>
        </div>
      )}
    </div>
  );
}

export function CustomTimePicker({ value, onChange, error, accentColor = '#f35936' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef();

  useClickOutside(containerRef, () => setIsOpen(false));

  // Generate digital clock times every 15 mins for rapid selection
  const times = [];
  for (let h = 0; h < 24; h++) {
    const formattedHour = String(h).padStart(2, '0');
    times.push(`${formattedHour}:00`);
    times.push(`${formattedHour}:15`);
    times.push(`${formattedHour}:30`);
    times.push(`${formattedHour}:45`);
  }

  const handleSelectTime = (selectedTime) => {
    onChange(selectedTime);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className={`kite-input flex items-center justify-between cursor-pointer ${error ? 'error' : ''}`}
        style={{ paddingRight: '12px' }}
      >
        <span className={value ? 'text-primary' : 'text-muted'} style={{ fontSize: '13px' }}>
          {value || '--:--'}
        </span>
        <Clock size={14} className="text-muted" style={{ color: value ? accentColor : 'var(--text-muted)' }} />
      </div>

      {isOpen && (
        <div 
          className="absolute left-0 mt-2 p-2 kite-card animate-slide-down z-50"
          style={{ 
            width: '180px', 
            maxHeight: '240px',
            overflowY: 'auto',
            background: 'var(--bg-card)', 
            borderColor: 'var(--border-color)',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.2)'
          }}
        >
          {/* Quick Preset Sections */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {times.map((t) => {
              const isSelected = value === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleSelectTime(t)}
                  className="w-full text-left py-1.5 px-3 rounded text-xs transition-colors"
                  style={{
                    background: isSelected ? accentColor : 'transparent',
                    color: isSelected ? '#fff' : 'var(--text-primary)',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-row-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
