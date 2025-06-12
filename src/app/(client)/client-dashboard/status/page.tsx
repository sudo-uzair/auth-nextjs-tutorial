'use client'

import { useState, useMemo } from 'react'
import { getProjects, cancelProject } from './action'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"


const queryClient = new QueryClient()

type Project = {
  id: string
  name: string
  budget: number
  status: string
  clientName: string
  user: {
    email: string
  },
  clientemail: string
}

function ProjectTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['projects', pagination],
    queryFn: () => getProjects(pagination.pageIndex + 1, pagination.pageSize),
  })

const columns = useMemo<ColumnDef<Project>[]>(() => {
  const baseColumns: ColumnDef<Project>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'budget',
      header: 'Budget',
      cell: ({ row }) => `$${row.original.budget}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`capitalize px-2 py-1 rounded-full text-xs ${
          row.original.status === 'completed' ? 'bg-green-100 text-green-800' :
          row.original.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
          row.original.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.original.status}
        </span>
      ),
    }
  ]

  const hasCancellable = (data?.projects ?? []).some(//This line checks if any project in data.projects has a status of "Not Started":
    project => project.status === "Not Started"
  )

  if (hasCancellable) {
    baseColumns.push({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) =>
        row.original.status === "Not Started" ? (
          <TableActions project={row.original} onUpdate={refetch} />
        ) : null,
    })
  }

  return baseColumns
}, [data?.projects, refetch])


  const table = useReactTable({
    data: data?.projects ?? [],
    columns,
    pageCount: data?.pageCount ?? -1,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Project Status</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* handle pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </Button>
          <span className="flex items-center gap-1">
            Page
            <strong>
              {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </strong>
          </span>
        </div>

        {/* row per page  */}
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent>
              {[1, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-2 text-sm text-gray-500">
        Showing {table.getRowModel().rows.length} of {data?.rowCount ?? 0} rows
      </div>
    </div>
  )
}

// TableActions component
function TableActions({ project, onUpdate }: { project: Project; onUpdate: () => void }) {
  const { toast } = useToast()
  const handleCancel = async () => {
    try {
      const response = await cancelProject(project.id)
      if (response.success) {
        toast({
          title: "Cancelled!",
          description: "Project cancelled successfully.",
        })
        onUpdate()
      } else {
        toast({
          variant: "destructive",
          title: "Error!",
          description: response.error || 'Failed to cancel project.',
        })
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error!",
        description: 'An unexpected error occurred.',
      })
    }
  }
  return (
    <div className="flex gap-2">
      {project.status === "Not Started" && (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      )}
    </div>
  )
}

export default function StatusPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectTable />
    </QueryClientProvider>
  )
}