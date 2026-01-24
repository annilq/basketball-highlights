import { UserMenu } from "@/components/user-menu";
import { useI18n } from "@/lib/i18n";
import { useSessionQuery } from "@/lib/queries/session";
import { sidebarItems } from "./constants";
import { SidebarNav } from "./sidebar-nav";

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const { t } = useI18n();
  const { data: session } = useSessionQuery();

  // Filter sidebar items based on user role
  const role = (session as { user?: { role?: string } } | null)?.user?.role;
  const filteredItems =
    role === "admin"
      ? sidebarItems
      : sidebarItems.filter(
          (item) =>
            item.labelKey === "common.myShots" ||
            item.labelKey === "common.shotDetection" ||
            item.labelKey === "common.settings",
        );

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-0"
      } transition-all duration-300 ease-in-out bg-muted/50 border-r overflow-hidden`}
    >
      <div className="h-full flex flex-col">
        <div className="h-14 flex items-center px-4 border-b">
          <h2 className="font-semibold text-lg">{t("common.dashboard")}</h2>
        </div>
        <SidebarNav items={filteredItems} />
        <UserMenu />
      </div>
    </aside>
  );
}
