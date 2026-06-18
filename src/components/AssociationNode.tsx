import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { useStore } from '../store/useStore';
import { Association } from '../types';

export type AssociationNodeType = Node<{ association: Association }, 'associationNode'>;

export const AssociationNode = ({ id, data }: NodeProps<AssociationNodeType>) => {
  const selectedElementId = useStore(state => state.selectedElementId);
  const setSelectedElement = useStore(state => state.setSelectedElement);
  
  const assoc = data.association;
  const isSelected = selectedElementId === id;

  return (
    <div 
      className={`bg-orange-50 border-2 rounded-full shadow-sm min-w-[100px] min-h-[60px] flex items-center justify-center transition-colors px-6 py-3 ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-orange-400'}`}
      onClick={(e) => { e.stopPropagation(); setSelectedElement(id); }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      
      <div className="flex flex-col items-center">
        <span className="font-bold text-orange-900 text-sm text-center">{assoc.name}</span>
        {assoc.attributes && assoc.attributes.length > 0 && (
          <div className="mt-1 text-[10px] text-orange-800 flex flex-col items-center">
            {assoc.attributes.map((attr: any) => (
              <span key={attr.id}>{attr.name}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};