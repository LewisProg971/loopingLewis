import { BaseEdge, EdgeProps, getStraightPath, EdgeLabelRenderer } from '@xyflow/react';
import { useStore } from '../store/useStore';

export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  style,
  markerEnd,
  label,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const selectedElementId = useStore(state => state.selectedElementId);
  const setSelectedElement = useStore(state => state.setSelectedElement);
  
  const isSelected = selectedElementId === id;
  const displayLabel = (label as string) || (data?.cardinality as string) || '0,n';

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        style={{ ...style, strokeWidth: isSelected ? 3 : 1.5, stroke: isSelected ? '#3b82f6' : '#1f2937' }} 
        markerEnd={markerEnd} 
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: 'white',
            padding: '2px 4px',
            borderRadius: 3,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            pointerEvents: 'all',
            border: isSelected ? '1px solid #3b82f6' : '1px solid transparent',
          }}
          className="nodrag nopan"
          onClick={(e) => { e.stopPropagation(); setSelectedElement(id); }}
        >
          {displayLabel}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};