'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Database,
  Loader2,
  RefreshCw,
  Brain,
  TrendingUp,
  Sparkles,
  FileText,
  X,
  Trash2,
  Pause,
  Zap,
} from 'lucide-react';

interface AgenticStats {
  status: string;
  lastRun: string | null;
  conversationsVerified: number;
  pendingCount: number;
  pendingConversations?: {
    conversationId: string;
    lastMessageAt: string;
    messageCount: number;
  }[];
  decisions: {
    averageConfidence: number;
    categories: Record<string, number>;
  };
  recentActivity: {
    conversationId: string;
    blobId: string;
    suiTxHash: string;
    verifiedAt: string;
    customerId: string;
    messageCount: number;
    decision: {
      reason: string;
      confidence: number;
      riskScore: number;
      complianceScore: number;
      categories: string[];
    } | null;
  }[];
  config: {
    mode: string;
    criteria: string[];
  };
}

interface AnalysisLog {
  conversationId: string;
  status: 'pending' | 'analyzing' | 'verified' | 'deleted' | 'held' | 'error';
  decision?: {
    reason: string;
    confidence: number;
    riskScore: number;
    complianceScore: number;
    categories: string[];
  };
  messageCount: number;
  timestamp: string;
}

export default function AgenticDashboard() {
  const [stats, setStats] = useState<AgenticStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisLogs, setAnalysisLogs] = useState<AnalysisLog[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>('');

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/agentic/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const runAgent = async () => {
    setRunning(true);
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setAnalysisLogs([]);
    setCurrentStatus('Starting analysis...');
    setShowAnalysisModal(true);

    try {
      const res = await fetch('/api/agentic/run');
      const data = await res.json();

      if (data.logs && data.logs.length > 0) {
        for (let i = 0; i < data.logs.length; i++) {
          const log = data.logs[i];
          setCurrentStatus(`Processing ${i + 1}/${data.logs.length}...`);
          await new Promise((resolve) => setTimeout(resolve, 100));
          setAnalysisLogs((prev) => [...prev, log]);
        }
      }

      setAnalysisComplete(true);
      setCurrentStatus('Complete!');
      await fetchStats();
    } catch (error) {
      console.error('Failed to run agent:', error);
      setAnalysisLogs([
        {
          conversationId: 'Error',
          status: 'error',
          messageCount: 0,
          timestamp: new Date().toISOString(),
          decision: {
            reason: error instanceof Error ? error.message : 'Unknown error',
            confidence: 0,
            riskScore: 0,
            complianceScore: 0,
            categories: ['error'],
          },
        },
      ]);
      setAnalysisComplete(true);
      setCurrentStatus('Failed');
    } finally {
      setRunning(false);
      setIsAnalyzing(false);
    }
  };

  const refreshStats = async () => {
    setRefreshing(true);
    await fetchStats();
  };

  // Fixed: Moved fetchStats call inside useEffect but using a flag to avoid setState warning
  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      if (!isMounted) return;
      await fetchStats();
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatTime = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const truncateText = (text: string | undefined, maxLength: number = 50) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-red-400" />;
      case 'held':
        return <Pause className="w-4 h-4 text-amber-400" />;
      case 'analyzing':
        return <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
      case 'deleted':
        return 'text-red-400 border-red-500/20 bg-red-500/10';
      case 'held':
        return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
      case 'analyzing':
        return 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10';
      case 'error':
        return 'text-red-400 border-red-500/20 bg-red-500/10';
      default:
        return 'text-slate-400 border-slate-700/30 bg-slate-800/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading agentic stats...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400">Failed to load stats</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-400" />
            Agentic Verification Agent
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            AI-powered agent that analyzes unverified conversations and decides
            to verify or delete
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshStats}
            disabled={refreshing}
            className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 border border-slate-700/30"
          >
            {refreshing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Refresh
          </button>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
              stats.status === 'running'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                stats.status === 'running'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            {stats.status === 'running' ? 'Running' : 'Stopped'}
          </span>
          <button
            onClick={runAgent}
            disabled={running || isAnalyzing}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                Analyze Now
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[8px] sm:text-[10px] text-slate-500 uppercase tracking-wider">
              Verified
            </span>
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-white mt-0.5 sm:mt-1">
            {stats.conversationsVerified}
          </div>
          <div className="text-[8px] sm:text-[10px] text-slate-500">
            Agentic verifications
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[8px] sm:text-[10px] text-slate-500 uppercase tracking-wider">
              Pending
            </span>
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-white mt-0.5 sm:mt-1">
            {stats.pendingCount}
          </div>
          <div className="text-[8px] sm:text-[10px] text-slate-500">
            Unverified conversations
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[8px] sm:text-[10px] text-slate-500 uppercase tracking-wider">
              Confidence
            </span>
            <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-white mt-0.5 sm:mt-1">
            {Math.round(stats.decisions?.averageConfidence || 0)}%
          </div>
          <div className="text-[8px] sm:text-[10px] text-slate-500">
            Avg. decision confidence
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[8px] sm:text-[10px] text-slate-500 uppercase tracking-wider">
              Mode
            </span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
          </div>
          <div className="text-sm sm:text-base font-bold text-white mt-0.5 sm:mt-1">
            AI-Powered
          </div>
          <div className="text-[8px] sm:text-[10px] text-slate-500">
            {stats.config?.mode || 'N/A'}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-3 sm:p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[8px] sm:text-[10px] text-slate-500 uppercase tracking-wider">
              Categories
            </span>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-white mt-0.5 sm:mt-1">
            {Object.keys(stats.decisions?.categories || {}).length}
          </div>
          <div className="text-[8px] sm:text-[10px] text-slate-500">
            Decision types
          </div>
        </div>
      </div>

      {stats.decisions?.categories &&
        Object.keys(stats.decisions.categories).length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">
              Decision Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.decisions.categories).map(
                ([category, count]) => (
                  <span
                    key={category}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  >
                    {category}: {count}
                  </span>
                )
              )}
            </div>
          </div>
        )}

      {stats.pendingConversations && stats.pendingConversations.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">
              Pending Conversations
            </h3>
            <span className="ml-auto text-xs text-slate-500">
              {stats.pendingConversations.length} awaiting analysis
            </span>
          </div>
          <div className="space-y-1.5">
            {stats.pendingConversations.slice(0, 5).map((item) => (
              <div
                key={item.conversationId}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-700/30 text-xs"
              >
                <code className="text-white font-mono text-xs">
                  {item.conversationId.slice(0, 16)}...
                </code>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    {item.messageCount} msgs
                  </span>
                  <span className="text-slate-500">
                    {formatTime(item.lastMessageAt)}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px]">
                    Pending
                  </span>
                </div>
              </div>
            ))}
            {stats.pendingConversations.length > 5 && (
              <p className="text-xs text-slate-500 text-center pt-1">
                + {stats.pendingConversations.length - 5} more conversations
              </p>
            )}
          </div>
        </div>
      )}

      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            Recent Agentic Verifications
          </h2>
          <span className="text-xs text-slate-500">
            {stats.recentActivity?.length || 0} records
          </span>
        </div>

        <div className="sm:hidden divide-y divide-slate-800/30">
          {!stats.recentActivity || stats.recentActivity.length === 0 ? (
            <div className="p-8 text-center">
              <Brain className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">
                No agentic verifications yet
              </p>
            </div>
          ) : (
            stats.recentActivity.map((item) => (
              <div
                key={item.conversationId}
                className="px-4 py-3 hover:bg-slate-800/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <code className="text-white text-xs font-mono">
                    {item.conversationId?.slice(0, 16) || 'N/A'}...
                  </code>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      item.decision?.confidence && item.decision.confidence > 70
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {item.decision?.confidence && item.decision.confidence > 70
                      ? 'Verified'
                      : 'Held'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {item.decision?.reason || 'No reason provided'}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    {item.decision?.confidence || 0}%
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {item.decision?.riskScore || 0}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {item.decision?.complianceScore || 0}%
                  </span>
                  {item.suiTxHash && (
                    <button
                      onClick={() =>
                        window.open(`/verify?hash=${item.suiTxHash}`, '_blank')
                      }
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      View Proof
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/30">
              <tr>
                <th className="text-left py-2.5 px-4 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Conversation
                </th>
                <th className="text-left py-2.5 px-4 text-[10px] text-slate-500 font-medium uppercase tracking-wider hidden md:table-cell">
                  Decision
                </th>
                <th className="text-left py-2.5 px-4 text-[10px] text-slate-500 font-medium uppercase tracking-wider hidden lg:table-cell">
                  Reason
                </th>
                <th className="text-left py-2.5 px-4 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Confidence
                </th>
                <th className="text-left py-2.5 px-4 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Risk
                </th>
                <th className="text-left py-2.5 px-4 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Compliance
                </th>
                <th className="text-right py-2.5 px-4 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {!stats.recentActivity || stats.recentActivity.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-slate-500 text-sm"
                  >
                    No agentic verifications yet. The agent will verify
                    conversations after analyzing them.
                  </td>
                </tr>
              ) : (
                stats.recentActivity.map((item) => (
                  <tr
                    key={item.conversationId}
                    className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="py-2.5 px-4">
                      <code className="text-white text-xs font-mono">
                        {item.conversationId?.slice(0, 16) || 'N/A'}...
                      </code>
                    </td>
                    <td className="py-2.5 px-4 hidden md:table-cell">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          item.decision?.confidence &&
                          item.decision.confidence > 70
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {item.decision?.confidence &&
                        item.decision.confidence > 70
                          ? 'Verified'
                          : 'Held'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 hidden lg:table-cell">
                      <span
                        className="text-slate-300 text-xs"
                        title={item.decision?.reason || 'N/A'}
                      >
                        {truncateText(item.decision?.reason)}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`text-xs font-medium ${
                          item.decision?.confidence &&
                          item.decision.confidence > 70
                            ? 'text-emerald-400'
                            : item.decision?.confidence &&
                                item.decision.confidence > 40
                              ? 'text-amber-400'
                              : 'text-red-400'
                        }`}
                      >
                        {item.decision?.confidence || 0}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`text-xs font-medium ${
                          item.decision?.riskScore &&
                          item.decision.riskScore > 70
                            ? 'text-red-400'
                            : item.decision?.riskScore &&
                                item.decision.riskScore > 40
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                        }`}
                      >
                        {item.decision?.riskScore || 0}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`text-xs font-medium ${
                          item.decision?.complianceScore &&
                          item.decision.complianceScore > 70
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {item.decision?.complianceScore || 0}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {item.suiTxHash && (
                        <button
                          onClick={() =>
                            window.open(
                              `/verify?hash=${item.suiTxHash}`,
                              '_blank'
                            )
                          }
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          View Proof
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {stats.config && (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-white">
              Agentic Configuration
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.config.criteria?.map((criterion, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded-lg text-[10px] font-medium bg-slate-800/50 text-slate-300 border border-slate-700/30"
              >
                {criterion}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="text-center text-[10px] text-slate-500 border-t border-slate-800/50 pt-4">
        <span className="flex items-center justify-center gap-2">
          <Shield className="w-3 h-3 text-emerald-400/70" />
          AI-powered decisions for intelligent compliance
        </span>
      </div>

      {showAnalysisModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl shadow-indigo-500/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-800/20">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-white">
                  {isAnalyzing
                    ? 'Analyzing Conversations...'
                    : 'Analysis Complete'}
                </h2>
                {isAnalyzing && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Running
                  </span>
                )}
                {!isAnalyzing && analysisComplete && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3" />
                    Done
                  </span>
                )}
                <span className="ml-2 text-xs text-slate-500">
                  {currentStatus}
                </span>
              </div>
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800/50"
                disabled={isAnalyzing}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)] space-y-2">
              {isAnalyzing && analysisLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                  <p className="text-slate-400 text-sm mt-3">
                    Analyzing conversations...
                  </p>
                  <p className="text-slate-500 text-xs">
                    This may take a moment
                  </p>
                </div>
              ) : analysisLogs.length === 0 && !isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Brain className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="text-slate-400 text-sm">
                    No analysis results yet
                  </p>
                </div>
              ) : (
                <>
                  {analysisLogs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl border ${getStatusColor(log.status)} transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(log.status)}
                            <code className="text-white text-xs font-mono truncate max-w-[200px]">
                              {log.conversationId.length > 20
                                ? log.conversationId.slice(0, 20) + '...'
                                : log.conversationId}
                            </code>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-medium border ${getStatusColor(log.status)}`}
                            >
                              {log.status.charAt(0).toUpperCase() +
                                log.status.slice(1)}
                            </span>
                          </div>
                          {log.decision && (
                            <div className="space-y-1">
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {log.decision.reason}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Brain className="w-3 h-3" />
                                  Confidence:{' '}
                                  <span className="text-white font-medium">
                                    {log.decision.confidence}%
                                  </span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Risk:{' '}
                                  <span className="text-white font-medium">
                                    {log.decision.riskScore}%
                                  </span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  Compliance:{' '}
                                  <span className="text-white font-medium">
                                    {log.decision.complianceScore}%
                                  </span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  {log.decision.categories.join(', ')}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 text-[10px] text-slate-500 whitespace-nowrap">
                          <span>{log.messageCount} msgs</span>
                          <span>{formatTime(log.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isAnalyzing && analysisLogs.length > 0 && (
                    <div className="text-center text-xs text-slate-500 py-2">
                      Processing {analysisLogs.length} conversations...
                    </div>
                  )}

                  {analysisComplete &&
                    !isAnalyzing &&
                    analysisLogs.length > 0 && (
                      <div className="mt-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                        <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm text-emerald-400 font-medium">
                          Analysis Complete
                        </p>
                        <p className="text-xs text-slate-400">
                          {
                            analysisLogs.filter((l) => l.status === 'verified')
                              .length
                          }{' '}
                          verified •
                          {
                            analysisLogs.filter((l) => l.status === 'deleted')
                              .length
                          }{' '}
                          deleted •
                          {
                            analysisLogs.filter((l) => l.status === 'held')
                              .length
                          }{' '}
                          held
                        </p>
                      </div>
                    )}
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-800/50 bg-slate-800/10 flex justify-end">
              <button
                onClick={() => setShowAnalysisModal(false)}
                disabled={isAnalyzing}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isAnalyzing
                    ? 'bg-slate-700/30 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Close'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
