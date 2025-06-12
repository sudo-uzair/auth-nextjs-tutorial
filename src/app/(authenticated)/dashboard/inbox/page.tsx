"use client"
import React, { useEffect, useState } from 'react'
import { getCLients } from './action'
import Link from 'next/link';

interface Client {
    id: string;
    username?: string;
    email?: string;
}

const Page = () => {
    const [clients, setClients] = useState<Client[]>([])

    useEffect(() => {
        const fetchClients = async () => {
            const data = await getCLients()
            setClients(data.clients || [])
        }
        fetchClients()
    }, [])

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Inbox</h1>
            <p className="text-gray-600">Chat with Clients</p>
            <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Clients</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {clients.map((client) => (
                        <Link
                            href={`/dashboard/inbox/chat/${client.id}`}
                            className='p-4 border rounded-lg hover:bg-gray-50 transition-colors'
                            key={client.id}
                        >
                            <div className="font-medium">
                                {client.username || "No username"}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                                {client.email}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Page