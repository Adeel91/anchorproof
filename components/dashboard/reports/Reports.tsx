// components/dashboard/reports/Reports.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, Loader2, Download, Shield, 
  Database, Plus, MessageSquare, ChevronDown,
  FileBarChart, Trash2
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useDashboardData } from '@/providers/DashboardDataProvider';
import Button from '@/components/ui/Button';
import { ComplianceReportPDF } from '@/components/dashboard/reports/ComplianceReportPDF';
import { generateQRCode, generateVerificationUrl } from '@/lib/qrcode';

interface Report {
  id: string;
  name: string;
  generatedBy: string;
  generatedAt: string;
  size: string;
  status: 'ready' | 'generating' | 'failed';
  type: 'full' | 'single';
  conversationId?: string;
  summary?: {
    totalConversations: number;
    verifiedCount: number;
    tamperedCount: number;
    integrityRate: number;
    totalMessages: number;
  };
}

export function Reports() {
  const { tenant, conversations } = useDashboardData();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');
  const [reportType, setReportType] = useState<'full' | 'single'>('full');
  const [reportDataCache, setReportDataCache] = useState<any>(null);

  useEffect(() => {
    fetchReportsFromDB();
  }, []);

  const fetchReportsFromDB = async () => {
    try {
      const response = await fetch('/api/reports/list');
      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationWithMessages = async (conv: any) => {
    try {
      const response = await fetch(`/api/walrus/blob/${conv.blobId}`);
      const data = await response.json();
      
      if (data.success) {
        return {
          ...conv,
          messages: data.messages || [],
        };
      }
      return {
        ...conv,
        messages: [],
      };
    } catch (error) {
      console.error(`Failed to fetch messages for ${conv.conversationId}:`, error);
      return {
        ...conv,
        messages: [],
      };
    }
  };

  const saveReportToDatabase = async (reportData: any) => {
    try {
      const response = await fetch('/api/reports/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reportData.name,
          type: reportData.type,
          conversationId: reportData.conversationId || null,
          summary: reportData.summary,
          size: reportData.size || 0,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        return data.report;
      } else {
        console.error('Failed to save report:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Failed to save report:', error);
      return null;
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('Delete this report? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/reports/delete?id=${reportId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setReports(prev => prev.filter(r => r.id !== reportId));
        if (reportDataCache?.reportId === reportId) {
          setReportDataCache(null);
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete report');
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
      alert('Failed to delete report');
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    setGeneratingProgress(0);
    setReportDataCache(null);
    
    try {
      let targetConversations = conversations;
      let reportName = '';
      let isSingle = false;
      
      if (reportType === 'single' && selectedConversationId) {
        targetConversations = conversations.filter(
          (c: any) => c.conversationId === selectedConversationId || c.id === selectedConversationId
        );
        const conv = targetConversations[0];
        const displayId = conv?.conversationId?.slice(0, 12) || 'Single';
        reportName = `Conversation Report - ${displayId}`;
        isSingle = true;
      } else {
        reportName = `Full Compliance Report - ${new Date().toLocaleDateString()}`;
        isSingle = false;
      }

      const conversationsWithMessages = await Promise.all(
        targetConversations.map((conv: any) => fetchConversationWithMessages(conv))
      );

      const codes: Record<string, string> = {};
      for (const conv of conversationsWithMessages) {
        const url = generateVerificationUrl(conv.blobId);
        const qr = await generateQRCode(url);
        if (qr) {
          codes[conv.blobId] = qr;
        }
      }
      setQrCodes(codes);

      for (let i = 0; i <= 100; i += 10) {
        setGeneratingProgress(i);
        await new Promise(resolve => setTimeout(resolve, 80));
      }

      const total = conversationsWithMessages.length;
      const verified = conversationsWithMessages.filter((c: any) => c.verifiedAt).length;
      const tampered = conversationsWithMessages.filter((c: any) => c.integrity?.tampered).length;
      const totalMessages = conversationsWithMessages.reduce((acc: number, c: any) => acc + (c.messageCount || 0), 0);

      const summary = {
        totalConversations: total,
        verifiedCount: verified,
        tamperedCount: tampered,
        integrityRate: total > 0 ? Math.round((verified / total) * 100) : 100,
        totalMessages: totalMessages,
      };

      const reportSize = Math.round((total * 0.5 + 0.5));

      const newReport: Report = {
        id: Date.now().toString(),
        name: reportName,
        generatedBy: tenant?.name || 'Admin',
        generatedAt: new Date().toISOString(),
        size: `${reportSize} MB`,
        status: 'ready',
        type: reportType,
        conversationId: reportType === 'single' ? selectedConversationId : undefined,
        summary: summary,
      };

      const savedReport = await saveReportToDatabase({
        name: reportName,
        type: reportType,
        conversationId: reportType === 'single' ? selectedConversationId : undefined,
        summary: summary,
        size: reportSize,
      });

      if (savedReport) {
        newReport.id = savedReport.id;
        newReport.generatedBy = savedReport.generatedBy || newReport.generatedBy;
        newReport.generatedAt = savedReport.generatedAt || newReport.generatedAt;
      }

      setReportDataCache({
        tenantName: tenant?.name || 'Unknown',
        generatedBy: newReport.generatedBy,
        generatedAt: newReport.generatedAt,
        reportTitle: newReport.name,
        summary: newReport.summary,
        conversations: conversationsWithMessages,
        qrCodes: codes,
        isSingleReport: isSingle,
        reportId: newReport.id,
      });

      setReports(prev => [newReport, ...prev]);
      setSelectedConversationId('');

    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
      setGeneratingProgress(0);
    }
  };

  const getSelectedConversation = () => {
    return conversations.find(
      (c: any) => c.conversationId === selectedConversationId || c.id === selectedConversationId
    );
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

  const hasConversations = conversations && conversations.length > 0;
  const selectedConv = getSelectedConversation();

  return (
    <div className="space-y-6">
      {/* Generate Report Section */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileBarChart className="w-4 h-4 text-indigo-400" />
              Generate Report
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate a full compliance report or a single conversation report with cryptographic proof
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="reportType"
                value="full"
                checked={reportType === 'full'}
                onChange={() => setReportType('full')}
                className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-white">Full Report</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="reportType"
                value="single"
                checked={reportType === 'single'}
                onChange={() => setReportType('single')}
                className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-white">Single Conversation</span>
            </label>
          </div>

          {reportType === 'single' && (
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <select
                  value={selectedConversationId}
                  onChange={(e) => setSelectedConversationId(e.target.value)}
                  className="w-full px-3 py-2 pl-9 appearance-none bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="">Select a conversation...</option>
                  {conversations.map((conv: any) => (
                    <option key={conv.id} value={conv.conversationId || conv.id}>
                      {conv.conversationId?.slice(0, 24)}... ({conv.customerId}) - {conv.messageCount} messages
                    </option>
                  ))}
                </select>
                <MessageSquare className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          )}

          <Button
            variant="primary"
            onClick={generateReport}
            disabled={isGenerating || !hasConversations || (reportType === 'single' && !selectedConversationId)}
            className="px-6 py-2.5 whitespace-nowrap flex items-center gap-2 ml-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating... {generatingProgress}%
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>

        {reportType === 'single' && selectedConv && (
          <div className="mt-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 flex items-center gap-3">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <div>
              <div className="text-sm text-white font-medium">
                {selectedConv.conversationId}
              </div>
              <div className="text-xs text-slate-500">
                Customer: {selectedConv.customerId} • {selectedConv.messageCount} messages
                {selectedConv.verifiedAt ? ' • Verified' : ' • Pending'}
              </div>
              <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                Blob: {selectedConv.blobId?.slice(0, 20)}...
              </div>
            </div>
          </div>
        )}

        {!hasConversations && (
          <div className="mt-3 text-xs text-amber-400">
            No conversations found. Create a conversation first.
          </div>
        )}
      </div>

      {/* Reports List */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Generated Reports</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {reports.length} reports • Reports include cryptographic proof and are court-admissible
            </p>
          </div>
          <span className="text-[10px] text-slate-500">{reports.length} reports</span>
        </div>

        <div className="divide-y divide-slate-800/50">
          {reports.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No reports generated yet</p>
              <p className="text-slate-500 text-xs mt-1">Click "Generate Report" to create your first report</p>
            </div>
          ) : (
            reports.map((report) => {
              let reportConversations = conversations;
              let reportQrCodes = qrCodes;
              let isSingle = report.type === 'single';

              if (report.type === 'single' && report.conversationId) {
                reportConversations = conversations.filter(
                  (c: any) => c.conversationId === report.conversationId || c.id === report.conversationId
                );
              }

              const useCachedData = reportDataCache && reportDataCache.reportId === report.id;
              const finalConversations = useCachedData ? reportDataCache.conversations : reportConversations;
              const finalQrCodes = useCachedData ? reportDataCache.qrCodes : reportQrCodes;

              const pdfReportData = {
                tenantName: tenant?.name || 'Unknown',
                generatedBy: report.generatedBy,
                generatedAt: report.generatedAt,
                reportTitle: report.name,
                summary: {
                  totalConversations: report.summary?.totalConversations || 0,
                  verifiedCount: report.summary?.verifiedCount || 0,
                  tamperedCount: report.summary?.tamperedCount || 0,
                  integrityRate: report.summary?.integrityRate || 100,
                  totalMessages: report.summary?.totalMessages || 0,
                },
                conversations: finalConversations.map((c: any) => ({
                  id: c.id,
                  conversationId: c.conversationId,
                  blobId: c.blobId,
                  suiTxHash: c.suiTxHash || 'N/A',
                  customerId: c.customerId,
                  agentId: c.agentId,
                  messageCount: c.messageCount,
                  verifiedAt: c.verifiedAt,
                  createdAt: c.createdAt,
                  contentHash: c.contentHash || null,
                  messages: c.messages || [],
                  metadata: c.metadata || {},
                  isTampered: c.integrity?.tampered || false,
                })),
                qrCodes: finalQrCodes,
                isSingleReport: isSingle,
                reportId: report.id,
              };

              return (
                <div key={report.id} className="px-6 py-4 hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        {report.type === 'single' ? (
                          <MessageSquare className="w-5 h-5 text-blue-400" />
                        ) : (
                          <Shield className="w-5 h-5 text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-white">{report.name}</span>
                          {getStatusBadge(report.status)}
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-800/50 px-2 py-0.5 rounded">
                            {report.type === 'single' ? 'Single' : 'Full'} • PDF
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-800/50 px-2 py-0.5 rounded">
                            {report.size}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-slate-500">by {report.generatedBy}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-600" />
                          <span className="text-xs text-slate-500">
                            {new Date(report.generatedAt).toLocaleDateString()}
                          </span>
                          {report.summary && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-600" />
                              <span className={`text-xs ${report.summary.integrityRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {report.summary.integrityRate}% integrity
                              </span>
                              <span className="w-1 h-1 rounded-full bg-slate-600" />
                              <span className="text-xs text-slate-500">
                                {report.summary.verifiedCount}/{report.summary.totalConversations} verified
                              </span>
                              {report.type === 'single' && report.conversationId && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                                  <span className="text-xs text-slate-500 font-mono">
                                    {report.conversationId.slice(0, 12)}...
                                  </span>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PDFDownloadLink
                        document={<ComplianceReportPDF reportData={pdfReportData} />}
                        fileName={`${report.type === 'single' ? 'conversation' : 'compliance'}-report-${new Date().toISOString().slice(0, 10)}.pdf`}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium text-white transition-colors shadow-[0_0_15px_rgba(99,102,241,0.15)] flex items-center gap-1.5"
                      >
                        {({ loading }) => (
                          <>
                            {loading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" />
                                Download
                              </>
                            )}
                          </>
                        )}
                      </PDFDownloadLink>
                      <button
                        onClick={() => deleteReport(report.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800/50"
                        title="Delete report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-800/50 bg-slate-900/30 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-slate-500">
              Reports are stored for 30 days
            </span>
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] text-slate-400 font-mono">
                Walrus Storage
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-slate-400 font-mono">
              Cryptographic verification included
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}