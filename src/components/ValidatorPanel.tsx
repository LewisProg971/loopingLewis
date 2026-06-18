import React from 'react';
import { useStore } from '../store/useStore';
import { validateMCD } from '../utils/validator';
import { AlertTriangle, XCircle, ChevronUp, ChevronDown } from 'lucide-react';

export const ValidatorPanel = () => {
  const { entities, associations, edges, setSelectedElement } = useStore();
  const [isOpen, setIsOpen] = React.useState(false);

  const messages = validateMCD(entities, associations, edges);
  const errors = messages.filter(m => m.type === 'error');
  const warnings = messages.filter(m => m.type === 'warning');

  if (messages.length === 0 && !isOpen) return null;

  return (
    <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-[600px] bg-white border border-gray-300 rounded-t-lg shadow-2xl z-50 transition-all ${isOpen ? 'h-64' : 'h-10'}`}>
      <div 
        className="h-10 px-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 border-b"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
            Validateur Merise
          </span>
          <div className="flex gap-3">
            <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
              <XCircle size={14} /> {errors.length} erreurs
            </span>
            <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
              <AlertTriangle size={14} /> {warnings.length} alertes
            </span>
          </div>
        </div>
        {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </div>

      {isOpen && (
        <div className="p-2 overflow-y-auto h-52 flex flex-col gap-1">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-green-600 font-medium">
              Aucun problème détecté ! Félicitations.
            </div>
          ) : (
            messages.map(msg => (
              <div 
                key={msg.id}
                className={`p-2 rounded text-xs flex items-start gap-2 cursor-pointer border ${
                  msg.type === 'error' 
                    ? 'bg-red-50 border-red-100 text-red-800 hover:bg-red-100' 
                    : 'bg-amber-50 border-amber-100 text-amber-800 hover:bg-amber-100'
                }`}
                onClick={() => setSelectedElement(msg.elementId)}
              >
                {msg.type === 'error' ? <XCircle size={14} className="mt-0.5 shrink-0" /> : <AlertTriangle size={14} className="mt-0.5 shrink-0" />}
                <span>{msg.text}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};