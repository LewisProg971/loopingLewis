import { useState, useCallback, useRef, useEffect } from 'react';
import { ReactFlow, Background, Controls, MiniMap, ConnectionMode, ReactFlowProvider, useReactFlow, NodeTypes } from '@xyflow/react';
import { useStore } from './store/useStore';
import { EntityNode } from './components/EntityNode';
import { AssociationNode } from './components/AssociationNode';
import { CustomEdge } from './components/CustomEdge';
import { InheritanceEdge } from './components/InheritanceEdge';
import { UmlClassNode } from './components/UmlClassNode';
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
import { getNodesBounds, getViewportForBounds } from '@xyflow/react';

const nodeTypes: NodeTypes = {
  entityNode: EntityNode,
  associationNode: AssociationNode,
  umlClassNode: UmlClassNode as any, // Bypass TS constraint for custom node for now
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
    loadProject,
    saveHistory,
    undo,
    redo
  } = useStore();

  const { fitView } = useReactFlow();
  const [showMLD, setShowMLD] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const handleSaveProject = async () => {
    try {
      const data = { nodes, edges, entities, associations };
      const json = JSON.stringify(data, null, 2);
      
      const filePath = await save({
        filters: [{ name: 'Projet Looping', extensions: ['looping', 'json'] }]
      });

      if (filePath) {
        await writeTextFile(filePath, json);
        alert('Projet sauvegardé avec succès !');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la sauvegarde du projet.');
    }
  };

  const handleLoadProject = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Projet Looping', extensions: ['looping', 'json'] }]
      });

      if (selected && typeof selected === 'string') {
        const contents = await readTextFile(selected);
        const data = JSON.parse(contents);
        loadProject(data);
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l\'ouverture du projet. Le fichier est peut-être corrompu.');
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'd':
            event.preventDefault();
            duplicateSelectedElement();
            break;
          case 's':
            event.preventDefault();
            handleSaveProject();
            break;
          case 'o':
            event.preventDefault();
            handleLoadProject();
            break;
          case 'z':
            event.preventDefault();
            if (event.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            event.preventDefault();
            redo();
            break;
        }
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedElementId) {
          deleteElement(selectedElementId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, deleteElement, duplicateSelectedElement, nodes, edges, entities, associations, undo, redo]);

  const onPaneClick = useCallback(() => {
    setSelectedElement(null);
  }, [setSelectedElement]);

  const onNodeDragStop = useCallback(() => {
    // Save history after a node has been dragged and dropped to its final position
    saveHistory();
  }, [saveHistory]);

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

  const handleExportImage = async () => {
    if (!reactFlowWrapper.current) return;
    
    try {
      const nodesBounds = getNodesBounds(nodes);
      const viewport = getViewportForBounds(nodesBounds, 1200, 800, 0.5, 2, 0.1);

      const dataUrl = await toPng(reactFlowWrapper.current, {
        backgroundColor: '#f3f4f6',
        width: 1200,
        height: 800,
        style: {
          width: '1200px',
          height: '800px',
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      });

      const filePath = await save({
        filters: [{
          name: 'Image PNG',
          extensions: ['png']
        }]
      });

      if (filePath) {
        await writeTextFile(filePath, dataUrl); 
        alert('Image exportée avec succès !');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l\'exportation de l\'image.');
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-gray-100 text-gray-900 font-sans">
      <Toolbar 
        onExportSQL={handleExportSQL} 
        onImportSQL={handleImportSQL} 
        onExportDictionary={handleExportDictionary}
        onExportImage={handleExportImage}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
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
            onNodeDragStop={onNodeDragStop}
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