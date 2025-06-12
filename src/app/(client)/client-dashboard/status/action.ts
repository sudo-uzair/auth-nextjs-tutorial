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
        where: {
          user: {
            email: session.user.email
          }},
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
export async function cancelProject(projectId: string) {
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "cancelled" },
    });
    return { success: true };
  } catch (error) {
    console.log(error)
    return { success: false, error: "Failed to cancel project." };
  }
}