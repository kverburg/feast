import React, { useEffect, useState } from 'react';
import { Activity, ArrowLeft, Loader2, RotateCcw, X, Trash2, RefreshCw } from 'lucide-react';
import { LogEntry, clearLog, getLog, pullActivity, subscribeLog } from '../services/activityLog';
import { ImportJob, dismissImport, getImportJobs, retryImport, subscribeImportJobs } from '../services/importQueue';

const KIND_LABEL: Record<LogEntry['kind'], string> = {
  import: 'Import',
  translate: 'Translate',
  reparse: 'AI re-parse',
  annotate: 'Annotate',
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });

const formatDuration = (entry: LogEntry): string => {
  if (!entry.ended) return '';
  const seconds = Math.max(0, Math.round((new Date(entry.ended).getTime() - new Date(entry.started).getTime()) / 1000));
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

const PAGE_SIZE = 100;

interface ActivityLogProps {
  onBack: () => void;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<LogEntry[]>(getLog());
  const [jobs, setJobs] = useState<ImportJob[]>(getImportJobs());
  const [shown, setShown] = useState(PAGE_SIZE);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribeLog = subscribeLog(() => setEntries([...getLog()]));
    const unsubscribeJobs = subscribeImportJobs(() => setJobs([...getImportJobs()]));
    void pullActivity(); // bring in what other devices logged
    return () => {
      unsubscribeLog();
      unsubscribeJobs();
    };
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await pullActivity();
    setRefreshing(false);
  };

  return (
    <div className="activity-page">
      <button className="btn btn-secondary btn-sm activity-back" onClick={onBack}>
        <ArrowLeft size={16} />
        <span>Settings</span>
      </button>
    <div className="settings-card card">
      <div className="card-sec-header">
        <Activity size={20} color="var(--accent-primary)" />
        <h3>Activity log</h3>
      </div>
      <p className="setting-desc">
        Imports, translations and AI re-parses: when they started, what was used and how they ended. Shared across your
        devices (last 2000).
      </p>

      {jobs.length > 0 && (
        <div className="activity-jobs">
          <h4>Imports in progress or failed</h4>
          {jobs.map((job) => (
            <div key={job.id} className={`activity-job ${job.status}`}>
              {job.status === 'failed' ? null : <Loader2 size={16} className="spin-icon" />}
              <div className="activity-job-text">
                <span className="activity-label">{job.label}</span>
                <span className="activity-detail">
                  {job.status === 'queued' ? 'Waiting…' : job.status === 'running' ? 'Importing…' : job.error}
                </span>
              </div>
              {job.status === 'failed' && (
                <>
                  <button className="btn btn-outline btn-sm" onClick={() => retryImport(job.id)} title="Try again">
                    <RotateCcw size={14} />
                    <span>Retry</span>
                  </button>
                  <button className="btn btn-secondary btn-icon" onClick={() => dismissImport(job.id)} title="Dismiss">
                    <X size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="activity-toolbar">
        <span className="setting-desc">{entries.length} entries</span>
        <div className="activity-toolbar-buttons">
          <button className="btn btn-secondary btn-sm" onClick={refresh} disabled={refreshing}>
            <RefreshCw size={14} />
            <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
          </button>
          <button
            className="btn btn-outline btn-sm danger"
            disabled={entries.length === 0}
            onClick={() => {
              if (confirm('Clear the activity log on this device? Other devices keep their copy.')) clearLog();
            }}
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="setting-desc">Nothing yet. Imports and translations will show up here.</p>
      ) : (
        <div className="activity-list">
          {entries.slice(0, shown).map((e) => (
            <div key={e.id} className={`activity-row ${e.status}`}>
              <div className="activity-main">
                <span className={`activity-kind kind-${e.kind}`}>{KIND_LABEL[e.kind]}</span>
                <span className="activity-label">{e.label}</span>
                <span className={`activity-status status-${e.status}`}>{e.status}</span>
              </div>
              <div className="activity-meta">
                <span>{formatTime(e.started)}</span>
                {e.ended && <span>took {formatDuration(e)}</span>}
                {e.method && <span>{e.method}</span>}
              </div>
              {e.detail && <div className="activity-detail">{e.detail}</div>}
            </div>
          ))}
          {entries.length > shown && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShown(shown + PAGE_SIZE)}>
              Show more
            </button>
          )}
        </div>
      )}

      </div>

      <style>{`
        .activity-page { display: flex; flex-direction: column; gap: 1rem; }
        .activity-back { align-self: flex-start; }
        .activity-page .settings-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .activity-page .card-sec-header { display: flex; align-items: center; gap: 0.6rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; }
        .activity-page .setting-desc { font-size: 0.84rem; color: var(--text-muted); }
        .activity-jobs { display: flex; flex-direction: column; gap: 0.5rem; margin: 1rem 0; }
        .activity-jobs h4 { font-size: 0.9rem; color: var(--text-muted); }
        .activity-job {
          display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0.75rem;
          background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-md);
        }
        .activity-job.failed { border-color: rgba(239, 68, 68, 0.5); }
        .activity-job-text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .activity-toolbar { display: flex; justify-content: space-between; align-items: center; margin: 1rem 0 0.5rem; gap: 0.5rem; flex-wrap: wrap; }
        .activity-toolbar-buttons { display: flex; gap: 0.5rem; }
        .activity-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .activity-row { padding: 0.6rem 0.75rem; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.88rem; }
        .activity-row.failed { border-color: rgba(239, 68, 68, 0.45); }
        .activity-main { display: flex; align-items: center; gap: 0.5rem; }
        .activity-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-main); font-weight: 600; }
        .activity-kind { font-size: 0.7rem; font-weight: 700; padding: 0.1rem 0.45rem; border-radius: var(--radius-full); background: var(--badge-bg); color: var(--badge-text); white-space: nowrap; }
        .activity-status { font-size: 0.75rem; font-weight: 700; text-transform: capitalize; }
        .status-done { color: #10b981; }
        .status-failed { color: #ef4444; }
        .status-running, .status-retrying { color: var(--accent-primary); }
        .activity-meta { display: flex; gap: 0.75rem; flex-wrap: wrap; color: var(--text-dim); font-size: 0.78rem; margin-top: 0.2rem; }
        .activity-detail { color: var(--text-muted); font-size: 0.8rem; margin-top: 0.2rem; overflow-wrap: anywhere; }
      `}</style>
    </div>
  );
};
