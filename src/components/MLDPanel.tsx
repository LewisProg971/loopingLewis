import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { generateMLD } from '../utils/mldGenerator';
import { X } from 'lucide-react';

export const MLDPanel = ({ onClose }: { onClose: () => void }) => {
  const { entities, associations, edges } = useStore();

  const mldTables = useMemo(() => {
    return generateMLD(entities, associations, edges);
  }, [entities, associations, edges]);

  return (
    <div className="w-80 bg-indigo-50 border-l border-indigo-200 p-4 flex flex-col h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg text-indigo-900">Modèle Logique (MLD)</h2>
        <button onClick={onClose} className="text-indigo-500 hover:bg-indigo-100 p-1 rounded">
          <X size={18} />
        </button>
      </div>
      
      {mldTables.length === 0 ? (
        <p className="text-sm text-indigo-700 italic">Aucune table générée.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {mldTables.map((table, i) => (
            <div key={i} className="bg-white border border-indigo-200 rounded shadow-sm overflow-hidden">
              <div className="bg-indigo-100 font-bold text-indigo-900 text-sm px-3 py-1 border-b border-indigo-200">
                {table.name}
              </div>
              <div className="p-2 text-xs flex flex-col gap-1">
                {table.columns.map((col, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className={`${col.isPrimaryKey ? 'font-bold underline text-indigo-800' : 'text-gray-700'} ${col.isForeignKey ? 'italic' : ''}`}>
                        {col.name}
                      </span>
                      {col.isPrimaryKey && <span className="text-[10px] text-yellow-600 font-bold ml-1" title="Primary Key">PK</span>}
                      {col.isForeignKey && <span className="text-[10px] text-blue-600 font-bold ml-1" title={`Foreign Key -> ${col.references?.table}(${col.references?.column})`}>FK</span>}
                    </div>
                    <span className="text-gray-400">{col.type}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};