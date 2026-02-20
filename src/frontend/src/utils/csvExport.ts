import type { IncomeEntry } from '../backend';

/**
 * Formats a timestamp (nanoseconds since epoch) to YYYY-MM-DD format
 */
function formatDate(timestamp: bigint): string {
  const milliseconds = Number(timestamp / 1_000_000n);
  const date = new Date(milliseconds);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Formats a number with 2 decimal places
 */
function formatNumber(value: number): string {
  return value.toFixed(2);
}

/**
 * Escapes CSV field values to handle commas, quotes, and newlines
 */
function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Converts income entries to CSV format and triggers browser download
 */
export function exportToCSV(entries: IncomeEntry[]): void {
  // CSV header
  const headers = ['Date', 'ICP Amount', 'Token Value', 'Income'];
  
  // CSV rows
  const rows = entries.map(entry => {
    const date = formatDate(entry.date);
    const icpAmount = formatNumber(entry.icpAmount);
    const tokenValue = formatNumber(entry.icpTokenValue);
    const income = formatNumber(entry.incomeValue);
    
    return [date, icpAmount, tokenValue, income].map(escapeCsvField).join(',');
  });
  
  // Combine header and rows
  const csvContent = [headers.join(','), ...rows].join('\n');
  
  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'income-entries.csv';
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}
