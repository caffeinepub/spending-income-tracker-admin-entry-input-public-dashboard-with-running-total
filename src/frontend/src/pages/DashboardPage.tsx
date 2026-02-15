import { useGetEntries } from '../hooks/useQueries';
import EntriesTable from '../components/EntriesTable';
import { TrendingUp, DollarSign, Hash } from 'lucide-react';

export default function DashboardPage() {
  const { data: entries = [], isLoading } = useGetEntries();

  const totalIncome = entries.reduce((sum, entry) => sum + entry.incomeValue, 0);
  const totalEntries = entries.length;
  const averageIncome = totalEntries > 0 ? totalIncome / totalEntries : 0;

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Income Dashboard</h2>
        <p className="text-muted-foreground">
          Track and monitor all income entries with real-time calculations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg border border-border p-6 shadow-soft">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Income</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(totalIncome)}</p>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 shadow-soft">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Hash className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Entries</p>
            <p className="text-3xl font-bold text-foreground">{totalEntries}</p>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 shadow-soft">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Average Income</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(averageIncome)}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">All Entries</h3>
        <EntriesTable entries={entries} isLoading={isLoading} />
      </div>
    </div>
  );
}

