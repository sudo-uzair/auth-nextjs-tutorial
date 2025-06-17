'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getProjects,updateProject,deleteProject } from './action'
import { DateTime } from 'luxon'
import { Calendar } from "@/components/ui/calendar"
import TableComponent from '@/components/table/table'
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type PaginationState,
} from '@tanstack/react-table'

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
  createdAt: string | number | Date
  id: string
  name: string
  budget: number
  status: string
  clientName: string
  user: {
    email: string
  }
  clientemail: string
}

function ProjectTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
 const [startDate, setStartDate] = useState<Date | undefined>(undefined)
const [endDate, setEndDate] = useState<Date | undefined>(undefined)
const [showStartCalendar, setShowStartCalendar] = useState(false)
const [showEndCalendar, setShowEndCalendar] = useState(false)
const [appliedFilters, setAppliedFilters] = useState({
  status: 'all',
  startDate: undefined as Date | undefined,
  endDate: undefined as Date | undefined,
})


  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    },1000)

    return () => {
      clearTimeout(timerId)
    }
  }, [searchTerm])
const handleApplyFilters = () => {
  setAppliedFilters({
    status: statusFilter,
    startDate,
    endDate,
  })
  console.log('Applied Filters:', {
    status: statusFilter,
    startDate,
    endDate,
  })
}
const handleResetFilters = () => {
  setSearchTerm("")
  setStatusFilter('all')
  setStartDate(undefined)
  setEndDate(undefined)
  setAppliedFilters({
    status: 'all',
    startDate: undefined,
    endDate: undefined,
  })
}

//get projects using react-query
const { data, isLoading, isError, refetch } = useQuery({
  queryKey: ['projects', pagination, debouncedSearchTerm, appliedFilters],
  queryFn: () =>
    getProjects(
      pagination.pageIndex + 1,
      pagination.pageSize,
      debouncedSearchTerm,
      appliedFilters.status,
      appliedFilters.startDate,
      appliedFilters.endDate
    ),
})


  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'budget',
        header: 'Budget',
        cell: ({ row }) => `$${row.original.budget.toLocaleString()}`,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span className={`capitalize px-2 py-1 rounded-full text-xs ${
            row.original.status === 'completed' ? 'bg-green-100 text-green-800' :
            row.original.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
            row.original.status === 'cancelled' ? 'bg-red-100 text-red-800' :

            'bg-gray-100 text-gray-800'
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
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt)
          return (
            <span className="text-sm text-gray-600">
              {DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED)}
            </span>
          )
        }
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
    data: data?.projects ?? [],
    columns,
    pageCount: data?.pageCount ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })
  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load projects. Please try again.
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Project Status</h1>
      
      {/* Filter Controls */}
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          className="w-64"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>

          </SelectContent>
        </Select>
     <div className="flex gap-4 mb-4"> 
  <div className="relative">
    <Button
      variant="outline"
      onClick={() => {
        setShowStartCalendar((v) => {
          if (!v) setShowEndCalendar(false)
          return !v
        })
      }}
      className="w-[130px] justify-start"
    >
      {startDate ? startDate.toLocaleDateString() : "Start Date"}
    </Button>
    {showStartCalendar && (
      <div className="absolute z-10 mt-2">
        <Calendar
          mode="single"
          selected={startDate}
          onSelect={(date) => {
            setStartDate(date)
            setShowStartCalendar(false)
          }}
          className="rounded-lg border bg-white"
        />
      </div>
    )}
  </div>
  <div className="relative">
    <Button
      variant="outline"
      onClick={() => {
        setShowEndCalendar((v) => {
          if (!v) setShowStartCalendar(false)
          return !v
        })
      }}
      className="w-[130px] justify-start"
    >
      {endDate ? endDate.toLocaleDateString() : "End Date"}
    </Button>
    {showEndCalendar && (
      <div className="absolute z-10 mt-2">
        <Calendar
          mode="single"
          selected={endDate}
          onSelect={(date) => {
            setEndDate(date)
            setShowEndCalendar(false)
          }}
          className="rounded-lg border bg-white"
        />
      </div>
    )}
  </div>
</div>
<Button variant="outline"
className=' hover:text-green-800'
onClick={handleApplyFilters} disabled={isLoading}>
  Apply filters
</Button>

    <Button 
  variant="outline" 
  onClick={handleResetFilters}
>
  Clear Filters
</Button>

      </div>
      {/* Projects Table */}
   <TableComponent
        table={table}
        columns={columns}
        isLoading={isLoading}
 
      />
      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
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
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </Button>
          <span className="flex items-center gap-1">
            Page{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </strong>
          </span>
        </div>
        
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
              {[1,10, 20, 30, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="mt-2 text-sm text-gray-500">
        Showing {table.getRowModel().rows.length} of {data?.rowCount ?? 0} projects
      </div>
    </div>
  )
}

function TableActions({ project, onUpdate }: { project: Project; onUpdate: () => void }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
// delete function
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
// edit function
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
   
{/* delete button  */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
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
         {/* edit dialogue */}
      {project.status !== 'cancelled' && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:text-blue-600">
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
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
                <Label htmlFor="clientemail">Client Email</Label>
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