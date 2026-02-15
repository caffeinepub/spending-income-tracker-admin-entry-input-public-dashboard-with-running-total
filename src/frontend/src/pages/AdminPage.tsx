import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin, useCreateIncomeEntry } from '../hooks/useQueries';
import LoginButton from '../components/LoginButton';
import { Shield, AlertCircle, CheckCircle, Loader2, Plus } from 'lucide-react';

export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isCheckingAdmin } = useIsAdmin();
  const createEntry = useCreateIncomeEntry();

  const [icpAmount, setIcpAmount] = useState('');
  const [icpTokenValue, setIcpTokenValue] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const isAuthenticated = !!identity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(icpAmount);
    const tokenValue = parseFloat(icpTokenValue);

    if (isNaN(amount) || isNaN(tokenValue) || amount <= 0 || tokenValue <= 0) {
      return;
    }

    try {
      await createEntry.mutateAsync({ icpAmount: amount, icpTokenValue: tokenValue });
      setIcpAmount('');
      setIcpTokenValue('');
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
          <h2 className="text-2xl font-bold text-foreground mb-3">Admin Panel</h2>
          <p className="text-muted-foreground mb-8">
            Please log in with Internet Identity to access the admin panel
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
          <p className="text-muted-foreground">Verifying admin access...</p>
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
            You do not have admin privileges to access this panel
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
          <h2 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h2>
          <p className="text-muted-foreground">Add new income entries to the tracker</p>
        </div>
        <LoginButton />
      </div>

      {showSuccess && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-sm text-foreground font-medium">Entry added successfully!</p>
        </div>
      )}

      <div className="bg-card rounded-lg border border-border p-8 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Add New Entry</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="icpAmount" className="block text-sm font-medium text-foreground mb-2">
              ICP Amount
            </label>
            <input
              type="number"
              id="icpAmount"
              step="0.01"
              min="0"
              value={icpAmount}
              onChange={(e) => setIcpAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
            <p className="mt-2 text-xs text-muted-foreground">Enter the amount of ICP tokens</p>
          </div>

          <div>
            <label htmlFor="icpTokenValue" className="block text-sm font-medium text-foreground mb-2">
              ICP Token Value (USD)
            </label>
            <input
              type="number"
              id="icpTokenValue"
              step="0.01"
              min="0"
              value={icpTokenValue}
              onChange={(e) => setIcpTokenValue(e.target.value)}
              placeholder="0.00"
              required
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
            <p className="mt-2 text-xs text-muted-foreground">Enter the USD value per ICP token</p>
          </div>

          {icpAmount && icpTokenValue && (
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Calculated Income</p>
              <p className="text-2xl font-bold text-primary">
                $
                {new Intl.NumberFormat('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(parseFloat(icpAmount || '0') * parseFloat(icpTokenValue || '0'))}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={createEntry.isPending}
            className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-soft disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {createEntry.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Adding Entry...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add Entry
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

