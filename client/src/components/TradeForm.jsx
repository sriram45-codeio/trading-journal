import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CustomDatePicker, CustomTimePicker } from './CustomDateTimePicker';
import CustomSelect from './CustomSelect';

export default function TradeForm({ onSubmit, initialData, onCancel }) {
  const [formData, setFormData] = useState({
    session: 'London',
    bias: 'Bullish',
    key_level: '',
    key_level_tap: 'YES',
    cisd: 'YES',
    trade_date: '',
    trade_time: '',
    direction: 'BUY',
    result: 'TP',
    risk: '',
    rr_ratio: '1:1',
    why_this_trade: '',
    emotion_mindset: '',
    mistake_improve: '',
    screenshot: null
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        session: initialData.session || 'London',
        bias: initialData.bias || 'Bullish',
        key_level: initialData.key_level || '',
        key_level_tap: initialData.key_level_tap || 'YES',
        cisd: initialData.cisd || 'YES',
        trade_date: initialData.trade_date || '',
        trade_time: initialData.trade_time || '',
        direction: initialData.direction || 'BUY',
        result: initialData.result || 'TP',
        risk: initialData.risk !== undefined && initialData.risk !== null ? String(initialData.risk) : '',
        rr_ratio: initialData.rr_ratio || '1:1',
        why_this_trade: initialData.why_this_trade || '',
        emotion_mindset: initialData.emotion_mindset || '',
        mistake_improve: initialData.mistake_improve || '',
        screenshot: initialData.screenshot || null
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.trade_date) e.trade_date = 'Required';
    if (!formData.direction) e.direction = 'Required';
    if (!formData.result) e.result = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, screenshot: base64 }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      risk: formData.risk ? parseFloat(formData.risk) : null
    });
  };

  const isBuy = formData.direction === 'BUY';
  const accentColor = isBuy ? '#4184f3' : '#df514c';

  return (
    <div className="kite-card" style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
      {/* Dynamic Buy/Sell Accent Header */}
      <div style={{
        background: accentColor,
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'background 0.25s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#fff', letterSpacing: '0.05em' }}>
            {initialData ? 'EDIT TRADE LOG' : isBuy ? 'LOG BUY ORDER' : 'LOG SELL ORDER'}
          </span>
          {/* Direction Toggle Pills */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.18)', borderRadius: '20px', padding: '2px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, direction: 'BUY' }))}
              id="form-toggle-buy"
              style={{
                padding: '4px 14px',
                fontSize: '11px',
                fontWeight: '700',
                background: isBuy ? '#fff' : 'transparent',
                border: 'none',
                color: isBuy ? '#4184f3' : '#fff',
                cursor: 'pointer',
                borderRadius: '16px',
                transition: 'all 0.2s ease'
              }}
            >BUY</button>
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, direction: 'SELL' }))}
              id="form-toggle-sell"
              style={{
                padding: '4px 14px',
                fontSize: '11px',
                fontWeight: '700',
                background: !isBuy ? '#fff' : 'transparent',
                border: 'none',
                color: !isBuy ? '#df514c' : '#fff',
                cursor: 'pointer',
                borderRadius: '16px',
                transition: 'all 0.2s ease'
              }}
            >SELL</button>
          </div>
        </div>
        {onCancel && (
          <button 
            onClick={onCancel} 
            style={{ 
              background: 'rgba(255,255,255,0.15)', 
              border: 'none', 
              color: '#fff', 
              cursor: 'pointer', 
              display: 'flex',
              padding: '4px',
              borderRadius: '50%'
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Two-Column Form Body */}
      <form onSubmit={handleSubmit} style={{ padding: '24px 28px', background: 'var(--bg-secondary)', transition: 'background-color 0.2s ease' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', marginBottom: '24px' }}>
          
          {/* COLUMN 1: 5-Item Checklist */}
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', transition: 'all 0.2s ease' }}>
            <h4 style={{ color: accentColor, fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              Checklist Verification
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>1. Trading Session</label>
                <CustomSelect
                  name="session"
                  value={formData.session}
                  onChange={handleChange}
                  options={[
                    { value: 'London', label: 'London', icon: '🇬🇧' },
                    { value: 'NY', label: 'NY (New York)', icon: '🇺🇸' },
                    { value: 'Asia', label: 'Asia (Tokyo/Sydney)', icon: '🇯🇵' },
                    { value: 'Pre-Market', label: 'Pre-Market', icon: '🌅' }
                  ]}
                  id="input-session"
                />
              </div>
              <div>
                <label style={labelStyle}>2. Market Bias</label>
                <CustomSelect
                  name="bias"
                  value={formData.bias}
                  onChange={handleChange}
                  options={[
                    { value: 'Bullish', label: 'Bullish Bias', icon: '🟢' },
                    { value: 'Bearish', label: 'Bearish Bias', icon: '🔴' },
                    { value: 'Neutral', label: 'Neutral Bias', icon: '🟡' }
                  ]}
                  id="input-bias"
                />
              </div>
              <div>
                <label style={labelStyle}>3. Key Level (Ketylevel)</label>
                <input 
                  type="text" 
                  name="key_level" 
                  value={formData.key_level} 
                  onChange={handleChange} 
                  placeholder="e.g. Daily High, H4 Support..." 
                  className="kite-input" 
                  id="input-key-level" 
                />
              </div>
              <div>
                <label style={labelStyle}>4. Key Level Tap (Yes/No)</label>
                <CustomSelect
                  name="key_level_tap"
                  value={formData.key_level_tap}
                  onChange={handleChange}
                  options={[
                    { value: 'YES', label: 'YES (Tap Confirmed)', icon: '✅' },
                    { value: 'NO', label: 'NO (Level Missed)', icon: '❌' }
                  ]}
                  id="input-key-level-tap"
                />
              </div>
              <div>
                <label style={labelStyle}>5. CISD (Change in State of Delivery)</label>
                <CustomSelect
                  name="cisd"
                  value={formData.cisd}
                  onChange={handleChange}
                  options={[
                    { value: 'YES', label: 'YES (CISD Formed)', icon: '✅' },
                    { value: 'NO', label: 'NO (No Shift)', icon: '❌' }
                  ]}
                  id="input-cisd"
                />
              </div>
            </div>
          </div>

          {/* COLUMN 2: 5 Metrics Fields */}
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', transition: 'all 0.2s ease' }}>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              Trade Metrics
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>1. Date *</label>
                <CustomDatePicker
                  value={formData.trade_date}
                  onChange={(val) => {
                    setFormData(prev => ({ ...prev, trade_date: val }));
                    if (errors.trade_date) setErrors(prev => ({ ...prev, trade_date: '' }));
                  }}
                  error={errors.trade_date}
                  accentColor={accentColor}
                />
                {errors.trade_date && <p style={errStyle}>{errors.trade_date}</p>}
              </div>
              <div>
                <label style={labelStyle}>2. Time (IST)</label>
                <CustomTimePicker
                  value={formData.trade_time}
                  onChange={(val) => setFormData(prev => ({ ...prev, trade_time: val }))}
                  accentColor={accentColor}
                />
              </div>
              <div>
                <label style={labelStyle}>3. Buy or Sell Direction *</label>
                <CustomSelect
                  name="direction"
                  value={formData.direction}
                  onChange={handleChange}
                  options={[
                    { value: 'BUY', label: 'BUY / LONG', icon: '🔵' },
                    { value: 'SELL', label: 'SELL / SHORT', icon: '🔴' }
                  ]}
                  id="input-direction"
                />
              </div>
              <div>
                <label style={labelStyle}>4. Result *</label>
                <CustomSelect
                  name="result"
                  value={formData.result}
                  onChange={handleChange}
                  options={[
                    { value: 'TP', label: 'TP (Take Profit)', icon: '🟢' },
                    { value: 'SL', label: 'SL (Stop Loss Hit)', icon: '🔴' },
                    { value: 'HOLD', label: 'HOLD (Wait / Pending Result)', icon: '🟡' }
                  ]}
                  id="input-result"
                />
                {errors.result && <p style={errStyle}>{errors.result}</p>}
              </div>
              <div>
                <label style={labelStyle}>5. Risk ($ Exposure)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  name="risk" 
                  value={formData.risk} 
                  onChange={handleChange} 
                  placeholder="e.g. 10" 
                  className="kite-input" 
                  id="input-risk" 
                />
              </div>
              <div>
                <label style={labelStyle}>6. Risk:Reward Ratio</label>
                <CustomSelect
                  name="rr_ratio"
                  value={formData.rr_ratio}
                  onChange={handleChange}
                  options={[
                    { value: '1:1', label: '1:1 Ratio', icon: '⚖️' },
                    { value: '1:2', label: '1:2 Ratio', icon: '📈' },
                    { value: '1:3', label: '1:3 Ratio', icon: '🚀' },
                    { value: '1:4', label: '1:4 Ratio', icon: '🔥' },
                    { value: '1:5', label: '1:5 Ratio', icon: '🏆' }
                  ]}
                  id="input-rr-ratio"
                />
              </div>
              <div>
                <label style={labelStyle}>7. Screenshot of Trade</label>
                <div style={{
                  border: '1.5px dashed var(--border-color)',
                  borderRadius: 'var(--radius-btn)',
                  padding: '12px',
                  textAlign: 'center',
                  background: 'var(--bg-secondary)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleFile(file);
                }}
                >
                  {formData.screenshot ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img 
                        src={formData.screenshot} 
                        alt="Trade Screenshot" 
                        style={{ maxHeight: '110px', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'block' }} 
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, screenshot: null }));
                        }}
                        style={{
                          position: 'absolute', top: '-6px', right: '-6px',
                          background: '#df514c', color: '#fff', border: 'none',
                          borderRadius: '50%', padding: '2px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}>
                      <span style={{ fontSize: '18px' }}>📸</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click or Drag screenshot to upload</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleFile(file);
                        }} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: 3 Narrative Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={textareaLabelStyle(accentColor)}>Part A: Why This Trade? (Market Context & Setup Confirmation)</label>
            <textarea
              name="why_this_trade"
              value={formData.why_this_trade}
              onChange={handleChange}
              rows={4}
              placeholder="Detail the market bias, tap reactions, liquidity sweeps, CISD shift, etc..."
              className="kite-input"
              style={{ resize: 'vertical', minHeight: '80px', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
              id="textarea-why-this-trade"
            />
          </div>

          <div>
            <label style={textareaLabelStyle(accentColor)}>Part B: Emotion / Mindset Notes</label>
            <textarea
              name="emotion_mindset"
              value={formData.emotion_mindset}
              onChange={handleChange}
              rows={3}
              placeholder="What was your mental state? Were you anxious? Patient? Did you wait for your trigger?"
              className="kite-input"
              style={{ resize: 'vertical', minHeight: '60px', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
              id="textarea-emotion-mindset"
            />
          </div>

          <div>
            <label style={textareaLabelStyle(accentColor)}>Part C: Mistake / Improvements Actionable</label>
            <textarea
              name="mistake_improve"
              value={formData.mistake_improve}
              onChange={handleChange}
              rows={2}
              placeholder="What could be improved? Did you break any rules?"
              className="kite-input"
              style={{ resize: 'vertical', minHeight: '44px', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
              id="textarea-mistake-improve"
            />
          </div>
        </div>

        {/* Actions Row */}
        <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <button
            type="submit"
            id="form-btn-submit"
            className="kite-btn"
            style={{
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: '600',
              background: accentColor,
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-btn)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: `0 4px 12px ${isBuy ? 'rgba(65, 132, 243, 0.2)' : 'rgba(223, 81, 76, 0.2)'}`
            }}
          >
            {initialData ? 'Update Logged Trade' : isBuy ? 'Confirm Buy Log' : 'Confirm Sell Log'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="kite-btn kite-btn-ghost" id="form-btn-cancel">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '600',
  color: 'var(--text-muted)',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const textareaLabelStyle = (accent) => ({
  display: 'block',
  fontSize: '11.5px',
  fontWeight: '700',
  color: accent,
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
});

const errStyle = {
  color: '#df514c',
  fontSize: '10.5px',
  marginTop: '4px',
  fontWeight: '500'
};
