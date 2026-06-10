import { Entity, Association, Attribute, DataType, AssociationRole } from '../types';

export const parseSQL = (sql: string) => {
  const entities: Record<string, Entity> = {};
  const associations: Record<string, Association> = {};

  // Simplistic regex parser
  const tableRegex = /CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi;
  let match;

  while ((match = tableRegex.exec(sql)) !== null) {
    const tableName = match[1];
    const columnsText = match[2];

    const entityId = `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const attributes: Attribute[] = [];
    const foreignKeys: { colName: string, refTable: string }[] = [];
    let isJoinTable = false; // heuristics: mostly foreign keys

    const lines = columnsText.split(',').map(l => l.trim()).filter(l => l.length > 0);
    
    let primaryKeyNames: string[] = [];

    // First pass: find explicit primary keys and foreign keys
    lines.forEach(line => {
      const pkMatch = /PRIMARY\s+KEY\s*\(([^)]+)\)/i.exec(line);
      if (pkMatch) {
        primaryKeyNames = pkMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
      }

      const fkMatch = /FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+(\w+)\s*\(/i.exec(line);
      if (fkMatch) {
        foreignKeys.push({
          colName: fkMatch[1].trim().replace(/['"]/g, ''),
          refTable: fkMatch[2].trim()
        });
      }
    });

    // Second pass: process columns
    lines.forEach(line => {
      // Ignore constraint lines
      if (/^(PRIMARY\s+KEY|FOREIGN\s+KEY|CONSTRAINT)/i.test(line)) return;

      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const name = parts[0].replace(/['"]/g, '');
        const typeStr = parts[1].toUpperCase();
        
        // Is it a primary key inline?
        let isPk = primaryKeyNames.includes(name) || /PRIMARY\s+KEY/i.test(line);

        attributes.push({
          id: `attr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name,
          type: typeStr.includes('INT') ? 'INT' : typeStr.includes('DATE') ? 'DATE' : typeStr.includes('BOOL') ? 'BOOLEAN' : 'VARCHAR', // Simple mapping
          isPrimaryKey: isPk
        });
      }
    });

    // Heuristics: if table has 2+ foreign keys and all its PKs are FKs, it's likely an association
    if (foreignKeys.length >= 2) {
      isJoinTable = true;
      // In a real scenario, we check if PKs match FKs exactly to be sure it's a pure join table.
    }

    if (!isJoinTable) {
      entities[entityId] = {
        id: entityId,
        name: tableName,
        attributes
      };
    } else {
      const assocId = `assoc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      associations[assocId] = {
        id: assocId,
        name: tableName,
        roles: foreignKeys.map(fk => ({
          entityId: fk.refTable, // Note: this is still the table name, needs resolution
          cardinality: '0,n' as const
        })),
        attributes: attributes.filter(a => !foreignKeys.some(fk => fk.colName === a.name))
      };
    }
  }

  // Post process: resolve table names to actual entity IDs in associations
  const finalAssociations = { ...associations };
  Object.values(finalAssociations).forEach(assoc => {
    assoc.roles.forEach(role => {
      // Find the entity that has this name
      const targetEntity = Object.values(entities).find(e => e.name === role.entityId);
      if (targetEntity) {
        role.entityId = targetEntity.id;
      }
    });
  });

  return { entities, associations: finalAssociations };
};