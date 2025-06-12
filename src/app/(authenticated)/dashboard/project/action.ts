'use server'

import prisma from '@/lib/prisma.db'
import { revalidatePath } from 'next/cache'

export async function createProject(data: {
  name: string
  budget: number
  status: string
  clientName: string
  clientemail: string
  userEmail: string
}) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: data.userEmail },
    })
    
    if (!user) {
      throw new Error('User not found')
    }
    
    const project = await prisma.project.create({
      data: {
        name: data.name,
        budget: data.budget,
        status: data.status,
        clientName: data.clientName,
        clientemail: data.clientemail,
        userId: user.id,
      },
    })
    
    revalidatePath('/projects')

    return { success: true, project }
  } catch (error) {
    console.error('Create project error:', error)
    return { success: false, error: 'Failed to create project.' }
  }
}
