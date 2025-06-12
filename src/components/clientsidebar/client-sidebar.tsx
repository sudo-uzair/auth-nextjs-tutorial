
import { Calendar, Home, Inbox,  Settings,MessageCircle } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/client-dashboard",
    icon: Home,
  },
  {
    title: "Project",
    url: "/client-dashboard/project",
    icon: Inbox,
  },
  {
    title: "Status",
    url: "/client-dashboard/status",
    icon: Calendar,
  },
  {
    title: "Settings",
    url: "/client-dashboard/settings",
    icon: Settings,
  },
     {
    title: "Inbox",
    url: "/client-dashboard/inbox",
    icon: MessageCircle,
  },
]

export function ClientSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-10 p-10 ">
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="text-2xl" >
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="text-xl"  />
                      <span className="text-md">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
        
    </Sidebar>
  )
}
