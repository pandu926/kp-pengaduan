"use client";

import { TableColumn } from "@/lib/types";

interface TableProps {
  columns: TableColumn[];
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (id: number) => void;
}

const Table = ({ columns, data = [], onEdit, onDelete }: TableProps) => {
  return (
    <div className="overflow-x-auto">
      {/* Desktop Table */}
      <table className="hidden md:table w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="text-left p-4 font-medium text-gray-600"
              >
                {column.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="text-left p-4 font-medium text-gray-600">Aksi</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                className="text-center p-6 text-gray-500"
              >
                Data tidak tersedia
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.id || index} className="border-b hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="p-4 text-gray-800">
                    {column.render
                      ? column.render(item[column.key], item)
                      : item[column.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="p-4">
                    <div className="flex space-x-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item.id)}
                          className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Mobile Version */}
      <div className="md:hidden space-y-4">
        {data.length === 0 ? (
          <div className="text-center text-gray-500">Data tidak tersedia</div>
        ) : (
          data.map((item, index) => (
            <div
              key={item.id || index}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              {columns.map((column) => (
                <div key={column.key} className="mb-2">
                  <div className="text-xs text-gray-500">{column.label}</div>
                  <div className="text-sm text-gray-900">
                    {column.render
                      ? column.render(item[column.key], item)
                      : item[column.key]}
                  </div>
                </div>
              ))}
              {(onEdit || onDelete) && (
                <div className="mt-3 flex space-x-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item.id)}
                      className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Table;
