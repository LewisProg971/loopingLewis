import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ReactFlow, Background, Controls, MiniMap, ConnectionMode, ReactFlowProvider, useReactFlow } from '@xyflow/react';
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
import { generateSQL, SqlDialect } from './utils/sqlGenerator';
import { generateDataDictionary } from './utils/dictionaryGenerator';
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
    selectedElementId,
    deleteElement,
    duplicateSelectedElement,
    entities,
    associations,
    loadProject
  } = useStore();

  const { fitView } = useReactFlow();
  const [showMLD, setShowMLD] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        duplicateSelectedElement();
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedElementId) {
          deleteElement(selectedElementId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, deleteElement, duplicateSelectedElement]);

  const onPaneClick = useCallback(() => {
    setSelectedElement(null);
  }, [setSelectedElement]);

  const handleExportSQL = async (dialect: SqlDialect) => {
    try {
      const tables = generateMLD(entities, associations, edges);
      const sql = generateSQL(tables, dialect);
      
      const filePath = await save({
        filters: [{
          name: 'SQL Script',
          extensions: ['sql']
        }]
      });

      if (filePath) {
        await writeTextFile(filePath, sql);
        alert(`Script SQL (${dialect.toUpperCase()}) exporté avec succès !`);
      }
    } catch (error) {
      console.error(error);
      alert(`Erreur lors de l'exportation SQL : ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleExportDictionary = async () => {
    try {
      const md = generateDataDictionary(entities, associations);
      
      const filePath = await save({
        filters: [{
          name: 'Dictionnaire Markdown',
          extensions: ['md']
        }]
      });

      if (filePath) {
        await writeTextFile(filePath, md);
        alert('Dictionnaire de données exporté avec succès !');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l\'exportation du dictionnaire.');
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
              data: { cardinality: role.cardinality, isRelative: role.isRelative }
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
        onExportDictionary={handleExportDictionary}
        onFitView={() => fitView({ duration: 800 })}
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
            <MiniMap 
              style={{ height: 120, border: '1px solid #d1d5db', borderRadius: '8px' }}
              zoomable
              pannable
            />
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