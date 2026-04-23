import { dashboardIcons } from "../../config/dashboardNavigation";

export default function Icon({ name, className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d={dashboardIcons[name] || dashboardIcons.dashboard} />
    </svg>
  );
}

