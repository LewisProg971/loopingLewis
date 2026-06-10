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
  updateEdgeCardinality: (edgeId: string, cardinality: string) => void;
  loadProject: (data: any) => void;
}

export const useStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  entities: {},
  associations: {},
  selectedElementId: null,

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
    // Only allow connection between Entity and Association
    const sourceNode = get().nodes.find(n => n.id === connection.source);
    const targetNode = get().nodes.find(n => n.id === connection.target);

    if (!sourceNode || !targetNode) return;

    const sourceIsEntity = sourceNode.type === 'entityNode';
    const targetIsEntity = targetNode.type === 'entityNode';

    if (sourceIsEntity === targetIsEntity) {
      // Cannot connect entity to entity or assoc to assoc directly in basic Merise
      return;
    }

    const entityId = sourceIsEntity ? sourceNode.id : targetNode.id;
    const assocId = sourceIsEntity ? targetNode.id : sourceNode.id;
    
    // Check if relation already exists
    const exists = get().edges.some(e => 
      (e.source === sourceNode.id && e.target === targetNode.id) ||
      (e.source === targetNode.id && e.target === sourceNode.id)
    );

    if (exists) return;

    // Default cardinality
    const newEdge: Edge = {
      id: `e-${sourceNode.id}-${targetNode.id}`,
      source: connection.source,
      target: connection.target,
      label: '0,n',
      type: 'customEdge',
      data: { cardinality: '0,n' }
    };

    set({
      edges: addEdge(newEdge, get().edges),
    });
    
    // Also update association roles
    const assoc = get().associations[assocId];
    if (assoc) {
      set({
        associations: {
          ...get().associations,
          [assocId]: {
            ...assoc,
            roles: [...assoc.roles, { entityId, cardinality: '0,n' }]
          }
        }
      });
    }
  },

  addEntity: (entity, position) => {
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

  updateEdgeCardinality: (edgeId, cardinality) => {
    set(state => {
      const edge = state.edges.find(e => e.id === edgeId);
      if (!edge) return state;

      const newEdges = state.edges.map(e => 
        e.id === edgeId ? { ...e, label: cardinality, data: { ...e.data, cardinality } } : e
      );

      // We also need to update the association role
      const sourceNode = state.nodes.find(n => n.id === edge.source);
      const targetNode = state.nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const sourceIsEntity = sourceNode.type === 'entityNode';
        const entityId = sourceIsEntity ? sourceNode.id : targetNode.id;
        const assocId = sourceIsEntity ? targetNode.id : sourceNode.id;

        const assoc = state.associations[assocId];
        if (assoc) {
          const newRoles = assoc.roles.map(r => 
            r.entityId === entityId ? { ...r, cardinality: cardinality as any } : r
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