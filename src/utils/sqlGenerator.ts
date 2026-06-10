import { Table } from '../types';

export type SqlDialect = 'mysql' | 'postgresql' | 'sqlite';

export const generateSQL = (tables: Table[], dialect: SqlDialect = 'mysql'): string => {
  let sql = '';

  tables.forEach(table => {
    sql += `CREATE TABLE ${table.name} (\n`;

    const columnDefs: string[] = [];
    const primaryKeys: string[] = [];
    const foreignKeys: string[] = [];

    table.columns.forEach(col => {
      let colDef = `  ${col.name} ${mapSqlType(col.type, dialect)}`;
      
      if (col.notNull) {
        colDef += ' NOT NULL';
      }

      columnDefs.push(colDef);

      if (col.isPrimaryKey) {
        primaryKeys.push(col.name);
      }

      if (col.isForeignKey && col.references) {
        foreignKeys.push(`  FOREIGN KEY (${col.name}) REFERENCES ${col.references.table}(${col.references.column})`);
      }
    });

    if (primaryKeys.length > 0) {
      columnDefs.push(`  PRIMARY KEY (${primaryKeys.join(', ')})`);
    }

    columnDefs.push(...foreignKeys);

    sql += columnDefs.join(',\n');
    sql += '\n);\n\n';
  });

  return sql;
};

const mapSqlType = (type: string, dialect: SqlDialect): string => {
  // Simple mapping, can be extended based on exact dialect needs
  if (dialect === 'postgresql') {
    if (type === 'INT') return 'INTEGER';
    if (type.startsWith('VARCHAR')) return type;
  }
  if (dialect === 'sqlite') {
    if (type === 'INT') return 'INTEGER';
    if (type === 'BOOLEAN') return 'INTEGER'; // SQLite doesn't have strict boolean
  }
  return type;
};