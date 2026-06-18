export type DataType = 'INT' | 'VARCHAR' | 'DATE' | 'BOOLEAN' | 'DECIMAL' | 'TEXT';

export interface Attribute {
  id: string;
  name: string;
  type: DataType;
  isPrimaryKey: boolean;
  length?: number; // for VARCHAR
}

export interface Entity {
  id: string;
  name: string;
  attributes: Attribute[];
}

export type Cardinality = '0,1' | '1,1' | '0,n' | '1,n';

export interface AssociationRole {
  entityId: string;
  cardinality: Cardinality;
  roleName?: string;
  isRelative?: boolean;
}

export interface Association {
  id: string;
  name: string;
  roles: AssociationRole[];
  attributes: Attribute[]; // associations can have attributes in Merise
}

// React Flow node types wrappers
export type NodeType = 'entity' | 'association';

// MLD Types
export interface TableColumn {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  references?: {
    table: string;
    column: string;
  };
  notNull: boolean;
}

export interface Table {
  name: string;
  columns: TableColumn[];
}
