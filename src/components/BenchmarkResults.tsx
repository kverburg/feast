import React, { useEffect, useState } from 'react';
import { ArrowLeft, Gauge, RefreshCw } from 'lucide-react';

interface RunSummary {
  id: string;
  startedAt: string;
  task: 'translate' | 'annotate';
  provider: string;
  model: string;
  label: string;
  commit?: string;
  recipes: number;
  meanScore: number;
  structureRate: number;
  checks: Record<string, number>;
  latencyMs: { p50: number; p95: number };
  tokens: { input: number; output: number };
  errors: { recipe: string; message: string }[];
}

const pct = (n: number) => `${Math.round(n * 100)}%`;
const when = (iso: string) => new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

interface Props {
  onBack: () => void;
}

// Results of bench/run.mjs (stored in Cloudflare KV). Runs are grouped per task and per setup, so the trend
// of one provider/model/prompt over time and the comparison between setups are both visible.
export const BenchmarkResults: React.FC<Props> = ({ onBack }) => {
  const [runs, setRuns] = useState<RunSummary[] | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const load = async () => {
    setError('');
    try {
      const res = await fetch('/api/bench', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRuns(await res.json());
    } catch {
      setRuns([]);
      setError('Could not load the benchmark results (they only exist on the deployed app).');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const tasks = ['translate', 'annotate'] as const;

  return (
    <div className="bench-page">
      <div className="bench-head">
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <h2><Gauge size={20} /> AI benchmark</h2>
        <button className="btn btn-secondary btn-sm" onClick={load}>
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>
      <p className="setting-desc">
        Runs from <code>npm run bench</code> or the scheduled job. Score = share of automatic checks passed over the golden recipes.
      </p>
      {error && <p className="setting-desc">{error}</p>}
      {runs && runs.length === 0 && !error && <p className="setting-desc">No runs yet.</p>}

      {runs &&
        tasks.map((task) => {
          const list = runs.filter((r) => r.task === task);
          if (list.length === 0) return null;
          const latest = new Map<string, RunSummary>(); // newest run of each setup, for the comparison
          for (const r of list) {
            const key = `${r.provider}|${r.model}|${r.label}`;
            if (!latest.has(key)) latest.set(key, r);
          }
          return (
            <div key={task} className="bench-card card">
              <h3>{task === 'translate' ? 'Translate' : 'Annotate'}</h3>
              <div className="bench-sub">Latest per setup</div>
              <table className="bench-table">
                <thead>
                  <tr><th>Setup</th><th>Score</th><th>Valid</th><th>p50</th><th>Runs</th></tr>
                </thead>
                <tbody>
                  {[...latest.values()].sort((a, b) => b.meanScore - a.meanScore).map((r) => (
                    <tr key={r.id}>
                      <td>{r.provider} / {r.model}<br /><span className="bench-dim">prompt: {r.label}</span></td>
                      <td><strong>{pct(r.meanScore)}</strong></td>
                      <td>{pct(r.structureRate)}</td>
                      <td>{(r.latencyMs.p50 / 1000).toFixed(1)}s</td>
                      <td>{list.filter((x) => x.provider === r.provider && x.model === r.model && x.label === r.label).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bench-sub">All runs</div>
              {list.map((r) => (
                <div key={r.id} className="bench-run" onClick={() => setOpen(open === r.id ? null : r.id)}>
                  <div className="bench-run-main">
                    <span>{when(r.startedAt)}</span>
                    <span>{r.provider} / {r.model} · {r.label}</span>
                    <strong>{pct(r.meanScore)}</strong>
                  </div>
                  {open === r.id && (
                    <div className="bench-run-detail">
                      {Object.entries(r.checks).map(([name, v]) => (
                        <div key={name}><span>{name.replace(/_/g, ' ')}</span><span>{pct(v)}</span></div>
                      ))}
                      <div><span>p95 latency</span><span>{(r.latencyMs.p95 / 1000).toFixed(1)}s</span></div>
                      <div><span>tokens in / out</span><span>{r.tokens.input} / {r.tokens.output}</span></div>
                      <div><span>recipes</span><span>{r.recipes}</span></div>
                      {r.commit && <div><span>commit</span><span>{r.commit}</span></div>}
                      {r.errors.map((e, i) => (
                        <div key={i} className="bench-err"><span>{e.recipe}</span><span>{e.message.slice(0, 160)}</span></div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}

      <style>{`
        .bench-page { display: flex; flex-direction: column; gap: 1rem; }
        .bench-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap; }
        .bench-head h2 { display: flex; align-items: center; gap: 0.4rem; margin: 0; font-size: 1.2rem; }
        .bench-card { padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .bench-card h3 { margin: 0; }
        .bench-sub { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-dim); margin-top: 0.5rem; }
        .bench-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .bench-table th, .bench-table td { text-align: left; padding: 0.4rem 0.5rem; border-bottom: 1px solid var(--border-color); }
        .bench-dim { color: var(--text-dim); font-size: 0.8rem; }
        .bench-run { border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.5rem 0.7rem; cursor: pointer; }
        .bench-run-main { display: flex; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; font-size: 0.9rem; }
        .bench-run-detail { margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.85rem; color: var(--text-muted); }
        .bench-run-detail > div { display: flex; justify-content: space-between; gap: 1rem; }
        .bench-err { color: #ef4444; }
      `}</style>
    </div>
  );
};
