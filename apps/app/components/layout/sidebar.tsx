import { UserMenu } from "@/components/user-menu";
import { useI18n } from "@/lib/i18n";
import { sidebarItems } from "./constants";
import { SidebarNav } from "./sidebar-nav";

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const { t } = useI18n();
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
        <SidebarNav items={sidebarItems} />
        <UserMenu />
      </div>
    </aside>
  );
}
