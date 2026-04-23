import Card from "../atoms/Card";
import Button from "../atoms/Button";

export default function ResourceListPanel({
  title,
  items,
  emptyText,
  onDelete,
  renderItem
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>
      {items.length === 0 ? (
        <p className="px-6 py-5 text-sm leading-6 text-slate-500">{emptyText}</p>
      ) : (
        <div className="divide-y divide-slate-200">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-start lg:justify-between"
            >
              {renderItem(item)}
              {onDelete ? (
                <Button variant="ghost" className="px-4 py-2" onClick={() => onDelete(item.id)}>
                  Hapus
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

