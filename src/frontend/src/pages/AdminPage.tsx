import { useState, useEffect, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useIsAdmin,
  useGetPersons,
  useCreatePerson,
  useBootstrapAdmin,
  useDeletePerson,
  useGetEntries,
  useDeleteEntry,
} from '../hooks/useQueries';
import LoginButton from '../components/LoginButton';
import { Shield, AlertCircle, CheckCircle, Loader2, Plus, Users, UserPlus, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isCheckingAdmin, isFetched: isAdminFetched, refetch: refetchIsAdmin } = useIsAdmin();
  const { data: persons = [], isLoading: personsLoading } = useGetPersons();
  const { data: entries = [], isLoading: entriesLoading } = useGetEntries();
  const createPerson = useCreatePerson();
  const bootstrapAdmin = useBootstrapAdmin();
  const deletePerson = useDeletePerson();
  const deleteEntry = useDeleteEntry();

  const [personName, setPersonName] = useState('');
  const [showPersonSuccess, setShowPersonSuccess] = useState(false);
  const [deletingPersonId, setDeletingPersonId] = useState<bigint | null>(null);
  const [deletingEntryTimestamp, setDeletingEntryTimestamp] = useState<bigint | null>(null);

  const isAuthenticated = !!identity;
  const bootstrapAttemptedRef = useRef(false);

  // Bootstrap admin on first authenticated visit to /admin
  useEffect(() => {
    if (isAuthenticated && !bootstrapAttemptedRef.current) {
      bootstrapAttemptedRef.current = true;
      bootstrapAdmin.mutate(undefined, {
        onSuccess: () => {
          // Refetch admin status after bootstrap completes
          refetchIsAdmin();
        },
      });
    }
  }, [isAuthenticated, bootstrapAdmin, refetchIsAdmin]);

  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!personName.trim()) {
      return;
    }

    try {
      await createPerson.mutateAsync({ name: personName.trim() });
      setPersonName('');
      setShowPersonSuccess(true);
      setTimeout(() => setShowPersonSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to create person:', error);
    }
  };

  const handleDeletePerson = async (personId: bigint) => {
    setDeletingPersonId(personId);
    try {
      await deletePerson.mutateAsync({ personId });
    } catch (error) {
      console.error('Failed to delete person:', error);
    } finally {
      setDeletingPersonId(null);
    }
  };

  const handleDeleteEntry = async (timestamp: bigint) => {
    setDeletingEntryTimestamp(timestamp);
    try {
      await deleteEntry.mutateAsync({ timestamp });
    } catch (error) {
      console.error('Failed to delete entry:', error);
    } finally {
      setDeletingEntryTimestamp(null);
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
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

  // Show loading while checking admin status or bootstrapping
  if (isCheckingAdmin || bootstrapAdmin.isPending || (bootstrapAttemptedRef.current && !isAdminFetched)) {
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h2>
          <p className="text-muted-foreground">Manage persons and income entries</p>
        </div>
        <LoginButton />
      </div>

      {showPersonSuccess && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-sm text-foreground">Person created successfully!</p>
        </div>
      )}

      {/* Create Person Form */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Create Person</h3>
            <p className="text-sm text-muted-foreground">Add a new person to track income</p>
          </div>
        </div>

        <form onSubmit={handleCreatePerson} className="space-y-4">
          <div>
            <label htmlFor="personName" className="block text-sm font-medium text-foreground mb-2">
              Person Name
            </label>
            <input
              id="personName"
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Enter person name"
              className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={createPerson.isPending || !personName.trim()}
            className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {createPerson.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Person
              </>
            )}
          </button>
        </form>
      </div>

      {/* Manage Persons */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Manage Persons</h3>
            <p className="text-sm text-muted-foreground">Delete persons and their associated entries</p>
          </div>
        </div>

        {personsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : persons.length === 0 ? (
          <div className="text-center py-8 px-4 bg-muted/30 rounded-lg border border-border">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No persons available.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {persons.map((person) => (
              <div
                key={person.id.toString()}
                className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{person.name}</p>
                  <p className="text-sm text-muted-foreground">ID: {person.id.toString()}</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deletingPersonId === person.id}
                    >
                      {deletingPersonId === person.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Person</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {person.name}? This will also delete all income entries
                        associated with this person. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeletePerson(person.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manage Income Entries */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Manage Income Entries</h3>
            <p className="text-sm text-muted-foreground">Delete individual income entries</p>
          </div>
        </div>

        {entriesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 px-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">No income entries available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Person</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">ICP Amount</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Income</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const person = persons.find((p) => p.id === entry.personId);
                  return (
                    <tr
                      key={entry.timestamp.toString()}
                      className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-foreground">{formatDate(entry.date)}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{person?.name || 'Unknown'}</td>
                      <td className="py-3 px-4 text-sm text-right font-mono text-muted-foreground">
                        {formatNumber(entry.icpAmount)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-mono font-semibold text-primary">
                        ${formatNumber(entry.incomeValue)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deletingEntryTimestamp === entry.timestamp}
                            >
                              {deletingEntryTimestamp === entry.timestamp ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-destructive" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Income Entry</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this income entry from {formatDate(entry.date)}? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteEntry(entry.timestamp)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
