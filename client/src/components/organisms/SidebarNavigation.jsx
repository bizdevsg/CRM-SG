import { getRoleDashboardConfig } from "../../config/dashboardNavigation";
import SidebarNavItem from "../molecules/SidebarNavItem";
import Icon from "../atoms/Icon";

export default function SidebarNavigation({ user }) {
  const config = getRoleDashboardConfig(user?.role);
  const groups = config.menu.reduce((result, item) => {
    if (!result[item.group]) {
      result[item.group] = [];
    }

    result[item.group].push(item);
    return result;
  }, {});

  return (
    <aside className="w-full lg:sticky lg:top-0 lg:h-screen lg:w-[255px] lg:flex-none">
      <div className="h-full border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sky-700">
              <Icon name="dashboard" className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-slate-900">{config.brand}</p>
              <p className="truncate text-sm text-slate-500">{user?.name}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-3 py-6">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                {group}
              </p>
              <div className="space-y-2">
                {items.map((item) => (
                  <SidebarNavItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

