"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
// import { ConnectionButton } from "@/app/(auth)/signin/page"
import {
  LayoutDashboard,
  MessageSquare,
  Video,
  Calendar,
  FileText,
  Settings,
  LogOut,
  User,
  CreditCard,
} from "lucide-react"
import Link from "next/link"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, current: pathname === "/dashboard" },
    {
      name: "Chatrooms",
      href: "/dashboard/chatrooms",
      icon: MessageSquare,
      current: pathname === "/dashboard/chatrooms" || pathname.startsWith("/chatroom/"),
    },
    {
      name: "Meetings",
      href: "/dashboard/meetings",
      icon: Video,
      current: pathname === "/dashboard/meetings" || pathname.startsWith("/meeting/"),
    },
    { name: "Schedule", href: "/dashboard/schedule", icon: Calendar, current: pathname === "/dashboard/schedule" },
    {
      name: "Recordings",
      href: "/dashboard/recordings",
      icon: FileText,
      current: pathname === "/dashboard/recordings",
    },
    {
      name: "Subscription",
      href: "/dashboard/subscription",
      icon: CreditCard,
      current: pathname === "/dashboard/subscription",
    },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, current: pathname === "/dashboard/settings" },
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-screen">
        <Sidebar variant="inset">
          <SidebarHeader className="flex items-center px-4 py-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary" />
              <span className="text-xl font-bold">EchoProof</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={item.current} tooltip={item.name}>
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="flex items-center gap-3">
            {/* <ConnectionButton /> */}
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-background/95">
          <div className="flex h-16 items-center gap-4 border-b px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">{navigation.find((item) => item.current)?.name || "Dashboard"}</h1>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-auto p-6"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
