import React from "react";
import { Outlet } from "react-router-dom";

import AppSidebar from "@/components/admin/nav/app-sidebar"

import SiteHeader from "@/components/admin/nav/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const LayoutAdmin = () => {
    return (
        <>
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    }
                }>
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col">
                        <Outlet />
                    </div>
                </SidebarInset>
            </SidebarProvider>

        </>
    );
};
export default LayoutAdmin;