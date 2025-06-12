"use client"
import React, { useEffect, useState } from 'react'
import {getAdmins } from './action'
import Link from 'next/link';

interface Admin {
    id: string;
    username?: string;
    email?: string;
}

const Page = () => {
    const [admins, setAdmins] = useState<Admin[]>([])

    useEffect(() => {
        const fetchAdmins = async () => {
            const data = await getAdmins()
            setAdmins(data.admins || [])
        }
        fetchAdmins()
    }, [])

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Inbox</h1>
            <p className="text-gray-600">Chat with Clients</p>
            <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Clients</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {admins.map((admin) => (
                        <Link
                            href={`/client-dashboard/inbox/chat/${admin.id}`}
                            className='p-4 border rounded-lg hover:bg-gray-50 transition-colors'
                            key={admin.id}
                        >
                            <div className="font-medium">
                                {admin.username || "No username"}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                                {admin.email}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Page