import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Association } from '../types';
import { useStore } from '../store/useStore';

export const AssociationNode = ({ id, data }: NodeProps<{ association: Association }>) => {
  const selectedElementId = useStore(state => state.selectedElementId);
  const setSelectedElement = useStore(state => state.setSelectedElement);
  
  const assoc = data.association;
  const isSelected = selectedElementId === id;

  return (
    <div 
      className={`relative flex items-center justify-center cursor-pointer`}
      onClick={(e) => { e.stopPropagation(); setSelectedElement(id); }}
    >
      {/* Ellipse shape for association in Merise */}
      <div className={`
        bg-orange-100 border-2 rounded-full flex flex-col items-center justify-center min-w-[120px] min-h-[60px] p-2 shadow-sm
        ${isSelected ? 'border-blue-500' : 'border-orange-500'}
      `}>
        <span className="font-bold text-sm text-center">{assoc.name}</span>
        {assoc.attributes && assoc.attributes.length > 0 && (
          <div className="text-xs text-gray-600 mt-1 flex flex-col items-center">
            {assoc.attributes.map(attr => (
               <span key={attr.id}>{attr.name}</span>
            ))}
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="w-2 h-2 opacity-0" id="top" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 opacity-0" id="bottom" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 opacity-0" id="left" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 opacity-0" id="right" />
    </div>
  );
};