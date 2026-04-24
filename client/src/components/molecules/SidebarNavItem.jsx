import { NavLink } from "react-router-dom";
import Icon from "../atoms/Icon";
import { cn } from "../../utils/cn";

export default function SidebarNavItem({ item, onClick }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === "/dashboard"}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 rounded-[22px] border px-4 py-3 text-left text-sm font-semibold transition duration-200",
          isActive
            ? "border-transparent bg-[linear-gradient(135deg,var(--teal-deep),var(--teal))] text-white shadow-[0_16px_28px_rgba(17,75,95,0.18)]"
            : "border-transparent bg-white/72 text-[color:var(--ink-soft)] hover:border-[color:var(--line)] hover:bg-white"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-[18px] transition",
              isActive
                ? "bg-white/14 text-white"
                : "bg-[linear-gradient(135deg,rgba(22,105,122,0.08),rgba(245,158,11,0.12))] text-[color:var(--teal-deep)] group-hover:bg-[linear-gradient(135deg,rgba(22,105,122,0.12),rgba(245,158,11,0.16))]"
            )}
          >
            <Icon name={item.icon} className="h-4 w-4" />
          </span>
          <span className="tracking-[0.01em]">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}
