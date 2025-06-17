import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

type SocketContextType = {
    socket: Socket | null;
};

const SocketContext = createContext<SocketContextType>({ socket: null });

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!session?.user?.email || !session.user.id) return;

        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');

        // Authenticate the socket connection
        socketInstance.emit(
            session.user.role === 'admin' ? 'admin:auth' : 'client:auth',
            session.user.email,
            session.user.id
        );

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [session]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}; 