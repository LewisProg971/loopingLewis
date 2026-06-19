import React from 'react';
import { Square, Circle, Database, Code, Upload, Book, Wand2, Maximize, Image as ImageIcon, Save, FolderOpen } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Entity, Association, UMLClass } from '../types';
import { SqlDialect } from '../utils/sqlGenerator';

export interface ToolbarProps {
  onExportSQL: (dialect: SqlDialect) => void;
  onImportSQL: () => void;
  onExportDictionary: () => void;
  onExportImage: () => void;
  onSaveProject: () => void;
  onLoadProject: () => void;
  onFitView: () => void;
  showMLD: boolean;
  setShowMLD: (show: boolean) => void;
}

export const Toolbar = ({ 
  onExportSQL, 
  onImportSQL, 
  onExportDictionary,
  onExportImage,
  onSaveProject,
  onLoadProject,
  onFitView,
  showMLD, 
  setShowMLD 
}: ToolbarProps) => {
  const { 
    addEntity, 
    addAssociation, 
    addUmlClass,
    autoLayout, 
    undo, 
    redo, 
    past, 
    future,
    diagramMode,
    setDiagramMode
  } = useStore();
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

  const handleAddUmlClass = () => {
    const newClass: UMLClass = {
      id: `uml_${Date.now()}`,
      name: `Class_${Object.keys(useStore.getState().umlClasses).length + 1}`,
      attributes: [
        { id: `attr_${Date.now()}_1`, name: 'id', type: 'INT', isPrimaryKey: true, visibility: '-' }
      ],
      methods: []
    };
    addUmlClass(newClass, { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 });
  };

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 mr-2">
          <button
            onClick={() => setDiagramMode('merise')}
            className={`px-3 py-1 text-xs font-bold rounded shadow-sm transition-all ${diagramMode === 'merise' ? 'bg-white text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            MERISE
          </button>
          <button
            onClick={() => setDiagramMode('uml')}
            className={`px-3 py-1 text-xs font-bold rounded shadow-sm transition-all ${diagramMode === 'uml' ? 'bg-white text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            UML
          </button>
        </div>

        {diagramMode === 'merise' ? (
          <>
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
          </>
        ) : (
          <button 
            onClick={handleAddUmlClass}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-sm font-medium border border-purple-200 transition-colors"
          >
            <Square size={16} /> Ajouter Classe
          </button>
        )}

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button 
          onClick={onSaveProject}
          className="p-2 bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100 rounded transition-colors"
          title="Sauvegarder le Projet (.looping)"
        >
          <Save size={16} />
        </button>
        <button 
          onClick={onLoadProject}
          className="p-2 bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100 rounded transition-colors"
          title="Ouvrir un Projet"
        >
          <FolderOpen size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button 
          onClick={undo}
          disabled={past.length === 0}
          className={`p-2 border rounded transition-colors ${past.length === 0 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'}`}
          title="Annuler (Ctrl+Z)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>
        </button>
        <button 
          onClick={redo}
          disabled={future.length === 0}
          className={`p-2 border rounded transition-colors ${future.length === 0 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'}`}
          title="Rétablir (Ctrl+Y)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/></svg>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button 
          onClick={autoLayout}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100 rounded text-sm font-medium transition-colors"
          title="Organiser automatiquement"
        >
          <Wand2 size={16} /> Organiser
        </button>
        <button 
          onClick={onFitView}
          className="p-2 bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100 rounded transition-colors"
          title="Zoomer sur tout"
        >
          <Maximize size={16} />
        </button>
        <button 
          onClick={onExportImage}
          className="p-2 bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100 rounded transition-colors"
          title="Exporter en Image (PNG)"
        >
          <ImageIcon size={16} />
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