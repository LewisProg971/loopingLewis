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
        let fkDef = `  FOREIGN KEY (${col.name}) REFERENCES ${col.references.table}(${col.references.column})`;
        if (col.references.onDelete) {
          fkDef += ` ON DELETE ${col.references.onDelete}`;
        }
        foreignKeys.push(fkDef);
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
  const normalizedType = type.toUpperCase();

  if (dialect === 'postgresql') {
    if (normalizedType === 'INT') return 'INTEGER';
    if (normalizedType === 'BOOLEAN') return 'BOOLEAN';
    if (normalizedType === 'DATETIME') return 'TIMESTAMP';
    if (normalizedType === 'TEXT') return 'TEXT';
    return normalizedType;
  }

  if (dialect === 'sqlite') {
    if (normalizedType === 'INT') return 'INTEGER';
    if (normalizedType === 'BOOLEAN') return 'INTEGER'; // 0 or 1
    if (normalizedType === 'DECIMAL') return 'REAL';
    if (normalizedType === 'DATE') return 'TEXT'; // ISO8601 strings
    return normalizedType;
  }

  // MySQL / Default
  if (normalizedType === 'BOOLEAN') return 'TINYINT(1)';
  if (normalizedType === 'TEXT') return 'LONGTEXT';
  return normalizedType;
};