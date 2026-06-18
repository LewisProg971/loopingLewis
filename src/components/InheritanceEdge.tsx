import React from 'react';
import { BaseEdge, EdgeProps, getStraightPath, EdgeLabelRenderer } from '@xyflow/react';
import { useStore } from '../store/useStore';

export const InheritanceEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
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

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        style={{ 
          ...style, 
          strokeWidth: isSelected ? 3 : 2, 
          stroke: isSelected ? '#3b82f6' : '#1f2937',
        }} 
        // We'll use a custom marker or just standard arrow for now
        markerEnd={markerEnd} 
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: 'white',
            padding: '2px 6px',
            borderRadius: 12,
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
            pointerEvents: 'all',
            border: isSelected ? '1px solid #3b82f6' : '1px solid #1f2937',
            color: '#1f2937',
          }}
          className="nodrag nopan"
          onClick={(e) => { e.stopPropagation(); setSelectedElement(id); }}
        >
          IS A
        </div>
      </EdgeLabelRenderer>
    </>
  );
};