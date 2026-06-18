import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from '@xyflow/react';
import { Entity, Association, AssociationRole } from '../types';

export interface AppState {
  nodes: Node[];
  edges: Edge[];
  entities: Record<string, Entity>;
  associations: Record<string, Association>;
  selectedElementId: string | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addEntity: (entity: Entity, position: { x: number, y: number }) => void;
  addAssociation: (association: Association, position: { x: number, y: number }) => void;
  updateEntity: (id: string, entity: Partial<Entity>) => void;
  updateAssociation: (id: string, association: Partial<Association>) => void;
  deleteElement: (id: string) => void;
  setSelectedElement: (id: string | null) => void;
  updateEdgeRole: (edgeId: string, roleUpdate: Partial<AssociationRole>) => void;
  duplicateSelectedElement: () => void;
  autoLayout: () => void;
  loadProject: (data: any) => void;
  
  // History
  past: Pick<AppState, 'nodes' | 'edges' | 'entities' | 'associations'>[];
  future: Pick<AppState, 'nodes' | 'edges' | 'entities' | 'associations'>[];
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  entities: {},
  associations: {},
  selectedElementId: null,
  past: [],
  future: [],

  saveHistory: () => {
    const { nodes, edges, entities, associations, past } = get();
    set({
      past: [...past, { nodes, edges, entities, associations }],
      future: [],
    });
  },

  undo: () => {
    const { past, future, nodes, edges, entities, associations } = get();
    if (past.length === 0) return;
    
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    set({
      past: newPast,
      future: [...future, { nodes, edges, entities, associations }],
      ...previous,
      selectedElementId: null
    });
  },

  redo: () => {
    const { past, future, nodes, edges, entities, associations } = get();
    if (future.length === 0) return;

    const next = future[future.length - 1];
    const newFuture = future.slice(0, future.length - 1);

    set({
      past: [...past, { nodes, edges, entities, associations }],
      future: newFuture,
      ...next,
      selectedElementId: null
    });
  },

  autoLayout: () => {
    get().saveHistory();
    const { nodes } = get();
    const SPACING_X = 250;
    const SPACING_Y = 180;
    const COLUMNS = Math.ceil(Math.sqrt(nodes.length));

    const newNodes = nodes.map((node, index) => {
      const row = Math.floor(index / COLUMNS);
      const col = index % COLUMNS;
      return {
        ...node,
        position: {
          x: col * SPACING_X + 50,
          y: row * SPACING_Y + 50,
        },
      };
    });
    set({ nodes: newNodes });
  },

  duplicateSelectedElement: () => {
    get().saveHistory();
    const { selectedElementId, entities, associations, nodes } = get();
    if (!selectedElementId) return;

    const node = nodes.find(n => n.id === selectedElementId);
    if (!node) return;

    const newId = `${node.id}_copy_${Date.now()}`;
    const newPos = { x: node.position.x + 30, y: node.position.y + 30 };

    if (node.type === 'entityNode') {
      const entity = entities[node.id];
      if (!entity) return;
      const newEntity = { 
        ...entity, 
        id: newId, 
        name: `${entity.name}_copie`,
        attributes: entity.attributes.map(a => ({ ...a, id: `attr_${Date.now()}_${Math.random()}` }))
      };
      get().addEntity(newEntity, newPos);
    } else if (node.type === 'associationNode') {
      const assoc = associations[node.id];
      if (!assoc) return;
      const newAssoc = { 
        ...assoc, 
        id: newId, 
        name: `${assoc.name}_copie`,
        roles: [],
        attributes: (assoc.attributes || []).map(a => ({ ...a, id: `attr_${Date.now()}_${Math.random()}` }))
      };
      get().addAssociation(newAssoc, newPos);
    }
  },

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    get().saveHistory();
    const sourceNode = get().nodes.find(n => n.id === connection.source);
    const targetNode = get().nodes.find(n => n.id === connection.target);

    if (!sourceNode || !targetNode) return;

    const sourceIsEntity = sourceNode.type === 'entityNode';
    const targetIsEntity = targetNode.type === 'entityNode';

