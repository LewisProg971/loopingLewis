import React, { useState, useCallback, useRef } from 'react';
import { ReactFlow, Background, Controls, MiniMap, ConnectionMode, ReactFlowProvider } from '@xyflow/react';
import { useStore } from './store/useStore';
import { EntityNode } from './components/EntityNode';
import { AssociationNode } from './components/AssociationNode';
import { CustomEdge } from './components/CustomEdge';
import { InheritanceEdge } from './components/InheritanceEdge';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { MLDPanel } from './components/MLDPanel';
import { ValidatorPanel } from './components/ValidatorPanel';
import { generateMLD } from './utils/mldGenerator';
import { generateSQL } from './utils/sqlGenerator';
import { parseSQL } from './utils/sqlParser';
import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import { toPng } from 'html-to-image';

const nodeTypes = {
  entityNode: EntityNode,
  associationNode: AssociationNode,
};

const edgeTypes = {
  customEdge: CustomEdge,
  inheritanceEdge: InheritanceEdge,
};

function FlowApp() {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    setSelectedElement,
    entities,
    associations,
    loadProject
  } = useStore();

  const [showMLD, setShowMLD] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onPaneClick = useCallback(() => {
    setSelectedElement(null);
  }, [setSelectedElement]);

  const handleExportSQL = async () => {
    try {
      const tables = generateMLD(entities, associations);
      const sql = generateSQL(tables, 'postgresql'); // Defaulting to PG for now
      
      const filePath = await save({
        filters: [{
          name: 'SQL Script',
          extensions: ['sql']
        }]
      });

      if (filePath) {
        await writeTextFile(filePath, sql);
        alert('Script SQL exporté avec succès !');
      }
    } catch (error) {
      console.error(error);
      alert(`Erreur lors de l'exportation SQL : ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleImportSQL = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'SQL Script',
          extensions: ['sql']
        }]
      });

      if (selected && typeof selected === 'string') {
        const contents = await readTextFile(selected);
        const { entities: newEntities, associations: newAssocs } = parseSQL(contents);
        
        // Convert to nodes
        const newNodes: any[] = [];
        const newEdges: any[] = [];
        let x = 100, y = 100;

        Object.values(newEntities).forEach(ent => {
          newNodes.push({
            id: ent.id,
            type: 'entityNode',
            position: { x, y },
            data: { entity: ent }
          });
          x += 250;
          if (x > 800) { x = 100; y += 200; }
        });

        Object.values(newAssocs).forEach(assoc => {
          newNodes.push({
            id: assoc.id,
            type: 'associationNode',
            position: { x, y },
            data: { association: assoc }
          });

          // Create edges for association roles
          assoc.roles.forEach(role => {
            const edgeId = `e-${assoc.id}-${role.entityId}`;
            newEdges.push({
              id: edgeId,
              source: assoc.id,
              target: role.entityId,
              label: role.cardinality,
              type: 'customEdge',
              data: { cardinality: role.cardinality }
            });
          });

          x += 250;
          if (x > 800) { x = 100; y += 200; }
        });

        // Basic load - replaces current project
        loadProject({
          nodes: newNodes,
          edges: newEdges,
          entities: newEntities,
          associations: newAssocs
        });
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l\'importation SQL.');
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-gray-100 text-gray-900 font-sans">
      <Toolbar 
        onExportSQL={handleExportSQL} 
        onImportSQL={handleImportSQL} 
        showMLD={showMLD} 
        setShowMLD={setShowMLD} 
      />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionMode={ConnectionMode.Loose}
            onPaneClick={onPaneClick}
            fitView
          >
            <Background color="#ccc" gap={16} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {showMLD && <MLDPanel onClose={() => setShowMLD(false)} />}
        <PropertiesPanel />
      </div>
      <ValidatorPanel />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowApp />
    </ReactFlowProvider>
  );
}