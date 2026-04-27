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
      <div className="flex items-center justify-between gap-4 border-b border-[color:var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-5">
        <h2 className="text-xl font-bold text-[color:var(--ink)]">{title}</h2>
        {headerAction}
      </div>
      {items.length === 0 ? (
        <p className="px-6 py-6 text-sm leading-6 text-[color:var(--ink-soft)]">{emptyText}</p>
      ) : (
        <div className="grid gap-4 p-5 md:grid-cols-2 2xl:grid-cols-3">
          {items.map((item) => {
            const customActions = renderActions ? renderActions(item) : null;
            const hasActions = Boolean(customActions) || Boolean(onDelete);

            return (
              <article
                key={item.id}
                className="flex h-full flex-col justify-between rounded-[26px] border border-[color:var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_14px_35px_rgba(16,32,51,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(16,32,51,0.08)]"
              >
                <div className="min-h-0 flex-1">
                  {renderItem(item)}
                </div>
                {hasActions ? (
                  <div className="mt-4 flex flex-wrap gap-3 border-t border-[color:var(--line)] pt-4">
                    {customActions}
                    {onDelete ? (
                      <Button variant="ghost" className="px-4 py-2" onClick={() => onDelete(item.id)}>
                        Hapus
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}
