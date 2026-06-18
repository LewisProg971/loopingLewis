import React from 'react';
import { Square, Circle, Database, Code, Upload, Book } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Entity, Association, SqlDialect } from '../types';

interface ToolbarProps {
  onExportSQL: (dialect: SqlDialect) => void;
  onImportSQL: () => void;
  onExportDictionary: () => void;
  showMLD: boolean;
  setShowMLD: (show: boolean) => void;
}

export const Toolbar = ({ 
  onExportSQL, 
  onImportSQL, 
  onExportDictionary,
  showMLD, 
  setShowMLD 
}: ToolbarProps) => {
  const { addEntity, addAssociation } = useStore();
  const [selectedDialect, setSelectedDialect] = React.useState<SqlDialect>('mysql');

  const handleAddEntity = () => {
    const newEntity: Entity = {
      id: `entity_${Date.now()}`,
      name: `Entite_${Object.keys(useStore.getState().entities).length + 1}`,
      attributes: [
        { id: `attr_${Date.now()}_1`, name: 'id', type: 'INT', isPrimaryKey: true }
      ]
    };
    addEntity(newEntity, { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 });
  };

  const handleAddAssociation = () => {
    const newAssoc: Association = {
      id: `assoc_${Date.now()}`,
      name: `Assoc_${Object.keys(useStore.getState().associations).length + 1}`,
      roles: [],
      attributes: []
    };
    addAssociation(newAssoc, { x: Math.random() * 200 + 300, y: Math.random() * 200 + 50 });
  };

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <button 
          onClick={handleAddEntity}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-sm font-medium border border-blue-200 transition-colors"
        >
          <Square size={16} /> Ajouter Entité
        </button>
        <button 
          onClick={handleAddAssociation}
          className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded text-sm font-medium border border-orange-200 transition-colors"
        >
          <Circle size={16} /> Ajouter Association
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onExportDictionary}
          className="flex items-center gap-2 px-3 py-1.5 bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 rounded text-sm font-medium transition-colors"
          title="Dictionnaire de Données (Markdown)"
        >
          <Book size={16} /> Dictionnaire
        </button>

        <div className="flex items-center gap-1 bg-gray-50 border border-gray-300 rounded p-1">
          <select 
            value={selectedDialect}
            onChange={(e) => setSelectedDialect(e.target.value as SqlDialect)}
            className="bg-transparent text-xs font-semibold outline-none border-none p-0.5"
          >
            <option value="mysql">MySQL</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="sqlite">SQLite</option>
          </select>
          <button 
            onClick={() => onExportSQL(selectedDialect)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-green-600 text-white hover:bg-green-700 rounded text-xs font-bold shadow-sm transition-colors"
          >
            <Code size={14} /> SQL
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button 
          onClick={() => setShowMLD(!showMLD)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium border transition-colors ${
            showMLD ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Database size={16} /> MLD
        </button>
        
        <button 
          onClick={onImportSQL}
          className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded text-sm font-medium transition-colors"
        >
          <Upload size={16} />
        </button>
      </div>
    </div>
  );
};