'use client';

import { useMemo, useState } from 'react';
import Icon from '../../ui/Icon';
import type { MindMapNode, Paper } from '../../../lib/papers/types';

/**
 * Structured breakdown of the paper.
 *
 * The data is a tree: ~6 categories, each holding typed leaves (fact, method,
 * finding, limitation, implication), nested up to three deep.
 *
 * The previous version rendered it as a radial SVG of six 170x50 boxes on a dark
 * canvas, each showing the category name plus its first child truncated to 25
 * characters. Roughly thirty leaf nodes — the actual content — were reachable
 * only by clicking a box one at a time. It looked empty because it was.
 *
 * This lays the tree out so all of it is readable at once, and lets node_type do
 * the work: colour and icon per kind, so findings and limitations are
 * distinguishable at a glance.
 */

interface NodeStyle {
  icon: string;
  dot: string;
  text: string;
  label: string;
}

const NODE_STYLES: Record<string, NodeStyle> = {
  fact: { icon: 'lucide:circle-dot', dot: 'bg-ink/30', text: 'text-ink-soft', label: 'Fact' },
  method: { icon: 'lucide:flask-conical', dot: 'bg-teal', text: 'text-ink-soft', label: 'Method' },
  finding: { icon: 'lucide:trending-up', dot: 'bg-teal-deep', text: 'text-ink', label: 'Finding' },
  limitation: { icon: 'lucide:alert-triangle', dot: 'bg-amber-ink', text: 'text-ink-soft', label: 'Limitation' },
  implication: { icon: 'lucide:lightbulb', dot: 'bg-teal-deep', text: 'text-ink', label: 'Implication' },
};

const DEFAULT_STYLE: NodeStyle = {
  icon: 'lucide:circle-dot',
  dot: 'bg-ink/30',
  text: 'text-ink-soft',
  label: '',
};

const styleFor = (type: string) => NODE_STYLES[type] ?? DEFAULT_STYLE;

/** Icon for a category, picked from what its children mostly are. */
function categoryIcon(node: MindMapNode): string {
  const counts = new Map<string, number>();
  for (const child of node.children) {
    counts.set(child.node_type, (counts.get(child.node_type) ?? 0) + 1);
  }
  const dominant = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  return styleFor(dominant ?? '').icon;
}

const countLeaves = (nodes: MindMapNode[]): number =>
  nodes.reduce((n, node) => n + 1 + countLeaves(node.children), 0);

/** One leaf, plus any children of its own, with an indent guide. */
function Leaf({ node, depth }: { node: MindMapNode; depth: number }) {
  const style = styleFor(node.node_type);

  return (
    <li>
      <div className="flex items-start gap-2.5 py-1.5 group">
        <span className={`mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
        <span className={`text-[13.5px] leading-[1.5] ${style.text}`}>{node.label}</span>
      </div>

      {node.children.length > 0 && (
        <ul className="ml-[3px] pl-4 border-l border-ink/12">
          {node.children.map((child) => (
            <Leaf key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

function CategoryCard({ node }: { node: MindMapNode }) {
  const leaves = countLeaves(node.children);

  return (
    <section className="break-inside-avoid mb-4 bg-paper border border-ink/12 rounded-2xl overflow-hidden">
      <header className="flex items-center gap-2.5 px-5 py-3.5 bg-paper-warm/60 border-b border-ink/10">
        <Icon icon={categoryIcon(node)} className="text-[15px] text-teal-deep shrink-0" />
        <h3 className="text-[13.5px] font-semibold text-ink flex-1 leading-tight">{node.label}</h3>
        <span className="text-[10px] mono-stat text-ink/40 shrink-0">{leaves}</span>
      </header>

      <ul className="px-5 py-3.5">
        {node.children.map((child) => (
          <Leaf key={child.id} node={child} depth={0} />
        ))}
      </ul>
    </section>
  );
}

export default function MindMapPane({ paper }: { paper: Paper }) {
  const [copied, setCopied] = useState(false);
  const nodes = paper.mind_map?.nodes ?? [];

  // Which node types this paper actually uses — the legend shouldn't advertise
  // categories that aren't on screen.
  const usedTypes = useMemo(() => {
    const seen = new Set<string>();
    const walk = (list: MindMapNode[]) => {
      for (const n of list) {
        if (NODE_STYLES[n.node_type]) seen.add(n.node_type);
        walk(n.children);
      }
    };
    walk(nodes);
    return [...seen];
  }, [nodes]);

  const totalNodes = useMemo(() => countLeaves(nodes), [nodes]);

  if (nodes.length === 0) {
    return (
      <section className="bg-paper-warm/50 border border-ink/10 rounded-3xl p-10 text-center">
        <Icon icon="lucide:git-fork" className="text-[48px] text-ink/20 mx-auto mb-4" />
        <h3 className="serif text-[22px] tracking-tight text-ink/40 mb-2">No breakdown</h3>
        <p className="text-[14px] text-ink/40 max-w-[420px] mx-auto">
          We haven&rsquo;t generated a structured breakdown for this paper. The summary and the
          full text are on the other tabs.
        </p>
      </section>
    );
  }

  const downloadJson = () => {
    const blob = new Blob(
      [JSON.stringify({ paper_id: paper.id, title: paper.title, mind_map: paper.mind_map }, null, 2)],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.id}-breakdown.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyOutline = async () => {
    const lines: string[] = [];
    const walk = (list: MindMapNode[], depth: number) => {
      for (const n of list) {
        lines.push(`${'  '.repeat(depth)}${depth === 0 ? '' : '- '}${n.label}`);
        walk(n.children, depth + 1);
      }
    };
    walk(nodes, 0);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink" />
          AGENT 02 &middot; STRUCTURED BREAKDOWN &middot; {totalNodes} NODES
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={copyOutline}
            className="h-8 px-3 rounded-lg border border-ink/15 hover-tint inline-flex items-center gap-1.5 text-[11px] mono-stat font-semibold text-ink-soft"
          >
            <Icon
              icon={copied ? 'lucide:check' : 'lucide:copy'}
              className={`text-[13px] ${copied ? 'text-teal-deep' : 'text-teal'}`}
            />
            {copied ? 'COPIED' : 'COPY OUTLINE'}
          </button>
          <button
            onClick={downloadJson}
            className="h-8 px-3 rounded-lg border border-ink/15 hover-tint inline-flex items-center gap-1.5 text-[11px] mono-stat font-semibold text-ink-soft"
          >
            <Icon icon="lucide:download" className="text-[13px] text-teal" />
            JSON
          </button>
        </div>
      </div>

      {/* Root */}
      <div className="relative bg-ink text-paper rounded-2xl px-6 py-5 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-teal-bright/20 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="text-[10px] mono-stat text-teal-bright mb-2">PAPER</div>
          <h2 className="serif text-[19px] md:text-[22px] leading-[1.3] text-paper max-w-[760px]">
            {paper.mind_map?.source || paper.title}
          </h2>
        </div>
      </div>

      {/* Legend */}
      {usedTypes.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1">
          {usedTypes.map((type) => {
            const style = styleFor(type);
            return (
              <span key={type} className="inline-flex items-center gap-1.5 text-[11px] text-ink/55">
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                {style.label}
              </span>
            );
          })}
        </div>
      )}

      {/*
        Masonry columns: categories vary a lot in length (Methods can carry ten
        nodes, Objective two), and a fixed grid leaves big holes under the short ones.
      */}
      <div className="md:columns-2 md:gap-4">
        {nodes.map((node) => (
          <CategoryCard key={node.id} node={node} />
        ))}
      </div>
    </section>
  );
}
