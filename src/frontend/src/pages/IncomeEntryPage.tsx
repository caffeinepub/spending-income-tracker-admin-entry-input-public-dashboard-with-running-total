import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin, useCreateIncomeEntry, useGetPersons } from '../hooks/useQueries';
import LoginButton from '../components/LoginButton';
import { Shield, AlertCircle, CheckCircle, Loader2, Plus, Users, Calendar } from 'lucide-react';
import { convertDateToTime, validateDateInputs } from '../utils/receivedDate';

export default function IncomeEntryPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isCheckingAdmin } = useIsAdmin();
  const { data: persons = [], isLoading: personsLoading } = useGetPersons();
  const createEntry = useCreateIncomeEntry();

  const [icpAmount, setIcpAmount] = useState('');
  const [icpTokenValue, setIcpTokenValue] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [dateError, setDateError] = useState('');

  const isAuthenticated = !!identity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(icpAmount);
    const tokenValue = parseFloat(icpTokenValue);
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(amount) || isNaN(tokenValue) || amount <= 0 || tokenValue <= 0 || !selectedPersonId) {
      return;
    }

    // Validate date inputs
    const validation = validateDateInputs(dayNum, monthNum, yearNum);
    if (!validation.valid) {
      setDateError(validation.error || 'Invalid date');
      return;
    }

    setDateError('');

    try {
      const receivedDate = convertDateToTime(dayNum, monthNum, yearNum);
      await createEntry.mutateAsync({
        personId: BigInt(selectedPersonId),
        icpAmount: amount,
        icpTokenValue: tokenValue,
        date: receivedDate,
      });
      setIcpAmount('');
      setIcpTokenValue('');
      setSelectedPersonId('');
      setDay('');
      setMonth('');
      setYear('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to create entry:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg border border-border p-12 text-center shadow-soft">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Income Entry</h2>
          <p className="text-muted-foreground mb-8">
            Please log in with Internet Identity to add income entries
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  if (isCheckingAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg border border-border p-12 text-center shadow-soft">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-primary animate-spin" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg border border-border p-12 text-center shadow-soft">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Access Denied</h2>
          <p className="text-muted-foreground mb-8">
            You do not have admin privileges to add income entries
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Income Entry</h2>
          <p className="text-muted-foreground">Add a new income entry with received date</p>
        </div>
        <LoginButton />
      </div>

      {showSuccess && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-sm text-foreground">Income entry added successfully!</p>
        </div>
      )}

      <div className="bg-card rounded-lg border border-border p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Add Income Entry</h3>
            <p className="text-sm text-muted-foreground">Record a new income transaction with date received</p>
          </div>
        </div>

        {personsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : persons.length === 0 ? (
          <div className="text-center py-8 px-4 bg-muted/30 rounded-lg border border-border">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No persons available. Create a person first in the Admin panel.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="person" className="block text-sm font-medium text-foreground mb-2">
                Select Person
              </label>
              <select
                id="person"
                value={selectedPersonId}
                onChange={(e) => setSelectedPersonId(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                required
              >
                <option value="">Choose a person</option>
                {persons.map((person) => (
                  <option key={person.id.toString()} value={person.id.toString()}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="icpAmount" className="block text-sm font-medium text-foreground mb-2">
                ICP Amount
              </label>
              <input
                id="icpAmount"
                type="number"
                step="0.00000001"
                value={icpAmount}
                onChange={(e) => setIcpAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all font-mono"
                required
              />
            </div>

            <div>
              <label htmlFor="icpTokenValue" className="block text-sm font-medium text-foreground mb-2">
                ICP Token Value (USD)
              </label>
              <input
                id="icpTokenValue"
                type="number"
                step="0.01"
                value={icpTokenValue}
                onChange={(e) => setIcpTokenValue(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Received
                </div>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <input
                    type="number"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    placeholder="Day"
                    min="1"
                    max="31"
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all font-mono"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Day (1-31)</p>
                </div>
                <div>
                  <input
                    type="number"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    placeholder="Month"
                    min="1"
                    max="12"
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all font-mono"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Month (1-12)</p>
                </div>
                <div>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="Year"
                    min="2000"
                    max="2100"
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all font-mono"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Year (4 digits)</p>
                </div>
              </div>
              {dateError && (
                <p className="text-sm text-destructive mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {dateError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={createEntry.isPending}
              className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {createEntry.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding Entry...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Entry
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
