import { IncomeEntry } from '../backend';
import { Calendar, TrendingUp, DollarSign } from 'lucide-react';

interface EntriesTableProps {
  entries: IncomeEntry[];
  isLoading?: boolean;
}

export default function EntriesTable({ entries, isLoading }: EntriesTableProps) {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading entries...</p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No entries yet</h3>
          <p className="text-muted-foreground">Income entries will appear here once added by an admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Date
                </div>
              </th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">
                <div className="flex items-center justify-end gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  ICP Amount
                </div>
              </th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">
                <div className="flex items-center justify-end gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  Token Value
                </div>
              </th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">
                <div className="flex items-center justify-end gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Income
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={index}
                className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
              >
                <td className="py-4 px-6 text-sm text-foreground font-medium">
                  {formatDate(entry.date)}
                </td>
                <td className="py-4 px-6 text-sm text-right font-mono text-muted-foreground">
                  {formatNumber(entry.icpAmount)}
                </td>
                <td className="py-4 px-6 text-sm text-right font-mono text-muted-foreground">
                  ${formatNumber(entry.icpTokenValue)}
                </td>
                <td className="py-4 px-6 text-sm text-right font-mono font-semibold text-primary">
                  ${formatNumber(entry.incomeValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

