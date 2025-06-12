
import { Calendar, Home, Inbox,  MessageCircle,  Settings } from "lucide-react"

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
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Project",
    url: "/dashboard/project",
    icon: Inbox,
  },
  {
    title: "Status",
    url: "/dashboard/status",
    icon: Calendar,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
   {
    title: "Inbox",
    url: "/dashboard/inbox",
    icon: MessageCircle,
  },
]

export function AppSidebar() {
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
