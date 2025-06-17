'use server'

import prisma from "@/lib/prisma.db"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth/authOptions"
// ...existing code...
import { io } from 'socket.io-client'
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000')

export async function getProjects(
  page = 1,
  pageSize = 10,
  searchTerm = '',
  statusFilter = 'all',
  startDate?: Date,
  endDate?: Date
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { success: false, error: 'Not authenticated' }
    }

    const normalizedStartDate = startDate   // to match with the format of createdAt in the database
  ? new Date(Date.UTC(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      0, 0, 0, 0
    ))
  : undefined

const normalizedEndDate = endDate
  ? new Date(Date.UTC(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      23, 59, 59, 999
    ))
  : undefined

const whereClause = {
  AND: [
    searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm.toLowerCase() } },
            { clientName: { contains: searchTerm.toLowerCase() } },
            { clientemail: { contains: searchTerm.toLowerCase() } },
          ],
        }
      : {},
    statusFilter !== 'all' ? { status: statusFilter } : {},
    normalizedStartDate ? { createdAt: { gte: normalizedStartDate } } : {},
    normalizedEndDate ? { createdAt: { lte: normalizedEndDate } } : {},
  ],
}

    const totalCount = await prisma.project.count({ where: whereClause })

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: { user: true },
      orderBy: { id: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return {
      success: true,
      projects,
      rowCount: totalCount,
      pageCount: Math.ceil(totalCount / pageSize),
    }
  } catch (error) {
    console.error('Get projects error:', error)
    return { success: false, error: 'Failed to fetch projects.' }
  }
}


export async function deleteProject(projectId: string) {
  try {
  const project=  await prisma.project.delete({
      where: { id: projectId }
    })
   socket.emit('project:deleted', project)
    return { success: true,project }
  } catch (error) {
    console.error('Delete project error:', error)
    return { success: false, error: 'Failed to delete project.' }
  }
}

export async function updateProject(projectId: string, data: {
  name: string
  budget: number
  status: string
  clientName: string
  clientemail: string
}) {
  try {
    const project = await prisma.project.update({
      where: { id: projectId },
      data
    })
    socket.emit('project:updated', project)
    return { success: true, project }
  } catch (error) {
    console.error('Update project error:', error)
    return { success: false, error: 'Failed to update project.' }
  }
}