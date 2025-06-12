'use server'

import prisma from "@/lib/prisma.db"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth/authOptions"

export async function getCLients() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { success: false, error: 'Not authenticated' }
    }
    const clients = await prisma.user.findMany({
      where: {
        role: 'user'
      },
    })
    const clientsWithUsername = clients.map(client => ({
      ...client,
      username: client.email?.split('@')[0] || ''
    }))
    return { success: true, clients: clientsWithUsername }
  } catch (error) {
    console.error('Error getting clients', error)
    return { success: false, error: 'Failed to fetch inbox messages.' }
  }
}