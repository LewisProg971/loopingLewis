import React from 'react';
import { Square, Circle, Database, Code, Upload } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Entity, Association } from '../types';

interface ToolbarProps {
  onExportSQL: () => void;
  onImportSQL: () => void;
  showMLD: boolean;
  setShowMLD: (show: boolean) => void;
}

export const Toolbar = ({ onExportSQL, onImportSQL, showMLD, setShowMLD }: ToolbarProps) => {
  const { addEntity, addAssociation } = useStore();

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

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setShowMLD(!showMLD)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium border transition-colors ${
            showMLD ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Database size={16} /> MLD
        </button>
        <div className="w-px h-6 bg-gray-300"></div>
        <button 
          onClick={onImportSQL}
          className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded text-sm font-medium transition-colors"
        >
          <Upload size={16} /> Importer SQL
        </button>
        <button 
          onClick={onExportSQL}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded text-sm font-medium shadow-sm transition-colors"
        >
          <Code size={16} /> Exporter SQL
        </button>
      </div>
    </div>
  );
};