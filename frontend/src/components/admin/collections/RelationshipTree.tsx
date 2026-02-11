'use client';

import React, { useMemo } from 'react';
import {
    ReactFlow,
    Panel,
    useNodesState,
    useEdgesState,
    Edge,
    Node,
    Handle,
    Position,
    ConnectionMode, Background,
    Controls,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { User, Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Types ---
interface Relation {
    id: string;
    sourceCardId: string;
    targetCardId: string;
    relationType: string;
}

interface Card {
    id: string;
    name: string;
    characterName: string;
    photoUrl: string;
    rarity: string;
}

interface RelationshipTreeProps {
    cards: Card[];
    relations: Relation[];
    onNodeClick?: (card: Card) => void;
}

// --- Custom Node Component ---
const CharacterNode = ({ data }: { data: { card: Card } }) => {
    const { card } = data;

    return (
        <div className="relative group">
            <div className={cn(
                "w-48 bg-zinc-950 border-2 rounded-2xl overflow-hidden transition-all duration-300",
                "border-zinc-800 group-hover:border-cyan-500/50 shadow-[0_0_20px_rgba(0,0,0,0.5)]",
                card.rarity === 'legendary' && "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]",
                card.rarity === 'epic' && "group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]",
                card.rarity === 'rare' && "group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
            )}>
                {/* Profile Image */}
                <div className="h-28 relative overflow-hidden bg-zinc-900">
                    <img
                        src={card.photoUrl}
                        alt={card.characterName}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black to-transparent" />
                </div>

                {/* Info */}
                <div className="p-3 bg-zinc-900/50 backdrop-blur-sm border-t border-zinc-800">
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className={cn(
                            "px-1.5 py-0.5 rounded-[4px] text-[6px] font-black uppercase border",
                            card.rarity === 'legendary' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                card.rarity === 'epic' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                                    card.rarity === 'rare' ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" :
                                        "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        )}>
                            {card.rarity}
                        </span>
                    </div>
                    <h3 className="text-[10px] font-black text-white uppercase tracking-tight truncate">
                        {card.characterName}
                    </h3>
                    <p className="text-[7px] text-zinc-500 uppercase font-bold tracking-widest truncate">
                        {card.name}
                    </p>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Fingerprint className="w-4 h-4 text-cyan-500" />
                </div>
            </div>

            {/* Handles */}
            <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-zinc-700 !border-zinc-600" />
            <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-cyan-500 !border-cyan-400" />
            <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-zinc-700 !border-zinc-600" />
            <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-cyan-500 !border-cyan-400" />
        </div>
    );
};

// --- Node Types Mapping ---
const nodeTypes = {
    character: CharacterNode,
};

// --- Layout Logic (Dagre) ---
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 200, height: 160 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            position: {
                x: nodeWithPosition.x - 100,
                y: nodeWithPosition.y - 80,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

export default function RelationshipTree({ cards, relations, onNodeClick }: RelationshipTreeProps) {
    // 1. Initial nodes and edges
    const initialNodes: Node[] = cards.map(card => ({
        id: card.id,
        type: 'character',
        data: { card },
        position: { x: 0, y: 0 },
    }));

    const initialEdges: Edge[] = relations.map(rel => ({
        id: rel.id,
        source: rel.sourceCardId,
        target: rel.targetCardId,
        label: rel.relationType.toUpperCase(),
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#334155', strokeWidth: 1.5 },
        labelStyle: { fill: '#64748b', fontSize: 7, fontWeight: 900, fontFamily: 'monospace' },
        labelBgPadding: [6, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: '#0c0c0c', fillOpacity: 0.8 },
    }));

    // 2. Apply layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() =>
        getLayoutedElements(initialNodes, initialEdges),
        [cards, relations]
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    // Sync state if props change
    React.useEffect(() => {
        const { nodes: newNodes, edges: newEdges } = getLayoutedElements(initialNodes, initialEdges);
        setNodes(newNodes);
        setEdges(newEdges);
    }, [cards, relations]);

    return (
        <div className="w-full h-full bg-[#0c0c0c] rounded-[2rem] overflow-hidden border border-zinc-900 shadow-inner">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={(_, node) => onNodeClick?.(node.data.card as Card)}
                nodeTypes={nodeTypes}
                connectionMode={ConnectionMode.Loose}
                fitView
                minZoom={0.2}
                maxZoom={2}
            >
                <Background color="#1e293b" gap={20} size={1} />
                <Controls
                    className="!bg-zinc-900 !border-zinc-800 !p-1 !rounded-xl"
                />
                <Panel position="top-right" className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-3 rounded-2xl">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                            <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Network Visualization Active</span>
                        </div>
                        <p className="text-[8px] text-zinc-500 uppercase font-black">Scroll to zoom • Drag to pan</p>
                    </div>
                </Panel>
            </ReactFlow>

            <style jsx global>{`
        .react-flow__edge-path {
          filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.2));
        }
        .react-flow__handle {
          opacity: 0;
        }
        .group:hover .react-flow__handle {
          opacity: 1;
        }
      `}</style>
        </div>
    );
}
