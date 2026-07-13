'use client';

import { useState, useRef } from 'react';
import Icon from '../../ui/Icon';
import type { Paper } from '../../../lib/papers/types';

interface MindMapNode {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  w: number;
  h: number;
  accent?: 'amber' | 'teal';
  source?: string;
  fullText?: string;
}

interface MindMapChild {
  id: string;
  label: string;
  node_type: string;
  children?: MindMapChild[];
}

/**
 * Matches the API: mind_map is {nodes, source}. This used to be declared as
 * {root, children}, so `mindMapData.children` was always undefined and the map
 * rendered empty for every paper.
 */
interface MindMapData {
  source: string;
  nodes: MindMapChild[];
}

export default function MindMapPane({ paper }: { paper: Paper }) {
  const [layoutMode, setLayoutMode] = useState<'spatial' | 'radial'>('radial');
  const [zoom, setZoom] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Parse mind_map from backend
  const mindMapData = paper.mind_map as unknown as MindMapData | undefined;

  // Convert backend mind_map to visual nodes
  const generateNodes = (): MindMapNode[] => {
    if (!mindMapData?.nodes) return [];

    const nodes: MindMapNode[] = [];
    const categories = mindMapData.nodes;

    if (layoutMode === 'radial') {
      const centerX = 450;
      const centerY = 310;
      const radius = 220;
      const angleStep = (2 * Math.PI) / Math.max(categories.length, 1);

      categories.forEach((category, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius - 85;
        const y = centerY + Math.sin(angle) * radius - 25;

        const childLabels = category.children?.map(c => c.label).join('. ') || '';
        const fullText = category.children?.map(c => {
          const subChildren = c.children?.map(sc => sc.label).join(', ');
          return subChildren ? `${c.label}: ${subChildren}` : c.label;
        }).join('. ') || category.label;

        nodes.push({
          id: category.id,
          label: category.label.toUpperCase(),
          sublabel: category.children?.[0]?.label?.slice(0, 25) || '',
          x,
          y,
          w: 170,
          h: 50,
          accent: category.node_type === 'finding' ? 'amber' : 'teal',
          source: childLabels,
          fullText: fullText,
        });
      });
    } else {
      const startX = 100;
      const startY = 80;
      const gapX = 280;
      const gapY = 180;
      const cols = 3;

      categories.forEach((category, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        const childLabels = category.children?.map(c => c.label).join('. ') || '';
        const fullText = category.children?.map(c => {
          const subChildren = c.children?.map(sc => sc.label).join(', ');
          return subChildren ? `${c.label}: ${subChildren}` : c.label;
        }).join('. ') || category.label;

        nodes.push({
          id: category.id,
          label: category.label.toUpperCase(),
          sublabel: category.children?.[0]?.label?.slice(0, 25) || '',
          x: startX + col * gapX,
          y: startY + row * gapY,
          w: 170,
          h: 50,
          accent: category.node_type === 'finding' ? 'amber' : 'teal',
          source: childLabels,
          fullText: fullText,
        });
      });
    }

    return nodes;
  };

  const nodes = generateNodes();
  const hasRealData = nodes.length > 0;

  /*
   * There is deliberately no placeholder mind map. This used to fall back to a
   * hardcoded semaglutide/MACE trial (HR 0.79, 21% MACE reduction) whenever a
   * paper had no mind_map — inventing trial results and attaching them to
   * whatever paper the reader was looking at. If we have no map, we say so.
   */
  const displayNodes = nodes;

  // Source from backend or fallback
  const source = {
    ref: paper.journal || 'Source',
    quote: paper.tldr?.slice(0, 200) || 'No quote available.',
    cite: `DOI: ${paper.doi || 'N/A'}`,
  };

  // Generate connections
  const generateConnections = () => {
    const centerX = 450;
    const centerY = 310;
    
    return displayNodes.map((node) => {
      const nodeCenterX = node.x + node.w / 2;
      const nodeCenterY = node.y + node.h / 2;
      return {
        x1: centerX,
        y1: centerY,
        x2: nodeCenterX,
        y2: nodeCenterY,
      };
    });
  };

  const connections = generateConnections();

  const handleNodeClick = (node: MindMapNode) => {
    setSelectedNode(node);
  };

  const closeNodePanel = () => {
    setSelectedNode(null);
  };

  // Map node to section in sidebar and open paper
  const handleGoToSection = () => {
    if (!selectedNode) return;

    // Map node ID to section ID
    const nodeToSectionMap: Record<string, string> = {
      'background_context': '1',
      'objective': '2',
      'methods': '2',
      'key_results': '3',
      'clinical_practical_implications': '4',
      'limitations': '4',
      'pop': '1',
      'int': '2',
      'res': '3',
      'out': '3',
      'des': '2',
      'saf': '4',
    };

    const sectionId = nodeToSectionMap[selectedNode.id];

    // 1. Activate section in sidebar
    if (sectionId) {
      // Dispatch custom event to activate section in sidebar
      window.dispatchEvent(new CustomEvent('activateSection', { detail: { sectionId } }));
      
      // Scroll to section in sidebar
      const sidebarSection = document.querySelector(`[data-section-id="${sectionId}"]`);
      if (sidebarSection) {
        sidebarSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // 2. Open paper URL
    const paperUrl = paper.doi 
      ? `https://doi.org/${paper.doi}`
      : `https://pubmed.ncbi.nlm.nih.gov/${paper.id}/`;
    
    window.open(paperUrl, '_blank', 'noopener,noreferrer');
  };

  // Download handlers
  const handleDownloadPNG = async () => {
    setDownloading(true);
    try {
      if (svgRef.current) {
        const svgData = new XMLSerializer().serializeToString(svgRef.current);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          canvas.width = 1200;
          canvas.height = 620;
          ctx?.drawImage(img, 0, 0, 1200, 620);
          const a = document.createElement('a');
          a.download = `${paper.id}-mindmap.png`;
          a.href = canvas.toDataURL('image/png');
          a.click();
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      }
    } catch (err) {
      console.error('Download failed:', err);
      window.print();
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.id}-mindmap.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const data = {
      paper_id: paper.id,
      title: paper.title,
      mind_map: mindMapData,
      generated_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.id}-mindmap.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEmbed = () => {
    const embedCode = `<iframe src="${window.location.origin}/paper/${paper.id}/mindmap" width="100%" height="620" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode).then(() => {
      alert('Embed code copied to clipboard!');
    });
  };

  const handleCopyCite = () => {
    navigator.clipboard.writeText(`${source.quote} ${source.cite}`).then(() => {
      alert('Citation copied to clipboard!');
    });
  };

  const handleCopySource = () => {
    if (selectedNode?.source) {
      navigator.clipboard.writeText(selectedNode.source).then(() => {
        alert('Source text copied to clipboard!');
      });
    }
  };

  return (
    <section className="space-y-4">
      {!hasRealData ? (
        <div className="bg-paper-warm/50 border border-ink/10 rounded-3xl p-10 text-center">
          <Icon icon="lucide:git-fork" className="text-[48px] text-ink/20 mx-auto mb-4" />
          <h3 className="serif text-[22px] tracking-tight text-ink/40 mb-2">No mind map</h3>
          <p className="text-[14px] text-ink/40 max-w-[420px] mx-auto">
            A knowledge graph hasn&rsquo;t been generated for this paper. The summary and findings
            are still available on the other tabs.
          </p>
        </div>
      ) : (
      <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink" />
          AGENT 02 &middot; INTERACTIVE KNOWLEDGE GRAPH
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setLayoutMode('spatial')}
            className={`inline-flex items-center gap-1 px-2 h-7 rounded-md text-[10.5px] mono-stat transition-all ${
              layoutMode === 'spatial'
                ? 'bg-ink text-paper'
                : 'border border-ink/15 hover-tint cursor-pointer'
            }`}
          >
            <Icon icon="lucide:layout" className={`text-[12px] ${layoutMode === 'spatial' ? 'text-teal-bright' : 'text-teal'}`} />
            SPATIAL
          </button>
          <button
            onClick={() => setLayoutMode('radial')}
            className={`inline-flex items-center gap-1 px-2 h-7 rounded-md text-[10.5px] mono-stat transition-all ${
              layoutMode === 'radial'
                ? 'bg-ink text-paper'
                : 'border border-ink/15 hover-tint cursor-pointer'
            }`}
          >
            <Icon icon="lucide:git-fork" className={`text-[12px] ${layoutMode === 'radial' ? 'text-teal-bright' : 'text-teal'}`} />
            RADIAL
          </button>
        </div>
      </div>

      {/* Mind Map Canvas */}
      <div className="relative bg-ink rounded-3xl overflow-hidden h-[620px] border border-ink-soft">
        {/* Grid background */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none">
          <pattern id="grid-dot" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="#f6f3ea" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid-dot)" />
        </svg>

        {/* Center halo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-teal-bright/15 blur-3xl pointer-events-none" />

        {/* Mind Map SVG */}
        <svg 
          ref={svgRef} 
          viewBox="0 0 900 620" 
          className="absolute inset-0 w-full h-full"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Rotating ring */}
          <g className="rotate-slow" style={{ transformOrigin: '450px 310px' }}>
            <circle cx="450" cy="310" r="240" fill="none" stroke="#14b8a6" strokeWidth="0.5" strokeDasharray="3 8" opacity="0.25" />
            <circle cx="450" cy="310" r="180" fill="none" stroke="#14b8a6" strokeWidth="0.4" strokeDasharray="2 10" opacity="0.18" />
          </g>

          {/* Connections from center to nodes */}
          <g stroke="#14b8a6" fill="none">
            {connections.map((conn, i) => (
              <path
                key={i}
                d={`M ${conn.x1} ${conn.y1} Q ${(conn.x1 + conn.x2) / 2 + (Math.sin(i * 1.5) * 30)} ${(conn.y1 + conn.y2) / 2 + (Math.cos(i * 1.5) * 30)}, ${conn.x2} ${conn.y2}`}
                strokeWidth="1.4"
                opacity="0.6"
                strokeDasharray={i % 2 === 0 ? "4 4" : "none"}
              />
            ))}
          </g>

          {/* Center Node */}
          <g>
            <circle cx="450" cy="310" r="78" fill="#0b1d2a" stroke="#14b8a6" strokeWidth="2" filter="url(#glow)" />
            <circle cx="450" cy="310" r="62" fill="none" stroke="#14b8a6" strokeWidth="0.6" opacity="0.5" />
            <text x="450" y="285" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fontWeight="600" fill="#5eaaa0" letterSpacing="1.5">
              CORE FINDING
            </text>
            <text x="450" y="312" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="16" fontWeight="700" fill="#14b8a6">
              {mindMapData?.source?.slice(0, 25) || 'STUDY'}
            </text>
            <text x="450" y="330" textAnchor="middle" fontFamily="Inter" fontSize="9" fill="#f6f3ea" opacity="0.6">
              {paper.study_type?.toUpperCase()}
            </text>
          </g>

          {/* Data nodes - CLICKABLE */}
          {displayNodes.map((node) => (
            <g 
              key={node.id} 
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleNodeClick(node)}
            >
              <rect
                x={node.x}
                y={node.y}
                width={node.w}
                height={node.h}
                rx="10"
                fill="#1a2c3a"
                stroke={node.accent === 'amber' ? '#967338' : '#14b8a6'}
                strokeWidth={selectedNode?.id === node.id ? 2.5 : (node.id === 'results' || node.id === '4' ? 1.4 : 1)}
                opacity="0.96"
              />
              <text
                x={node.x + 15}
                y={node.y + 20}
                fontFamily="JetBrains Mono"
                fontSize="8.5"
                fontWeight="600"
                fill={node.accent === 'amber' ? '#cab57d' : '#5eaaa0'}
                letterSpacing="1"
              >
                {node.label}
              </text>
              <text
                x={node.x + 15}
                y={node.y + 38}
                fontFamily="Inter"
                fontSize="11"
                fontWeight="600"
                fill="#f6f3ea"
              >
                {node.sublabel}
              </text>
            </g>
          ))}

          {/* Focus ring on selected or first node */}
          {(selectedNode || displayNodes[0]) && (
            <circle 
              cx={selectedNode ? selectedNode.x + selectedNode.w / 2 : displayNodes[0].x + displayNodes[0].w / 2} 
              cy={selectedNode ? selectedNode.y + selectedNode.h / 2 : displayNodes[0].y + displayNodes[0].h / 2} 
              r="84" 
              fill="none" 
              stroke="#14b8a6" 
              strokeWidth="1.5" 
              strokeDasharray="4 4" 
              opacity="0.65"
            >
              <animate attributeName="r" values="84;92;84" dur="2.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.65;0.25;0.65" dur="2.6s" repeatCount="indefinite" />
            </circle>
          )}
        </svg>

        {/* Zoom controls */}
        <div className="absolute bottom-4 left-4 inline-flex flex-col gap-1">
          <button
            onClick={() => setZoom(z => Math.min(z + 0.1, 2))}
            className="w-9 h-9 rounded-xl bg-paper/10 backdrop-blur-md border border-paper/15 hover:bg-paper/20 inline-flex items-center justify-center"
            aria-label="Zoom in"
          >
            <Icon icon="lucide:plus" className="text-[14px] text-paper" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
            className="w-9 h-9 rounded-xl bg-paper/10 backdrop-blur-md border border-paper/15 hover:bg-paper/20 inline-flex items-center justify-center"
            aria-label="Zoom out"
          >
            <Icon icon="lucide:minus" className="text-[14px] text-paper" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="w-9 h-9 rounded-xl bg-paper/10 backdrop-blur-md border border-paper/15 hover:bg-paper/20 inline-flex items-center justify-center"
            aria-label="Reset zoom"
          >
            <Icon icon="lucide:maximize" className="text-[14px] text-paper" />
          </button>
        </div>
        <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-3 h-9 rounded-xl bg-paper/10 backdrop-blur-md border border-paper/15 text-[10px] mono-stat text-paper/70">
          <span>{displayNodes.length} NODES &middot; {mindMapData?.nodes?.length || 0} BRANCHES</span>
          <span className="text-paper/30">&middot;</span>
          <span className="text-teal-bright">CLICK NODE &rarr; SOURCE</span>
        </div>
      </div>

      {/* Selected Node Panel */}
      {selectedNode && (
        <div className="bg-ink rounded-2xl p-5 text-paper border border-teal-deep/30 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[10.5px] mono-stat text-teal-bright">
              <Icon icon="lucide:git-branch" className="text-[13px]" />
              {selectedNode.label} &middot; SOURCE
            </div>
            <button 
              onClick={closeNodePanel}
              className="w-7 h-7 rounded-lg bg-paper/10 hover:bg-paper/20 inline-flex items-center justify-center"
            >
              <Icon icon="lucide:x" className="text-[14px] text-paper" />
            </button>
          </div>
          
          <div className="mb-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[10px] mono-stat font-semibold ${
              selectedNode.accent === 'amber' 
                ? 'bg-amber-ink/20 text-amber-ink border border-amber-ink/30' 
                : 'bg-teal-deep/20 text-teal-bright border border-teal-deep/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${selectedNode.accent === 'amber' ? 'bg-amber-ink' : 'bg-teal-bright'}`} />
              {selectedNode.accent === 'amber' ? 'KEY FINDING' : 'STUDY COMPONENT'}
            </span>
          </div>

          <h4 className="serif text-[18px] text-paper mb-2">{selectedNode.sublabel}</h4>
          
          <p className="serif-body text-[14px] text-paper/75 leading-[1.6] mb-4">
            {selectedNode.fullText || selectedNode.source}
          </p>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopySource}
              className="h-8 px-3 rounded-lg bg-teal-deep text-paper text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5"
            >
              <Icon icon="lucide:copy" className="text-[12px]" />
              COPY SOURCE
            </button>
            <button 
              onClick={handleGoToSection}
              className="h-8 px-3 rounded-lg border border-paper/20 text-paper/70 text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5 hover:bg-paper/10"
            >
              <Icon icon="lucide:external-link" className="text-[12px]" />
              OPEN PAPER & SECTION
            </button>
          </div>
        </div>
      )}

      {/* Source panel - when no node selected */}
      {!selectedNode && (
        <div className="bg-ink rounded-2xl p-5 text-paper">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[10.5px] mono-stat text-teal-bright">
              <Icon icon="lucide:link-2" className="text-[13px]" />
              {source.ref}
            </div>
            <button 
              onClick={handleCopyCite}
              className="text-[10.5px] mono-stat text-paper/55 hover:text-teal-bright"
            >
              COPY CITE &nearr;
            </button>
          </div>
          <p className="serif-body text-[14.5px] text-paper/85 leading-[1.55] italic">
            {source.quote}
          </p>
          <div className="mt-3 text-[10.5px] mono-stat text-paper/40">{source.cite}</div>
        </div>
      )}

      {/* Export row - WORKING DOWNLOADS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <button
          onClick={handleDownloadPNG}
          disabled={downloading}
          className="h-11 rounded-xl bg-ink text-paper inline-flex items-center justify-center gap-2 text-[11px] mono-stat font-semibold disabled:opacity-50"
        >
          <Icon icon={downloading ? 'lucide:loader-2' : 'lucide:image'} className={`text-[14px] text-teal-bright ${downloading ? 'animate-spin' : ''}`} />
          DOWNLOAD PNG
        </button>
        <button
          onClick={handleDownloadSVG}
          className="h-11 rounded-xl border border-ink/15 hover-tint text-ink-soft inline-flex items-center justify-center gap-2 text-[11px] mono-stat font-semibold"
        >
          <Icon icon="lucide:code-2" className="text-[14px] text-teal" />
          EXPORT SVG
        </button>
        <button
          onClick={handleDownloadJSON}
          className="h-11 rounded-xl border border-ink/15 hover-tint text-ink-soft inline-flex items-center justify-center gap-2 text-[11px] mono-stat font-semibold"
        >
          <Icon icon="lucide:file-text" className="text-[14px] text-teal" />
          JSON GRAPH
        </button>
        <button
          onClick={handleEmbed}
          className="h-11 rounded-xl border border-ink/15 hover-tint text-ink-soft inline-flex items-center justify-center gap-2 text-[11px] mono-stat font-semibold"
        >
          <Icon icon="lucide:external-link" className="text-[14px] text-teal" />
          EMBED
        </button>
      </div>
      </>
      )}
    </section>
  );
}