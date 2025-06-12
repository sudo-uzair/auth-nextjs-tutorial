'use server'

import prisma from "@/lib/prisma.db"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth/authOptions"

export async function getProjects(page = 1, pageSize = 10) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return { success: false, error: 'Not authenticated' }
      }

      // Get total count
      const totalCount = await prisma.project.count({
        where: {
          user: {
            email: session.user.email
          }
        }
      })

      // Get paginated projects
      const projects = await prisma.project.findMany({
        include: { user: true },
        orderBy: {
          id: 'desc'
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      })

      return { 
        success: true, 
        projects,
        rowCount: totalCount,
        pageCount: Math.ceil(totalCount / pageSize)
      }
    } catch (error) {
      console.error('Get projects error:', error)
      return { success: false, error: 'Failed to fetch projects.' }
    }
}

export async function deleteProject(projectId: string) {
  try {
    await prisma.project.delete({
      where: { id: projectId }
    })
    return { success: true }
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
  clientemail:string
}) {
  try {
    const project = await prisma.project.update({
      where: { id: projectId },
      data
    })
    return { success: true, project }
  } catch (error) {
    console.error('Update project error:', error)
    return { success: false, error: 'Failed to update project.' }
  }
}

  