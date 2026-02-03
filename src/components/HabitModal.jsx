import React, { useState } from 'react';
import { X, Sword, Brain, Sparkles, MessageCircle } from 'lucide-react';

export default function HabitModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [attribute, setAttribute] = useState('str'); // Default to Strength

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, attribute });
    setName('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide-up">
        <div className="modal-header">
          <h3>New Quest</h3>
          <button onClick={onClose} className="close-btn"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Quest Name</label>
            <input 
              autoFocus
              type="text" 
              placeholder="e.g. 50 Pushups" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="attribute-selector">
            <label>Class Attribute</label>
            <div className="class-grid">
              
              <button type="button" 
                className={`class-card warrior ${attribute === 'str' ? 'selected' : ''}`}
                onClick={() => setAttribute('str')}
              >
                <Sword size={20} />
                <span>Warrior</span>
                <small>+STR</small>
              </button>

              <button type="button" 
                className={`class-card mage ${attribute === 'int' ? 'selected' : ''}`}
                onClick={() => setAttribute('int')}
              >
                <Brain size={20} />
                <span>Mage</span>
                <small>+INT</small>
              </button>

              <button type="button" 
                className={`class-card monk ${attribute === 'wis' ? 'selected' : ''}`}
                onClick={() => setAttribute('wis')}
              >
                <Sparkles size={20} />
                <span>Monk</span>
                <small>+WIS</small>
              </button>

              <button type="button" 
                className={`class-card bard ${attribute === 'cha' ? 'selected' : ''}`}
                onClick={() => setAttribute('cha')}
              >
                <MessageCircle size={20} />
                <span>Bard</span>
                <small>+CHA</small>
              </button>

            </div>
          </div>

          <button type="submit" className="save-btn">Start Quest</button>
        </form>
      </div>
    </div>
  );
}