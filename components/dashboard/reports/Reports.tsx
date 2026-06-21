'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText,
  Loader2,
  Download,
  Shield,
  Database,
  Plus,
  MessageSquare,
  ChevronDown,
  FileBarChart,
  Trash2,
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

interface Conversation {
  id: string;
  conversationId: string;
  blobId: string;
  customerId: string;
  agentId: string;
  messageCount: number;
  verifiedAt: string | null;
  createdAt: string;
  suiTxHash?: string | null;
  contentHash?: string | null;
  metadata?: Record<string, unknown>;
  messages?: Message[];
  isTampered?: boolean;
}

interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

interface ReportData {
  name: string;
  type: 'full' | 'single';
  conversationId?: string;
  summary: {
    totalConversations: number;
    verifiedCount: number;
    tamperedCount: number;
    integrityRate: number;
    totalMessages: number;
  };
  size: number;
}

export function Reports() {
  const { tenant, conversations } = useDashboardData();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [selectedConversationId, setSelectedConversationId] =
    useState<string>('');
  const [reportType, setReportType] = useState<'full' | 'single'>('full');
  const [reportDataCache, setReportDataCache] = useState<{
    tenantName: string;
    generatedBy: string;
    generatedAt: string;
    reportTitle: string;
    summary: Report['summary'];
    conversations: Conversation[];
    qrCodes: Record<string, string>;
    isSingleReport: boolean;
    reportId: string;
  } | null>(null);
  const hasFetched = useRef(false);

  const fetchReportsFromDB = useCallback(async () => {
    if (hasFetched.current) return;

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
      hasFetched.current = true;
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReportsFromDB();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchReportsFromDB]);

  const fetchConversationWithMessages = useCallback(
    async (conv: Conversation) => {
      try {
        const response = await fetch(`/api/walrus/blob/${conv.blobId}`);
        const data = await response.json();

        if (data.success) {
          return {
            ...conv,
            messages: data.messages || [],
            isTampered: data.tampered || false,
          };
        }
        return {
          ...conv,
          messages: [],
          isTampered: false,
        };
      } catch (error) {
        console.error(
          `Failed to fetch messages for ${conv.conversationId}:`,
          error
        );
        return {
          ...conv,
          messages: [],
          isTampered: false,
        };
      }
    },
    []
  );

  const saveReportToDatabase = useCallback(async (reportData: ReportData) => {
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
  }, []);

  const deleteReport = async (reportId: string) => {
    if (!confirm('Delete this report? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/reports/delete?id=${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
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
          (c: Conversation) =>
            c.conversationId === selectedConversationId ||
            c.id === selectedConversationId
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
        targetConversations.map((conv: Conversation) =>
          fetchConversationWithMessages(conv)
        )
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
        await new Promise((resolve) => setTimeout(resolve, 80));
      }

      const total = conversationsWithMessages.length;

      const verified = conversationsWithMessages.filter(
        (c: Conversation) => c.verifiedAt
      ).length;
      const tampered = conversationsWithMessages.filter(
        (c: Conversation) => c.isTampered === true
      ).length;
      const totalMessages = conversationsWithMessages.reduce(
        (acc: number, c: Conversation) => acc + (c.messageCount || 0),
        0
      );

      const summary = {
        totalConversations: total,
        verifiedCount: verified,
        tamperedCount: tampered,
        integrityRate:
          total > 0 ? Math.round(((total - tampered) / total) * 100) : 100,
        totalMessages: totalMessages,
      };

      const reportSize = Math.round(total * 0.5 + 0.5);

      const newReport: Report = {
        id: Date.now().toString(),
        name: reportName,
        generatedBy: tenant?.name || 'Admin',
        generatedAt: new Date().toISOString(),
        size: `${reportSize} MB`,
        status: 'ready',
        type: reportType,
        conversationId:
          reportType === 'single' ? selectedConversationId : undefined,
        summary: summary,
      };

      const savedReport = await saveReportToDatabase({
        name: reportName,
        type: reportType,
        conversationId:
          reportType === 'single' ? selectedConversationId : undefined,
        summary: summary,
        size: reportSize,
      });

      if (savedReport) {
        newReport.id = savedReport.id;
        newReport.generatedBy =
          savedReport.generatedBy || newReport.generatedBy;
        newReport.generatedAt =
          savedReport.generatedAt || newReport.generatedAt;
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

      setReports((prev) => [newReport, ...prev]);
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
      (c: Conversation) =>
        c.conversationId === selectedConversationId ||
        c.id === selectedConversationId
    );
  };

  const getStatusBadge = (status: Report['status']) => {
    const styles = {
      ready: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      generating: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      failed: 'bg-red-500/10 text-red-400 border border-red-500/20',
    };
    const labels = {
      ready: 'Ready',
      generating: 'Generating',
      failed: 'Failed',
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 sm:p-8 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading reports...</p>
      </div>
    );
  }

  const hasConversations = conversations && conversations.length > 0;
  const selectedConv = getSelectedConversation();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileBarChart className="w-4 h-4 text-indigo-400" />
              Generate Report
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate a full compliance report or a single conversation report
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
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
              <span className="text-xs sm:text-sm text-white">Full Report</span>
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
              <span className="text-xs sm:text-sm text-white">
                Single Conversation
              </span>
            </label>
          </div>

          {reportType === 'single' && (
            <div className="w-full sm:w-auto sm:flex-1 sm:max-w-md">
              <div className="relative w-full">
                <select
                  value={selectedConversationId}
                  onChange={(e) => setSelectedConversationId(e.target.value)}
                  className="w-full px-3 py-2 pl-9 appearance-none bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="">Select a conversation...</option>
                  {conversations.map((conv: Conversation) => (
                    <option
                      key={conv.id}
                      value={conv.conversationId || conv.id}
                    >
                      {conv.conversationId?.slice(0, 20)}... ({conv.customerId})
                      - {conv.messageCount} msgs
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
            disabled={
              isGenerating ||
              !hasConversations ||
              (reportType === 'single' && !selectedConversationId)
            }
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2"
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
          <div className="mt-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 flex items-start sm:items-center gap-3">
            <MessageSquare className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm text-white font-medium truncate">
                {selectedConv.conversationId}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500">
                Customer: {selectedConv.customerId} •{' '}
                {selectedConv.messageCount} messages
                {selectedConv.verifiedAt ? ' • Verified' : ' • Pending'}
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

      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Generated Reports
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {reports.length} reports • Cryptographic proof included
            </p>
          </div>
          <span className="text-[10px] text-slate-500">
            {reports.length} reports
          </span>
        </div>

        <div className="divide-y divide-slate-800/50">
          {reports.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
              <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No reports generated yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Click &quot;Generate Report&quot; to create your first report
              </p>
            </div>
          ) : (
            reports.map((report) => {
              let reportConversations = conversations;
              const reportQrCodes = qrCodes;
              const isSingle = report.type === 'single';

              if (report.type === 'single' && report.conversationId) {
                reportConversations = conversations.filter(
                  (c: Conversation) =>
                    c.conversationId === report.conversationId ||
                    c.id === report.conversationId
                );
              }

              const useCachedData =
                reportDataCache && reportDataCache.reportId === report.id;
              const finalConversations = useCachedData
                ? reportDataCache.conversations
                : reportConversations;
              const finalQrCodes = useCachedData
                ? reportDataCache.qrCodes
                : reportQrCodes;

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
                conversations: finalConversations.map((c: Conversation) => ({
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
                  isTampered: c.isTampered || false,
                })),
                qrCodes: finalQrCodes,
                isSingleReport: isSingle,
                reportId: report.id,
              };

              return (
                <div
                  key={report.id}
                  className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-slate-800/20 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                        {report.type === 'single' ? (
                          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                        ) : (
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="text-xs sm:text-sm font-medium text-white truncate max-w-[120px] sm:max-w-none">
                            {report.name}
                          </span>
                          {getStatusBadge(report.status)}
                          <span className="text-[8px] sm:text-[10px] text-slate-500 font-mono bg-slate-800/50 px-1.5 sm:px-2 py-0.5 rounded">
                            {report.type === 'single' ? 'Single' : 'Full'}
                          </span>
                          <span className="text-[8px] sm:text-[10px] text-slate-500 font-mono bg-slate-800/50 px-1.5 sm:px-2 py-0.5 rounded">
                            {report.size}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-0.5">
                          <span className="text-[10px] sm:text-xs text-slate-500">
                            by {report.generatedBy}
                          </span>
                          <span className="w-0.5 h-2 sm:h-3 rounded-full bg-slate-600" />
                          <span className="text-[10px] sm:text-xs text-slate-500">
                            {new Date(report.generatedAt).toLocaleDateString()}
                          </span>
                          {report.summary && (
                            <>
                              <span className="w-0.5 h-2 sm:h-3 rounded-full bg-slate-600" />
                              <span
                                className={`text-[10px] sm:text-xs ${report.summary.integrityRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}
                              >
                                {report.summary.integrityRate}% integrity
                              </span>
                              <span className="hidden xs:inline w-0.5 h-2 sm:h-3 rounded-full bg-slate-600" />
                              <span className="hidden xs:inline text-[10px] sm:text-xs text-slate-500">
                                {report.summary.verifiedCount}/
                                {report.summary.totalConversations} verified
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <PDFDownloadLink
                        document={
                          <ComplianceReportPDF reportData={pdfReportData} />
                        }
                        fileName={`${report.type === 'single' ? 'conversation' : 'compliance'}-report-${new Date().toISOString().slice(0, 10)}.pdf`}
                        className="px-2.5 sm:px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[10px] sm:text-xs font-medium text-white transition-colors shadow-[0_0_15px_rgba(99,102,241,0.15)] flex items-center gap-1 sm:gap-1.5"
                      >
                        {({ loading }) => (
                          <>
                            {loading ? (
                              <>
                                <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                                <span className="hidden xs:inline">
                                  Loading...
                                </span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="hidden xs:inline">
                                  Download
                                </span>
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
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-slate-800/50 bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="text-[8px] sm:text-[10px] text-slate-500">
              Reports stored for 30 days
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Database className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400" />
              <span className="text-[8px] sm:text-[10px] text-slate-400 font-mono">
                Walrus Storage
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
            <span className="text-[8px] sm:text-[10px] text-slate-400 font-mono">
              Cryptographic verification
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
