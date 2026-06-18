import { Entity, Association, AssociationRole } from '../types';
import { Edge } from '@xyflow/react';

export interface ValidationMessage {
  id: string;
  type: 'error' | 'warning';
  text: string;
  elementId: string;
}

export const validateMCD = (
  entities: Record<string, Entity>,
  associations: Record<string, Association>,
  edges: Edge[]
): ValidationMessage[] => {
  const messages: ValidationMessage[] = [];

  // Check Entities
  Object.values(entities).forEach(entity => {
    // 1. Missing Primary Key
    const hasPK = entity.attributes.some(attr => attr.isPrimaryKey);
    if (!hasPK) {
      messages.push({
        id: `pk-${entity.id}`,
        type: 'error',
        text: `L'entité "${entity.name}" n'a pas de clé primaire.`,
        elementId: entity.id
      });
    }

    // 2. Isolated Entity
    const isConnected = edges.some(edge => edge.source === entity.id || edge.target === entity.id);
    if (!isConnected) {
      messages.push({
        id: `iso-${entity.id}`,
        type: 'warning',
        text: `L'entité "${entity.name}" est isolée (aucun lien).`,
        elementId: entity.id
      });
    }
  });

  // Check Associations
  Object.values(associations).forEach(assoc => {
    // 3. Minimum roles
    if (assoc.roles.length < 2) {
      messages.push({
        id: `role-${assoc.id}`,
        type: 'error',
        text: `L'association "${assoc.name}" doit avoir au moins 2 rôles.`,
        elementId: assoc.id
      });
    }

    // 4. Multiple 1,1 roles (possible but often a sign of bad design if not 1-1)
    const oneOneRoles = assoc.roles.filter(r => r.cardinality === '1,1');
    if (oneOneRoles.length > 1 && assoc.roles.length === 2) {
      messages.push({
        id: `oneone-${assoc.id}`,
        type: 'warning',
        text: `L'association "${assoc.name}" lie deux entités par (1,1). Vérifiez si elles ne devraient pas être fusionnées ou s'il s'agit d'un héritage.`,
        elementId: assoc.id
      });
    }
  });

  return messages;
};