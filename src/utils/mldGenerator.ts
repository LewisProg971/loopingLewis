import { Entity, Association, Table, TableColumn, DataType } from '../types';

export const generateMLD = (entities: Record<string, Entity>, associations: Record<string, Association>): Table[] => {
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

  // 2. Process associations
  Object.values(associations).forEach(assoc => {
    // Determine the type of association based on cardinalities
    const roles = assoc.roles;
    if (roles.length !== 2) {
      // Basic implementation: only handle binary associations for MLD/SQL generation
      // Or if it's n-ary, it always becomes a table. Let's assume binary mostly, or force n-ary to table.
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
      // Many-to-Many -> Join table
      createJoinTable(assoc, tables, entities, entityIdToTableName);
    } else if (!isMany1 && isMany2) {
      // One-to-Many
      addForeignKey(role1.entityId, role2.entityId, c1, tables, entities, entityIdToTableName);
    } else if (isMany1 && !isMany2) {
      // Many-to-One
      addForeignKey(role2.entityId, role1.entityId, c2, tables, entities, entityIdToTableName);
    } else {
      // One-to-One
      // Add foreign key to the one with 0,1 if exists, otherwise either one.
      if (c1 === '0,1') {
        addForeignKey(role2.entityId, role1.entityId, c2, tables, entities, entityIdToTableName);
      } else {
        addForeignKey(role1.entityId, role2.entityId, c1, tables, entities, entityIdToTableName);
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

  // Add primary keys of all connected entities as foreign/primary keys
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
          column: pk.name.toLowerCase()
        },
        notNull: true
      });
    }
  });

  // Add association attributes
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
  sourceEntityId: string, // The entity that gets the FK (the "1" side gets the FK in MLD for 1:N? Wait. In 1:N, the table representing the "N" side receives the FK from the "1" side. 
  // Let's re-verify Merise: Entity A (0,1) ----- Assoc ----- (0,n) Entity B. 
  // Entity A gets the foreign key of Entity B.
  // Wait, no. A (0,n) --- (1,1) B => B gets FK of A. The side with max cardinality 1 receives the FK.
  targetEntityId: string, // The entity providing its PK
  sourceCardinality: string, // Cardinality of the side receiving FK
  tables: Table[],
  entities: Record<string, Entity>,
  entityMap: Record<string, string>
) => {
  const sourceTable = tables.find(t => t.name === entityMap[sourceEntityId]);
  const targetEntity = entities[targetEntityId];
  if (!sourceTable || !targetEntity) return;

  const targetPk = targetEntity.attributes.find(a => a.isPrimaryKey);
  if (!targetPk) return;

  const targetTableName = entityMap[targetEntityId];
  
  sourceTable.columns.push({
    name: `${targetTableName}_${targetPk.name.toLowerCase()}`,
    type: mapType(targetPk.type),
    isPrimaryKey: false,
    isForeignKey: true,
    references: {
      table: targetTableName,
      column: targetPk.name.toLowerCase()
    },
    // If cardinality is 1,1 it's not null. If 0,1 it can be null.
    notNull: sourceCardinality === '1,1'
  });
};