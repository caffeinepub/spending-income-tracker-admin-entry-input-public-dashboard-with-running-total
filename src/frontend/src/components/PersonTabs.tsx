import { Person } from '../backend';

interface PersonTabsProps {
  persons: Person[];
  selectedPersonId: bigint | null;
  onSelectPerson: (personId: bigint) => void;
}

export default function PersonTabs({ persons, selectedPersonId, onSelectPerson }: PersonTabsProps) {
  if (persons.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-border bg-card">
      <div className="flex gap-1 overflow-x-auto">
        {persons.map((person) => {
          const isSelected = selectedPersonId?.toString() === person.id.toString();
          return (
            <button
              key={person.id.toString()}
              onClick={() => onSelectPerson(person.id)}
              className={`
                px-6 py-3 text-sm font-medium transition-all whitespace-nowrap
                border-b-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                ${
                  isSelected
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }
              `}
              role="tab"
              aria-selected={isSelected}
              tabIndex={0}
            >
              {person.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
