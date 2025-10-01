"use client";

import { Contact, FormInput, MailIcon, PanelBottomOpen, Rocket } from "lucide-react";
import { Link } from "next-view-transitions";
import type * as React from "react";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <h1 className="text-2xl pl-2">Send0</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuButton tooltip="Dashboard" asChild>
              <Link href="/dashboard">
                <PanelBottomOpen className="mr-2 size-4" />
                Dashboard
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton tooltip="Contacts" asChild>
              <Link href="/contacts">
                <Contact className="mr-2 size-4" />
                Contacts
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton tooltip="Emails" asChild>
              <Link href="/emails">
                <MailIcon className="mr-2 size-4" />
                Emails
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton tooltip="Forms" asChild>
              <Link href="/forms">
                <FormInput className="mr-2 size-4" />
                Forms
              </Link>
            </SidebarMenuButton> 
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>  
      <SidebarRail />
    </Sidebar>
  );
}
