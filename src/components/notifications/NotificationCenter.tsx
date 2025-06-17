import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/context/SocketContext';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';

type Project = {
  id: string;
  name: string;
  budget: number;
  status: string;
  clientName: string;
  clientemail: string;
};

type Notification = {
  type: 'new_project' | 'project_updated' | 'project_deleted' | 'new_message';
  message: string;
  project?: Project;
  content?: string;
  senderId?: string;
};

export default function NotificationCenter() {
  const { data: session } = useSession();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!socket || !session?.user?.role) return;

    if (session.user.role === 'admin') {
      // Admin listens for new projects and messages
      socket.on('notification:new_project', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      socket.on('notification:new_message', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    } else {
      // Client listens for updates, deletes, and messages
      socket.on('notification:project_updated', (notification: Notification) => {
        console.log('Received project update notification:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      socket.on('notification:project_deleted', (notification: Notification) => {
        console.log('Received project delete notification:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      socket.on('notification:new_message', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }

    return () => {
      socket.off('notification:new_project');
      socket.off('notification:project_updated');
      socket.off('notification:project_deleted');
      socket.off('notification:new_message');
    };
  }, [socket, session?.user?.role]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setUnreadCount(0);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotifications([])}
            >
              Clear all
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg mb-2 text-sm",
                    notification.type === 'new_project' && "bg-green-50",
                    notification.type === 'project_updated' && "bg-blue-50",
                    notification.type === 'project_deleted' && "bg-red-50",
                    notification.type === 'new_message' && "bg-purple-50"
                  )}
                >
                  <p className="font-medium">{notification.message}</p>
                  {notification.content && (
                    <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                  )}
       
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 