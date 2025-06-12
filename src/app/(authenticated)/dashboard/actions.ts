'use server'

import prisma from "@/lib/prisma.db"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth/authOptions"

export async function getStats() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get active projects count
    const activeProjects = await prisma.project.count({
      where: {
        user: {
          email: session.user.email
        },
        status: 'in-progress'
      }
    })
    const completedProjects = await prisma.project.count({
      where: {
        user: {
          email: session.user.email
        },
        status: 'completed',

      }
    })
    
    const completedProjectsEarnings = await prisma.project.aggregate({
      where: {
        user: {
          email: session.user.email
        },
        status: 'completed',
      },
      _sum: {
        budget: true
      }
    })

    return {
      success: true,
      stats: {
        activeProjects,
        completedProjects,
        totalEarnings: completedProjectsEarnings._sum.budget || 0
      }
    }
  } catch (error) {
    console.error('error:', error)
    return { success: false, error: 'Failed to get stats' }
  }
}
