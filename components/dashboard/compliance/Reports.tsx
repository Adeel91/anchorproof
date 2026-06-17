'use client';

import { useState, useEffect } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Report {
  id: string;
  name: string;
  type: 'compliance' | 'audit' | 'verification';
  format: 'PDF' | 'JSON' | 'CSV';
  generatedBy: string;
  generatedAt: string;
  size: string;
  status: 'ready' | 'generating' | 'failed';
  conversationId?: string;
}

export function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState('');
  const [reportType, setReportType] = useState('compliance');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Mock data
      setReports([
        {
          id: '1',
          name: 'Compliance Report - Q2 2026',
          type: 'compliance',
          format: 'PDF',
          generatedBy: '0x1234...5678',
          generatedAt: new Date().toISOString(),
          size: '2.4 MB',
          status: 'ready',
        },
        {
          id: '2',
          name: 'Audit Trail - June 2026',
          type: 'audit',
          format: 'JSON',
          generatedBy: '0xabcd...efgh',
          generatedAt: new Date(Date.now() - 86400000).toISOString(),
          size: '856 KB',
          status: 'ready',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setReports(prev => [
        {
          id: Date.now().toString(),
          name: `${reportType.toUpperCase()} Report - ${new Date().toLocaleDateString()}`,
          type: reportType as any,
          format: 'PDF',
          generatedBy: 'Current User',
          generatedAt: new Date().toISOString(),
          size: '1.2 MB',
          status: 'ready',
          conversationId: selectedConversation || undefined,
        },
        ...prev,
      ]);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (status: Report['status']) => {
    const styles = {
      ready: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      generating: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      failed: 'bg-red-500/10 text-red-400 border border-red-500/20',
    };
    const labels = { ready: 'Ready', generating: 'Generating', failed: 'Failed' };
    return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${styles[status]}`}>{labels[status]}</span>;
  };

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generate Report Section */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Generate New Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
            >
              <option value="compliance">Compliance Report</option>
              <option value="audit">Audit Report</option>
              <option value="verification">Verification Report</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Conversation (Optional)</label>
            <input
              type="text"
              placeholder="Enter conversation ID..."
              value={selectedConversation}
              onChange={(e) => setSelectedConversation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
          <div className="flex items-end">
            <Button
             variant="primary"
              onClick={generateReport}
              disabled={isGenerating}
              className="w-full px-6 py-2.5 whitespace-nowrap"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </span>
              ) : (
                'Generate Report'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Generated Reports</h3>
          <span className="text-[10px] text-slate-500">{reports.length} reports</span>
        </div>

        <div className="divide-y divide-slate-800/50">
          {reports.map((report) => (
            <div key={report.id} className="px-6 py-4 hover:bg-slate-800/20 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{report.name}</span>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500">{report.type}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span className="text-xs text-slate-500">{report.format}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span className="text-xs text-slate-500">{report.size}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span className="text-xs text-slate-500">by {report.generatedBy.slice(0, 10)}...</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium text-white transition-colors shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                    Download
                  </button>
                  <span className="text-[10px] text-slate-500">
                    {new Date(report.generatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}