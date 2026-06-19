import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { useStore } from '../store/useStore';
import { UMLClass, Visibility } from '../types';

export type UmlClassNodeType = Node<{ umlClass: UMLClass }, 'umlClassNode'>;

const getVisibilitySymbol = (vis?: Visibility) => {
  switch (vis) {
    case '+': return '+';
    case '-': return '-';
    case '#': return '#';
    default: return ' ';
  }
};

export const UmlClassNode = ({ id, data }: NodeProps<UmlClassNodeType>) => {
  const selectedElementId = useStore(state => state.selectedElementId);
  const setSelectedElement = useStore(state => state.setSelectedElement);
  
  const umlClass = data.umlClass;
  const isSelected = selectedElementId === id;

  return (
    <div 
      className={`bg-[#ffffe0] border border-black min-w-[160px] flex flex-col font-sans transition-shadow ${isSelected ? 'ring-2 ring-purple-400 shadow-lg' : 'shadow-md'}`}
      onClick={(e) => { e.stopPropagation(); setSelectedElement(id); }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      
      {/* 1. Name Section */}
      <div className="font-bold text-center py-2 px-4 border-b border-black">
        {umlClass.isAbstract && <div className="text-xs italic font-normal">&lt;&lt; abstract &gt;&gt;</div>}
        <div className={umlClass.isAbstract ? 'italic' : ''}>{umlClass.name}</div>
      </div>
      
      {/* 2. Attributes Section */}
      <div className="p-2 border-b border-black min-h-[24px]">
        {umlClass.attributes.map((attr) => (
          <div key={attr.id} className="text-xs flex gap-1 font-mono">
            <span>{getVisibilitySymbol(attr.visibility)}</span>
            <span>{attr.name}</span>
            <span>:</span>
            <span className="text-gray-600">{attr.type}</span>
          </div>
        ))}
      </div>

      {/* 3. Methods Section */}
      <div className="p-2 min-h-[24px]">
        {umlClass.methods.map((method) => (
          <div key={method.id} className="text-xs flex gap-1 font-mono">
            <span>{getVisibilitySymbol(method.visibility)}</span>
            <span>{method.name}({method.args.map(a => `${a.name}: ${a.type}`).join(', ')})</span>
            <span>:</span>
            <span className="text-gray-600">{method.returnType}</span>
          </div>
        ))}
      </div>
    </div>
  );
};