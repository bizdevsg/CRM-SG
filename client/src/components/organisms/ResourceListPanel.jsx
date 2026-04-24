import Card from "../atoms/Card";
import Button from "../atoms/Button";

export default function ResourceListPanel({
  title,
  items,
  emptyText,
  headerAction,
  onDelete,
  renderActions,
  renderItem
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,255,255,0.1))] px-6 py-5">
        <h2 className="text-xl font-bold text-[color:var(--ink)]">{title}</h2>
        {headerAction}
      </div>
      {items.length === 0 ? (
        <p className="px-6 py-6 text-sm leading-6 text-[color:var(--ink-soft)]">{emptyText}</p>
      ) : (
        <div className="divide-y divide-[color:var(--line)]">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 px-6 py-5 transition hover:bg-white/55 lg:flex-row lg:items-start lg:justify-between"
            >
              {renderItem(item)}
              <div className="flex flex-wrap gap-3">
                {renderActions ? renderActions(item) : null}
                {onDelete ? (
                  <Button variant="ghost" className="px-4 py-2" onClick={() => onDelete(item.id)}>
                    Hapus
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
