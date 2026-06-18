import { Entity, Association, Table, TableColumn, DataType, AssociationRole } from '../types';
import { Edge } from '@xyflow/react';

export const generateMLD = (
  entities: Record<string, Entity>, 
  associations: Record<string, Association>,
  edges: Edge[] = []
): Table[] => {
  const tables: Table[] = [];
  const entityIdToTableName: Record<string, string> = {};

  // 1. Every entity becomes a table
  Object.values(entities).forEach(entity => {
    const tableName = entity.name.replace(/\s+/g, '_').toLowerCase();
    entityIdToTableName[entity.id] = tableName;

    const columns: TableColumn[] = entity.attributes.map(attr => ({
      name: attr.name.replace(/\s+/g, '_').toLowerCase(),
      type: mapType(attr.type),
      isPrimaryKey: attr.isPrimaryKey,
      isForeignKey: false,
      notNull: attr.isPrimaryKey // primary keys are always not null
    }));

    tables.push({
      name: tableName,
      columns
    });
  });

  // 2. Process Inheritance
  edges.forEach(edge => {
    if (edge.type === 'inheritanceEdge') {
      const childId = edge.source;
      const parentId = edge.target;
      const childTable = tables.find(t => t.name === entityIdToTableName[childId]);
      const parentEntity = entities[parentId];

      if (childTable && parentEntity) {
        const parentPk = parentEntity.attributes.find(a => a.isPrimaryKey);
        if (parentPk) {
          // In Merise, child PK is often the parent PK (PK + FK)
          // Let's check if child already has a PK. If so, parent PK becomes just an FK.
          // Standard: Child PK = Parent PK.
          const existingPk = childTable.columns.find(c => c.isPrimaryKey);
          
          childTable.columns.push({
            name: `${entityIdToTableName[parentId]}_${parentPk.name.toLowerCase()}`,
            type: mapType(parentPk.type),
            isPrimaryKey: !existingPk, // If no PK yet, this is it
            isForeignKey: true,
            references: {
              table: entityIdToTableName[parentId],
              column: parentPk.name.toLowerCase(),
              onDelete: 'CASCADE'
            },
            notNull: true
          });
        }
      }
    }
  });

  // 3. Process associations
  Object.values(associations).forEach(assoc => {
    const roles = assoc.roles;
    if (roles.length !== 2) {
      if (roles.length > 2) {
        createJoinTable(assoc, tables, entities, entityIdToTableName);
      }
      return;
    }

    const [role1, role2] = roles;
    const c1 = role1.cardinality;
    const c2 = role2.cardinality;

    const isMany1 = c1.endsWith('n');
    const isMany2 = c2.endsWith('n');

    if (isMany1 && isMany2) {
      createJoinTable(assoc, tables, entities, entityIdToTableName);
    } else if (!isMany1 && isMany2) {
      addForeignKey(role1, role2.entityId, tables, entities, entityIdToTableName);
    } else if (isMany1 && !isMany2) {
      addForeignKey(role2, role1.entityId, tables, entities, entityIdToTableName);
    } else {
      if (c1 === '0,1') {
        addForeignKey(role2, role1.entityId, tables, entities, entityIdToTableName);
      } else {
        addForeignKey(role1, role2.entityId, tables, entities, entityIdToTableName);
      }
    }
  });

  return tables;
};

const mapType = (type: DataType): string => {
  switch (type) {
    case 'INT': return 'INT';
    case 'VARCHAR': return 'VARCHAR(255)';
    case 'DATE': return 'DATE';
    case 'BOOLEAN': return 'BOOLEAN';
    case 'DECIMAL': return 'DECIMAL(10,2)';
    case 'TEXT': return 'TEXT';
    default: return 'VARCHAR(255)';
  }
};

const createJoinTable = (assoc: Association, tables: Table[], entities: Record<string, Entity>, entityMap: Record<string, string>) => {
  const tableName = assoc.name.replace(/\s+/g, '_').toLowerCase();
  const columns: TableColumn[] = [];

  assoc.roles.forEach(role => {
    const entity = entities[role.entityId];
    if (!entity) return;
    const refTableName = entityMap[entity.id];
    
    const pk = entity.attributes.find(a => a.isPrimaryKey);
    if (pk) {
      columns.push({
        name: `${refTableName}_${pk.name.toLowerCase()}`,
        type: mapType(pk.type),
        isPrimaryKey: true,
        isForeignKey: true,
        references: {
          table: refTableName,
          column: pk.name.toLowerCase(),
          onDelete: 'CASCADE'
        },
        notNull: true
      });
    }
  });

  assoc.attributes.forEach(attr => {
    columns.push({
      name: attr.name.toLowerCase(),
      type: mapType(attr.type),
      isPrimaryKey: attr.isPrimaryKey,
      isForeignKey: false,
      notNull: attr.isPrimaryKey
    });
  });

  tables.push({ name: tableName, columns });
};

const addForeignKey = (
  sourceRole: AssociationRole, // The role receiving the FK
  targetEntityId: string, // The entity providing its PK
  tables: Table[],
  entities: Record<string, Entity>,
  entityMap: Record<string, string>
) => {
  const sourceTable = tables.find(t => t.name === entityMap[sourceRole.entityId]);
  const targetEntity = entities[targetEntityId];
  if (!sourceTable || !targetEntity) return;

  const targetPk = targetEntity.attributes.find(a => a.isPrimaryKey);
  if (!targetPk) return;

  const targetTableName = entityMap[targetEntityId];
  
  sourceTable.columns.push({
    name: `${targetTableName}_${targetPk.name.toLowerCase()}`,
    type: mapType(targetPk.type),
    isPrimaryKey: sourceRole.isRelative || false, // IF RELATIVE, IT'S PART OF PK
    isForeignKey: true,
    references: {
      table: targetTableName,
      column: targetPk.name.toLowerCase(),
      onDelete: 'RESTRICT'
    },
    notNull: Boolean(sourceRole.cardinality === '1,1' || sourceRole.isRelative)
  });
};