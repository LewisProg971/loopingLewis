import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Entity } from '../types';
import { useStore } from '../store/useStore';

export const EntityNode = ({ id, data }: NodeProps<{ entity: Entity }>) => {
  const selectedElementId = useStore(state => state.selectedElementId);
  const setSelectedElement = useStore(state => state.setSelectedElement);
  
  const entity = data.entity;
  const isSelected = selectedElementId === id;

  return (
    <div 
      className={`bg-white border-2 rounded shadow-md min-w-[150px] ${isSelected ? 'border-blue-500' : 'border-gray-800'}`}
      onClick={(e) => { e.stopPropagation(); setSelectedElement(id); }}
    >
      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-blue-500" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-blue-500" id="left" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-blue-500" id="right" />

      <div className="bg-gray-200 font-bold text-center py-2 px-4 border-b border-gray-800 rounded-t">
        {entity.name}
      </div>
      <div className="p-2 text-sm flex flex-col gap-1 min-h-[40px]">
        {entity.attributes.map(attr => (
          <div key={attr.id} className="flex items-center">
            {attr.isPrimaryKey ? (
              <span className="underline font-semibold mr-1">{attr.name}</span>
            ) : (
              <span className="mr-1">{attr.name}</span>
            )}
            <span className="text-gray-500 text-xs">({attr.type})</span>
          </div>
        ))}
      </div>
    </div>
  );
};