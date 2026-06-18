import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { useStore } from '../store/useStore';
import { Entity } from '../types';

export type EntityNodeType = Node<{ entity: Entity }, 'entityNode'>;

export const EntityNode = ({ id, data }: NodeProps<EntityNodeType>) => {
  const selectedElementId = useStore(state => state.selectedElementId);
  const setSelectedElement = useStore(state => state.setSelectedElement);
  
  const entity = data.entity;
  const isSelected = selectedElementId === id;

  return (
    <div 
      className={`bg-white border-2 rounded shadow-md min-w-[150px] transition-colors ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-800'}`}
      onClick={(e) => { e.stopPropagation(); setSelectedElement(id); }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      
      <div className="bg-gray-100 font-bold text-center py-2 px-4 border-b border-gray-300">
        {entity.name}
      </div>
      <div className="p-2 flex flex-col gap-1">
        {entity.attributes.map((attr: any) => (
          <div key={attr.id} className="text-sm flex justify-between items-center px-1">
            <span className={attr.isPrimaryKey ? 'underline font-semibold' : ''}>
              {attr.name}
            </span>
            <span className="text-xs text-gray-500 ml-4">{attr.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};