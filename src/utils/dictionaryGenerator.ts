import { Entity, Association } from '../types';

export const generateDataDictionary = (
  entities: Record<string, Entity>,
  associations: Record<string, Association>
): string => {
  let md = '# Dictionnaire de Données\n\n';

  // Entities Section
  md += '## 1. Entités\n\n';
  Object.values(entities).forEach(entity => {
    md += `### ${entity.name}\n\n`;
    md += '| Attribut | Type | PK | Description |\n';
    md += '| :--- | :--- | :---: | :--- |\n';
    entity.attributes.forEach(attr => {
      md += `| ${attr.name} | ${attr.type}${attr.length ? `(${attr.length})` : ''} | ${attr.isPrimaryKey ? 'Oui' : 'Non'} | - |\n`;
    });
    md += '\n';
  });

  // Associations Section
  md += '## 2. Associations\n\n';
  Object.values(associations).forEach(assoc => {
    md += `### ${assoc.name}\n\n`;
    
    // Roles
    md += '**Rôles :**\n';
    assoc.roles.forEach(role => {
      const targetEntity = entities[role.entityId];
      md += `- Lier à **${targetEntity?.name || 'Inconnue'}** avec cardinalité **${role.cardinality}**${role.isRelative ? ' (Relatif)' : ''}\n`;
    });
    md += '\n';

    // Attributes (if any)
    if (assoc.attributes && assoc.attributes.length > 0) {
      md += '| Attribut | Type | PK | Description |\n';
      md += '| :--- | :--- | :---: | :--- |\n';
      assoc.attributes.forEach(attr => {
        md += `| ${attr.name} | ${attr.type}${attr.length ? `(${attr.length})` : ''} | ${attr.isPrimaryKey ? 'Oui' : 'Non'} | - |\n`;
      });
      md += '\n';
    }
  });

  return md;
};