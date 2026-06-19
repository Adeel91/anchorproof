// components/dashboard/audit/ExportButton.tsx
'use client';

import { useState } from 'react';
import { Download, ChevronDown, FileSpreadsheet, FileJson } from 'lucide-react';

interface ExportButtonProps {
  records: any[];
  disabled?: boolean;
}

export function ExportButton({ records, disabled = false }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (format: 'csv' | 'json') => {
    setIsExporting(true);
    setIsOpen(false);

    try {
      if (format === 'csv') {
        exportToCSV(records);
      } else {
        exportToJSON(records);
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getDetailText = (record: any) => {
    const details = record.details;
    if (!details || typeof details !== 'object') return details || 'No details';

    const actionMap: Record<string, string> = {
      CONVERSATION_SAVED: `Saved ${details.messageCount || 0} messages`,
      CONVERSATION_VERIFIED: 'Verified successfully',
      TAMPER_DETECTED: 'Tampering detected!',
      API_KEY_CREATED: `Created "${details.keyName}"`,
      API_KEY_REVOKED: `Revoked "${details.keyName}"`,
      TENANT_UPDATED: `Renamed from "${details.oldName}" to "${details.newName}"`,
    };

    return actionMap[record.action] || JSON.stringify(details).slice(0, 50);
  };

  const exportToCSV = (data: any[]) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Action', 'Actor', 'Email', 'Details', 'Timestamp'];
    
    const rows = data.map((record) => [
      record.action,
      record.actorName || 'Unknown',
      record.actorEmail || '',
      getDetailText(record).replace(/,/g, ';'),
      new Date(record.timestamp).toLocaleString(),
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach((row) => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportToJSON = (data: any[]) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const jsonData = data.map((record) => ({
      action: record.action,
      actor: record.actorName || 'Unknown',
      email: record.actorEmail || '',
      details: getDetailText(record),
      blobId: record.blobId || '',
      conversationId: record.conversationId || '',
      timestamp: new Date(record.timestamp).toISOString(),
    }));

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-log-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (disabled || records.length === 0) {
    return (
      <button
        disabled
        className="px-3 py-1.5 bg-slate-700/50 rounded-lg text-xs font-medium text-slate-500 cursor-not-allowed flex items-center gap-1.5"
      >
        <Download className="w-3.5 h-3.5" />
        Export
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
      >
        {isExporting ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            Export
            <ChevronDown className="w-3 h-3" />
          </>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 z-50 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
            <button
              onClick={() => handleExport('csv')}
              className="w-full px-4 py-2 text-left text-xs text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-green-400" />
              CSV (Excel)
            </button>
            <button
              onClick={() => handleExport('json')}
              className="w-full px-4 py-2 text-left text-xs text-white hover:bg-slate-700 transition-colors flex items-center gap-2 border-t border-slate-700"
            >
              <FileJson className="w-3.5 h-3.5 text-yellow-400" />
              JSON (API)
            </button>
          </div>
        </>
      )}
    </div>
  );
}