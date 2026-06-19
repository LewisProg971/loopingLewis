export type DataType = 'INT' | 'VARCHAR' | 'DATE' | 'BOOLEAN' | 'DECIMAL' | 'TEXT';

export type Visibility = '+' | '-' | '#';
export type DiagramMode = 'merise' | 'uml';

export interface Attribute {
  id: string;
  name: string;
  type: DataType;
  isPrimaryKey: boolean;
  length?: number;
  visibility?: Visibility; // Added for UML support
}

export interface MethodArg {
  id: string;
  name: string;
  type: string;
}

export interface UMLMethod {
  id: string;
  visibility: Visibility;
  name: string;
  returnType: string;
  args: MethodArg[];
}

export interface Entity {
  id: string;
  name: string;
  attributes: Attribute[];
}

export interface UMLClass {
  id: string;
  name: string;
  isAbstract?: boolean;
  attributes: Attribute[];
  methods: UMLMethod[];
}

export type Cardinality = '0,1' | '1,1' | '0,n' | '1,n';
export type UMLMultiplicity = '1' | '0..1' | '*' | '0..*' | '1..*';
export type UMLLinkType = 'association' | 'inheritance' | 'aggregation' | 'composition';

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
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
  };
  notNull: boolean;
}

export interface Table {
  name: string;
  columns: TableColumn[];
}
