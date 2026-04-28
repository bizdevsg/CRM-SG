import { useEffect, useState } from "react";

export default function StatusAlert({ error, success }) {
  const message = error || success;
  const tone = error ? "error" : success ? "success" : null;
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return undefined;
    }

    setVisible(true);

    const timeoutId = window.setTimeout(() => {
      setVisible(false);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [message]);

  if (!message || !visible) {
    return null;
  }

  if (tone === "error") {
    return (
      <div className="rounded-[24px] border border-rose-200/80 bg-rose-50/90 px-5 py-4 text-sm text-rose-700 shadow-[0_10px_25px_rgba(190,24,93,0.08)]">
        {message}
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-emerald-200/80 bg-emerald-50/90 px-5 py-4 text-sm text-emerald-700 shadow-[0_10px_25px_rgba(22,163,74,0.08)]">
      {message}
    </div>
  );
}
