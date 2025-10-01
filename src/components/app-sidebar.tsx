"use client";

import { IconMailAi } from "@tabler/icons-react";
import {
  Contact,
  FormInput,
  LayoutPanelTop,
  Mailbox,
  MailIcon,
} from "lucide-react";
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
        <SidebarMenuButton asChild>
          <Link href="/">
            <IconMailAi className="!h-7 !w-7 -ml-1.5 text-primary-600" />
            <h1 className="text-2xl pl-1 font-mono font-semibold">Send0</h1>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuButton tooltip="Dashboard" asChild>
              <Link href="/dashboard">
                <LayoutPanelTop className="mr-2 size-4" />
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
