import { NavLink } from "react-router-dom";
import Icon from "../atoms/Icon";
import { cn } from "../../utils/cn";

export default function SidebarNavItem({ item }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === "/dashboard"}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition",
          isActive
            ? "bg-slate-900 text-white shadow-sm"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              isActive ? "bg-white/12 text-white" : "bg-white text-slate-500"
            )}
          >
            <Icon name={item.icon} className="h-4 w-4" />
          </span>
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

