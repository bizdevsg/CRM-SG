import { getRoleDashboardConfig } from "../../config/dashboardNavigation";
import SidebarNavItem from "../molecules/SidebarNavItem";
import Icon from "../atoms/Icon";
import Button from "../atoms/Button";
import { cn } from "../../utils/cn";

export default function SidebarNavigation({ user, isOpen = false, onClose }) {
  const config = getRoleDashboardConfig(user?.role);
  const groups = config.menu.reduce((result, item) => {
    if (!result[item.group]) {
      result[item.group] = [];
    }

    result[item.group].push(item);
    return result;
  }, {});

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-[#1b2a34]/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[292px] max-w-[88vw] flex-none transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:w-[272px]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col border-r border-[color:var(--line)] bg-[rgba(255,255,255,0.94)] shadow-[0_24px_60px_rgba(16,32,51,0.08)] backdrop-blur-xl lg:shadow-none">
          <div className="border-b border-[color:var(--line)] px-5 py-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,var(--teal-deep),var(--teal))] text-white shadow-[0_14px_28px_rgba(23,58,122,0.22)]">
                  <Icon name="dashboard" className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-[color:var(--ink)]">
                    {config.brand}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                className="px-3 py-3 lg:hidden"
                onClick={onClose}
                aria-label="Tutup sidebar"
              >
                <Icon name="close" className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
            {Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--ink-soft)]">
                  {group}
                </p>
                <div className="space-y-2">
                  {items.map((item) => (
                    <SidebarNavItem
                      key={item.id}
                      item={item}
                      onClick={onClose}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