    if (sourceIsEntity && targetIsEntity) {
      const edgeId = `inh-${sourceNode.id}-${targetNode.id}`;
      if (get().edges.some(e => e.id === edgeId)) return;

      const newEdge: Edge = {
        id: edgeId,
        source: connection.source,
        target: connection.target,
        type: 'inheritanceEdge',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#1f2937',
        },
      };
      set({ edges: addEdge(newEdge, get().edges) });
      return;
    }

    if (sourceIsEntity === targetIsEntity) return;

    const entityId = sourceIsEntity ? sourceNode.id : targetNode.id;
    const assocId = sourceIsEntity ? targetNode.id : sourceNode.id;
    
    const exists = get().edges.some(e => 
      (e.source === sourceNode.id && e.target === targetNode.id) ||
      (e.source === targetNode.id && e.target === sourceNode.id)
    );

    if (exists) return;

    const newEdge: Edge = {
      id: `e-${sourceNode.id}-${targetNode.id}`,
      source: connection.source,
      target: connection.target,
      label: '0,n',
      type: 'customEdge',
      data: { cardinality: '0,n', isRelative: false }
    };

    set({ edges: addEdge(newEdge, get().edges) });
    
    const assoc = get().associations[assocId];
    if (assoc) {
      set({
        associations: {
          ...get().associations,
          [assocId]: {
            ...assoc,
            roles: [...assoc.roles, { entityId, cardinality: '0,n', isRelative: false }]
          }
        }
      });
    }
  },

  addEntity: (entity, position) => {
    get().saveHistory();
    const newNode: Node = {
      id: entity.id,
      type: 'entityNode',
      position,
      data: { entity },
    };
    set(state => ({
      nodes: [...state.nodes, newNode],
      entities: { ...state.entities, [entity.id]: entity }
    }));
  },

  addAssociation: (association, position) => {
    get().saveHistory();
    const newNode: Node = {
      id: association.id,
      type: 'associationNode',
      position,
      data: { association },
    };
    set(state => ({
      nodes: [...state.nodes, newNode],
      associations: { ...state.associations, [association.id]: association }
    }));
  },

  updateEntity: (id, updatedFields) => {
    get().saveHistory();
    set(state => {
      const entity = { ...state.entities[id], ...updatedFields };
      return {
        entities: { ...state.entities, [id]: entity },
        nodes: state.nodes.map(n => 
          n.id === id ? { ...n, data: { ...n.data, entity } } : n
        )
      };
    });
  },

  updateAssociation: (id, updatedFields) => {
    get().saveHistory();
    set(state => {
      const assoc = { ...state.associations[id], ...updatedFields };
      return {
        associations: { ...state.associations, [id]: assoc },
        nodes: state.nodes.map(n => 
          n.id === id ? { ...n, data: { ...n.data, association: assoc } } : n
        )
      };
    });
  },

  deleteElement: (id) => {
    get().saveHistory();
    set(state => {
      const newEntities = { ...state.entities };
      const newAssociations = { ...state.associations };
      delete newEntities[id];
      delete newAssociations[id];
      
      return {
        nodes: state.nodes.filter(n => n.id !== id),
        edges: state.edges.filter(e => e.source !== id && e.target !== id),
        entities: newEntities,
        associations: newAssociations,
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
      };
    });
  },

  setSelectedElement: (id) => {
    set({ selectedElementId: id });
  },

  updateEdgeRole: (edgeId, roleUpdate) => {
    get().saveHistory();
    set(state => {
      const edge = state.edges.find(e => e.id === edgeId);
      if (!edge) return state;

      const newData = { ...edge.data, ...roleUpdate };
      let label = (newData.cardinality || edge.label) as string;
      if (newData.isRelative) {
        label = `(${label})`;
      }

      const newEdges = state.edges.map(e => 
        e.id === edgeId ? { ...e, label, data: newData } : e
      );

      const sourceNode = state.nodes.find(n => n.id === edge.source);
      const targetNode = state.nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const sourceIsEntity = sourceNode.type === 'entityNode';
        const entityId = sourceIsEntity ? sourceNode.id : targetNode.id;
        const assocId = sourceIsEntity ? targetNode.id : sourceNode.id;

        const assoc = state.associations[assocId];
        if (assoc) {
          const newRoles = assoc.roles.map(r => 
            r.entityId === entityId ? { ...r, ...roleUpdate } : r
          );
          const newAssoc = { ...assoc, roles: newRoles };
          return {
            edges: newEdges,
            associations: { ...state.associations, [assocId]: newAssoc },
            nodes: state.nodes.map(n => 
              n.id === assocId ? { ...n, data: { ...n.data, association: newAssoc } } : n
            )
          };
        }
      }
      return { edges: newEdges };
    });
  },

  loadProject: (data) => {
    set({
      nodes: data.nodes || [],
      edges: data.edges || [],
      entities: data.entities || {},
      associations: data.associations || {},
      selectedElementId: null
    });
  }
}));