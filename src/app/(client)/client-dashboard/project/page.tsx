'use client'

import React, { useState, useTransition } from 'react'
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createProject } from './action'
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function CreateProjectPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    budget: '',
    clientName: '',
    clientemail: ''
  })

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const budgetNumber = parseFloat(formData.budget)
    if (isNaN(budgetNumber)) {
      setError('Please enter a valid budget')
      return
    }

    const userEmail = session?.user?.email;
    if (!session || status !== 'authenticated') {
      setError('User not authenticated')
      return
    }

    if (!userEmail) {
      setError('User email not found')
      return
    }

    startTransition(async () => {
      const response = await createProject({
        name: formData.name,
        budget: budgetNumber,
        status: "Not Started",
        clientName: formData.clientName,
        userEmail: userEmail,
        clientemail: formData.clientemail
      })

      if (response.success) {
        setFormData({ name: '', budget: '', clientName: '', clientemail: '' })
        toast({
          title: "Success!",
          description: "Project created successfully.",
        })
      } else {
        setError(response.error || 'Something went wrong')
        toast({
          variant: "destructive",
          title: "Error!",
          description: response.error || 'Failed to create project.',
        })
      }
    })
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6 underline">Create Project</h1>
      <Card className='w-1/2'>
        <CardContent className="space-y-4 py-6 ">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter project name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                placeholder="Enter budget"
                value={formData.budget}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="clientName">Your Name</Label>
              <Input
                id="clientName"
                name="clientName"
                placeholder="Enter your Name"
                value={formData.clientName}
                onChange={handleChange}
                required
              />
            </div>
            <div> 
              <Label htmlFor="clientemail">Your Email</Label>
              <Input
                id="clientemail"
                name="clientemail"
                placeholder="Enter your Email"
                value={formData.clientemail}
                onChange={handleChange}
                required
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" className="w-40" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}