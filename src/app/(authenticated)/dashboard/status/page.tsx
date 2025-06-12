'use client'

import { useState, useMemo } from 'react'
import { getProjects, updateProject, deleteProject } from './action'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
 
} from "@/components/ui/select"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

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
  clientemail:string
}
// User opens the table – triggers getProjects(...) via useQuery
// User edits/deletes a project via action buttons.
//on success Triggers refetch() to update table
function ProjectTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
//refetch is used to refresh the data after edit and delete
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['projects', pagination],  //It tells React Query: “If these values change, run the fetch again.”
    queryFn: () => getProjects(pagination.pageIndex + 1, pagination.pageSize), 
  })

  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: 'name',  //how to get value
        header: 'Name', //what to display
      },
      {
        accessorKey: 'budget',
        header: 'Budget',
        cell: ({ row }) => `$${row.original.budget}`,   //how to render it 
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
      },
      {
        accessorKey: 'clientName',
        header: 'Client',
      },
      {
        accessorKey: 'clientemail',
        header: 'Client Email',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <TableActions project={row.original} onUpdate={refetch} />,
      },
    ],
    [refetch]
  )

  const table = useReactTable({
    data: data?.projects ?? [],   //data comes from backend using react query
    columns,
    pageCount: data?.pageCount ?? -1,
    state: {
      pagination,
    },
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
              {[1,10, 20, 30, 40, 50].map((pageSize) => (   // display data according to row size 
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
function TableActions({ project, onUpdate }: { project: Project; onUpdate: () => void }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()

  //delete project
  const handleDelete = async () => {
    try {
      const response = await deleteProject(project.id)
      if (response.success) {
        toast({
          title: "Success!",
          description: "Project deleted successfully.",
        })
        onUpdate()
      } else {
        toast({
          variant: "destructive",
          title: "Error!",
          description: response.error || 'Failed to delete project.',
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

  // edit project
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      budget: Number(formData.get('budget')),
      status: formData.get('status') as string,
      clientName: formData.get('clientName') as string,
         clientemail: formData.get('clientemail') as string,
    }

    try {
      const response = await updateProject(project.id, data)
      if (response.success) {
        toast({
          title: "Success!",
          description: "Project updated successfully.",
        })
        setIsEditDialogOpen(false)
        onUpdate()
      } else {
        toast({
          variant: "destructive",
          title: "Error!",
          description: response.error || 'Failed to update project.',
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
      {  project.status !== "cancelled" && (
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:text-blue-600"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Edit project details for {project.name}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4 mt-4" onSubmit={handleEditSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={project.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                defaultValue={project.budget}
                required
              />
            </div>
              <div className="space-y-2">
              <Label htmlFor="budget">Email</Label>
              <Input
                id="clientemail"
                name="clientemail"
                defaultValue={project.clientemail}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={project.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                name="clientName"
                defaultValue={project.clientName}
                required
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Project</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {project.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                await handleDelete()
                setIsDeleteDialogOpen(false)
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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

//React Query handles fetching, caching, updating, and syncing your data from APIs automatically.
