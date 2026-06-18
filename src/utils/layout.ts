import { Node } from '@xyflow/react';

export const organizeNodes = (nodes: Node[]): Node[] => {
  const SPACING_X = 250;
  const SPACING_Y = 150;
  const COLUMNS = Math.ceil(Math.sqrt(nodes.length));

  return nodes.map((node, index) => {
    const row = Math.floor(index / COLUMNS);
    const col = index % COLUMNS;

    return {
      ...node,
      position: {
        x: col * SPACING_X + 50,
        y: row * SPACING_Y + 50,
      },
    };
  });
};