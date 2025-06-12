'use server'

import prisma from "@/lib/prisma.db"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth/authOptions"
export async function getAdmins() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { success: false, error: 'Not authenticated' }
    }
    const admins = await prisma.user.findMany({
        where: {
            role: 'admin'
            },
    })  
    const username = admins.map(admin => ({
      ...admin,
      username: admin.email?.split('@')[0] || ''
    }))
    return { success: true, admins:username}  
  } catch (error) {
    console.error('Error getting error', error)
    return { success: false, error: 'Failed to fetch inbox messages.' }
  }
}