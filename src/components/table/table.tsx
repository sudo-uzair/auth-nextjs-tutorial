// components/table/table.tsx
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { flexRender } from "@tanstack/react-table"

import { Table as ReactTable, ColumnDef, } from "@tanstack/react-table";

interface TableComponentProps<TData> {
  table: ReactTable<TData>;
  columns: ColumnDef<TData, unknown>[];
  isLoading: boolean;

}

export default function TableComponent<TData>({ table, columns, isLoading, }: TableComponentProps<TData>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-4">
<div className="flex items-center justify-center">
                <div className=" w-10 h-10 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
</div>       
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-4">
                No records found
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
