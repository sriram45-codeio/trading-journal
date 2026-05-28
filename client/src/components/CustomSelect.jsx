import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

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

export default function CustomSelect({ name, value, onChange, options, id, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef();

  useClickOutside(containerRef, () => setIsOpen(false));

  const currentOption = options.find(opt => opt.value === value) || options[0];

  const handleSelectOption = (optVal) => {
    // Mimic native change event format so handleChange handles it seamlessly
    onChange({
      target: {
        name,
        value: optVal
      }
    });
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`} id={id}>
      {/* Selection Field button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="kite-input flex items-center justify-between text-left cursor-pointer"
        style={{
          paddingRight: '12px',
          background: 'var(--bg-input)',
          borderColor: isOpen ? 'var(--accent-color)' : 'var(--border-color)',
          color: 'var(--text-primary)',
          outline: 'none'
        }}
      >
        <span className="flex items-center gap-2" style={{ fontSize: '13px' }}>
          {currentOption?.icon && <span>{currentOption.icon}</span>}
          <span>{currentOption?.label}</span>
        </span>
        <ChevronDown 
          size={14} 
          className="text-muted transition-transform" 
          style={{ 
            color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }} 
        />
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 mt-2 p-1.5 kite-card animate-slide-down z-50 w-full"
          style={{ 
            background: 'var(--bg-card)', 
            borderColor: 'var(--border-color)',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className="w-full text-left py-2 px-3 rounded text-xs transition-colors flex items-center gap-2"
                  style={{
                    background: isSelected ? 'rgba(255, 87, 34, 0.08)' : 'transparent',
                    color: isSelected ? 'var(--accent-color)' : 'var(--text-primary)',
                    border: 'none',
                    fontWeight: isSelected ? '600' : '400',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-row-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {opt.icon && <span>{opt.icon}</span>}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
