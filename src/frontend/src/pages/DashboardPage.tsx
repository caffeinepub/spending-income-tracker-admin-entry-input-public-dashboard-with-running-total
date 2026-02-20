import { useState, useEffect } from 'react';
import { useGetPersons, useGetEntriesByPerson, useGetTotalIncomeByPerson, useGetRolling30DayIncomeSum, useGetAllEntries } from '../hooks/useQueries';
import EntriesTable from '../components/EntriesTable';
import PersonTabs from '../components/PersonTabs';
import LoginButton from '../components/LoginButton';
import { Calendar, DollarSign, Hash, Users, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCSV } from '../utils/csvExport';

export default function DashboardPage() {
  const { data: persons = [], isLoading: personsLoading } = useGetPersons();
  const [selectedPersonId, setSelectedPersonId] = useState<bigint | null>(null);

  const { data: entries = [], isLoading: entriesLoading } = useGetEntriesByPerson(selectedPersonId);
  const { data: totalIncome = 0 } = useGetTotalIncomeByPerson(selectedPersonId);
  const { data: monthlyIncome = 0 } = useGetRolling30DayIncomeSum(selectedPersonId);
  const { data: allEntries = [] } = useGetAllEntries();

  useEffect(() => {
    if (persons.length > 0 && selectedPersonId === null) {
      setSelectedPersonId(persons[0].id);
    }
  }, [persons, selectedPersonId]);

  const totalEntries = entries.length;

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const handleExportCSV = () => {
    exportToCSV(allEntries);
  };

  if (personsLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Income Dashboard</h2>
            <p className="text-muted-foreground">Loading...</p>
          </div>
          <LoginButton />
        </div>
      </div>
    );
  }

  if (persons.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Income Dashboard</h2>
            <p className="text-muted-foreground">
              Track and monitor all income entries with real-time calculations
            </p>
          </div>
          <LoginButton />
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No persons configured</h3>
            <p className="text-muted-foreground">
              An admin needs to create persons before income entries can be tracked.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Income Dashboard</h2>
          <p className="text-muted-foreground">
            Track and monitor all income entries with real-time calculations
          </p>
        </div>
        <LoginButton />
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-soft">
        <PersonTabs
          persons={persons}
          selectedPersonId={selectedPersonId}
          onSelectPerson={setSelectedPersonId}
        />
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
              <Calendar className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Monthly Income</p>
            <p className="text-xs text-muted-foreground/80 mb-2">Last 30 days</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(monthlyIncome)}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-foreground">All Entries</h3>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={allEntries.length === 0}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
        <EntriesTable entries={entries} isLoading={entriesLoading} />
      </div>
    </div>
  );
}
