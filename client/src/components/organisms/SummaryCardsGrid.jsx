import SummaryCard from "../molecules/SummaryCard";

export default function SummaryCardsGrid({ cards }) {
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {cards.map((card) => (
        <SummaryCard key={card.label} {...card} />
      ))}
    </div>
  );
}

