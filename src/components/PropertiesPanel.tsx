import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Attribute, DataType, Entity, Association } from '../types';
import { Trash2, Plus } from 'lucide-react';

export const PropertiesPanel = () => {
  const { 
    selectedElementId, 
    entities, 
    associations, 
    edges,
    updateEntity,
    updateAssociation,
    updateEdgeCardinality,
    deleteElement
  } = useStore();

  const [localName, setLocalName] = useState('');
  const [localCard, setLocalCard] = useState('');

  const entity = selectedElementId ? entities[selectedElementId] : null;
  const association = selectedElementId ? associations[selectedElementId] : null;
  const edge = selectedElementId && selectedElementId.startsWith('e-') ? edges.find(e => e.id === selectedElementId) : null;

  useEffect(() => {
    if (entity) setLocalName(entity.name);
    else if (association) setLocalName(association.name);
    else if (edge) setLocalCard(edge.data?.cardinality as string || '0,n');
  }, [selectedElementId, entity, association, edge]);

  if (!selectedElementId) {
    return (
      <div className="w-64 bg-gray-50 border-l border-gray-200 p-4 flex flex-col h-full">
        <h2 className="font-bold text-lg mb-4 text-gray-700">Propriétés</h2>
        <p className="text-gray-500 text-sm">Sélectionnez un élément pour voir ses propriétés.</p>
      </div>
    );
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalName(e.target.value);
  };

  const handleNameBlur = () => {
    if (entity) updateEntity(entity.id, { name: localName });
    if (association) updateAssociation(association.id, { name: localName });
  };

  const addAttribute = (targetId: string, type: 'entity' | 'association') => {
    const newAttr: Attribute = {
      id: `attr_${Date.now()}`,
      name: 'nouvel_attribut',
      type: 'VARCHAR',
      isPrimaryKey: false
    };

    if (type === 'entity' && entity) {
      updateEntity(entity.id, { attributes: [...entity.attributes, newAttr] });
    } else if (type === 'association' && association) {
      updateAssociation(association.id, { attributes: [...(association.attributes || []), newAttr] });
    }
  };

  const updateAttribute = (targetId: string, type: 'entity' | 'association', attrId: string, changes: Partial<Attribute>) => {
    if (type === 'entity' && entity) {
      const newAttrs = entity.attributes.map(a => a.id === attrId ? { ...a, ...changes } : a);
      updateEntity(entity.id, { attributes: newAttrs });
    } else if (type === 'association' && association) {
      const newAttrs = (association.attributes || []).map(a => a.id === attrId ? { ...a, ...changes } : a);
      updateAssociation(association.id, { attributes: newAttrs });
    }
  };

  const removeAttribute = (targetId: string, type: 'entity' | 'association', attrId: string) => {
    if (type === 'entity' && entity) {
      const newAttrs = entity.attributes.filter(a => a.id !== attrId);
      updateEntity(entity.id, { attributes: newAttrs });
    } else if (type === 'association' && association) {
      const newAttrs = (association.attributes || []).filter(a => a.id !== attrId);
      updateAssociation(association.id, { attributes: newAttrs });
    }
  };

  const renderAttributes = (attrs: Attribute[], parentType: 'entity' | 'association') => (
    <div className="mt-4 flex flex-col gap-2">
      <h3 className="font-semibold text-sm mb-1 flex justify-between items-center">
        Attributs
        <button onClick={() => addAttribute(selectedElementId, parentType)} className="p-1 hover:bg-gray-200 rounded text-blue-600">
          <Plus size={16} />
        </button>
      </h3>
      {attrs.map(attr => (
        <div key={attr.id} className="bg-white p-2 border border-gray-200 rounded text-xs flex flex-col gap-2">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={attr.name}
              onChange={(e) => updateAttribute(selectedElementId, parentType, attr.id, { name: e.target.value })}
              className="border p-1 w-full"
            />
            <button onClick={() => removeAttribute(selectedElementId, parentType, attr.id)} className="text-red-500">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <select 
              value={attr.type}
              onChange={(e) => updateAttribute(selectedElementId, parentType, attr.id, { type: e.target.value as DataType })}
              className="border p-1 w-full"
            >
              <option value="INT">INT</option>
              <option value="VARCHAR">VARCHAR</option>
              <option value="DATE">DATE</option>
              <option value="BOOLEAN">BOOLEAN</option>
              <option value="DECIMAL">DECIMAL</option>
              <option value="TEXT">TEXT</option>
            </select>
            <label className="flex items-center gap-1 min-w-max">
              <input 
                type="checkbox" 
                checked={attr.isPrimaryKey}
                onChange={(e) => updateAttribute(selectedElementId, parentType, attr.id, { isPrimaryKey: e.target.checked })}
              />
              PK
            </label>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 flex flex-col h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg text-gray-700">Propriétés</h2>
        <button onClick={() => deleteElement(selectedElementId)} className="text-red-500 p-1 hover:bg-red-50 rounded" title="Supprimer">
          <Trash2 size={18} />
        </button>
      </div>

      {(entity || association) && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Nom</label>
          <input 
            type="text" 
            value={localName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
            className="border p-2 rounded"
          />
        </div>
      )}

      {entity && renderAttributes(entity.attributes, 'entity')}
      {association && renderAttributes(association.attributes || [], 'association')}

      {edge && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Cardinalité</label>
          <select 
            value={localCard}
            onChange={(e) => {
              setLocalCard(e.target.value);
              updateEdgeCardinality(selectedElementId, e.target.value);
            }}
            className="border p-2 rounded"
          >
            <option value="0,1">0,1</option>
            <option value="1,1">1,1</option>
            <option value="0,n">0,n</option>
            <option value="1,n">1,n</option>
          </select>
        </div>
      )}
    </div>
  );
};