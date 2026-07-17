import { LogOut } from "lucide-react";
import { logout } from "@/app/login/actions";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function UserMenu() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <form action={logout}>
          <SidebarMenuButton type="submit" tooltip="Sair">
            <LogOut />
            <span>Sair</span>
          </SidebarMenuButton>
        </form>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
