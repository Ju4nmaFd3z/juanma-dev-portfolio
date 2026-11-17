import React from 'react';
import type { Milestone } from '../translations';
import { KIND_COLORS, hex } from '../content';

// The career as `git log --graph --oneline`, drawn in text for the terminal:
// education is the `main` lane, work and certifications run beside it.

const LANE_COLOR = { edu: hex(KIND_COLORS.edu), work: hex(KIND_COLORS.work), cert: hex(KIND_COLORS.cert) };
const LANES: Milestone['kind'][] = ['edu', 'work', 'cert'];
/** HEAD sits on what is happening now. */
const HEAD_ID = 'dam';

/** A stable, git-looking short hash for an id. */
const shortHash = (s: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return ((h >>> 0).toString(16) + 'a3f9c1e').slice(0, 7);
};

interface Props {
  /** Newest first, like git. */
  items: Milestone[];
  branches: Record<Milestone['kind'], string>;
  active?: string;
  onPick?: (id: string) => void;
  /** Hide the period column (narrow panels). */
  dates?: boolean;
}

export const GitGraph: React.FC<Props> = ({ items, branches, active, onPick, dates = true }) => {
  const oldest: Record<string, number> = { edu: items.length - 1 };
  items.forEach((m, i) => { if (m.kind !== 'edu') oldest[m.kind] = Math.max(oldest[m.kind] ?? -1, i); });
  const seen = new Set<string>();

  return (
    <div className="font-mono">
      {items.map((m, i) => {
        const ref = !seen.has(m.kind) ? (seen.add(m.kind), branches[m.kind]) : null;
        const head = m.id === HEAD_ID;
        const on = active === m.id;
        const line = (
          <>
            <span aria-hidden="true">
              {LANES.map((k) => (i > oldest[k] ? '  ' : <span key={k} style={{ color: LANE_COLOR[k] }}>{m.kind === k ? '* ' : '| '}</span>))}
            </span>
            <span className="text-[#ffc078]">{shortHash(m.id)}</span>{' '}
            {(head || ref) && (
              <span className="text-[#958c80]">
                ({head && <span className="text-[#56d4dd]">HEAD -&gt; </span>}
                <span style={{ color: LANE_COLOR[m.kind] }}>{head ? branches.edu : ref}</span>){' '}
              </span>
            )}
            <span className={on ? 'text-white' : 'text-[#f4eee4]'}>{m.short}</span>
            {dates && <span className="text-[#958c80]">  {m.period}</span>}
          </>
        );
        return onPick ? (
          <button
            key={m.id}
            type="button"
            onClick={() => onPick(m.id)}
            aria-current={on ? 'step' : undefined}
            className={`block w-full text-left whitespace-pre rounded px-2 -mx-2 py-[3px] transition-colors ${on ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'}`}
          >
            {line}
          </button>
        ) : (
          <p key={m.id} className="whitespace-pre">{line}</p>
        );
      })}
    </div>
  );
};
