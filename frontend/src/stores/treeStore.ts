import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType
} from '@xyflow/react';
import { Member } from '@/types/tree';
import dagre from 'dagre';
import { useLanguageStore } from '@/stores/languageStore';
import { API_BASE_URL } from '@/config/api';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node<Member>[], edges: Edge[]) => {
    const isHorizontal = false;
    dagreGraph.setGraph({
        rankdir: isHorizontal ? 'LR' : 'TB',
        ranksep: 100,
        nodesep: 80,
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 150, height: 100 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - 75,
                y: nodeWithPosition.y - 50,
            },
        };
    });

    return { nodes: layoutedNodes as Node<Member>[], edges };
};

const initialNodes: Node<Member>[] = [
    {
        id: '1',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: {
            id: '1',
            fullName: 'Nguyễn Văn A',
            gender: 'male',
            isAlive: false,
            job: 'Lão Thành Cách Mạng',
            alias: 'Cụ Tổ',
            birthDate: '1900-01-01',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'
        },
    },
];

const initialEdges: Edge[] = [];

interface TreeState {
    nodes: Node<Member>[];
    edges: Edge[];
    treeId: string | null;
    userTrees: any[];
    isReadOnly: boolean;
    isPublic: boolean;

    setTreeId: (id: string | null) => void;
    setUserTrees: (trees: any[]) => void;
    loadTree: (treeData: any) => void;
    createNewTree: () => void;
    onNodesChange: OnNodesChange<Node<Member>>;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    updateNode: (id: string, data: Partial<Member>) => void;
    removeNode: (id: string) => void;
    addNode: (node: Partial<Member> & { id: string }) => void;
    activeMemberId: string | null;
    setActiveMember: (id: string | null) => void;
    activeEdgeId: string | null;
    setActiveEdge: (id: string | null) => void;
    updateEdge: (id: string, data: Partial<Edge>) => void;
    removeEdge: (id: string) => void;
    syncTree: (token: string, treeId: string | null, name: string) => Promise<any>;
    deleteTree: (token: string, treeId: string) => Promise<void>;
    addParent: (nodeId: string) => void;
    addChild: (nodeId: string) => void;
    addSibling: (nodeId: string) => void;
    backgroundColor: string;
    gridColor: string;
    nodeStyle: 'polaroid' | 'classic' | 'modern';
    setTreeSettings: (settings: { backgroundColor?: string, gridColor?: string, nodeStyle?: 'polaroid' | 'classic' | 'modern' }) => void;
    refreshLayout: () => void;
    mergeNodes: (targetId: string, sourceId: string) => void;
    accessPublicTree: (email: string, password: string) => Promise<void>;
    exportTree: () => void;
    importTree: (file: File) => Promise<void>;
}

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

export const useTreeStore = create<TreeState>()(
    persist(
        (set, get) => ({
            nodes: layoutedNodes,
            edges: layoutedEdges,
            treeId: null,
            userTrees: [],
            activeMemberId: null,
            activeEdgeId: null,
            backgroundColor: '#2a1b15',
            gridColor: '#1a120b',
            nodeStyle: 'polaroid' as const,
            isReadOnly: false,
            isPublic: false,

            setTreeSettings: (settings) => set((state) => ({ ...state, ...settings })),

            setTreeId: (id) => set({ treeId: id }),
            setUserTrees: (trees) => set({ userTrees: trees }),
            loadTree: (treeData) => {
                // If treeData has members and relations, transform them to nodes/edges
                const newNodes = treeData.members.map((m: any) => ({
                    id: m.id,
                    type: 'custom',
                    position: { x: m.positionX, y: m.positionY },
                    data: {
                        id: m.id,
                        fullName: m.fullName,
                        gender: m.gender,
                        birthDate: m.birthDate,
                        isAlive: m.isAlive,
                        photoUrl: m.photoUrl || '',
                        job: m.job,
                        alias: m.alias,
                        description: m.description,
                    },
                }));
                const newEdges = treeData.relations.map((r: any) => ({
                    id: r.id,
                    source: r.sourceMemberId,
                    target: r.targetMemberId,
                    label: r.relationType,
                    type: 'smoothstep',
                    animated: true,
                    style: { stroke: '#06b6d4', strokeWidth: 2, filter: 'drop-shadow(0 0 5px rgba(6,182,212,0.3))' },
                    labelStyle: { fill: '#22d3ee', fontWeight: 700, fontSize: 10 },
                    labelBgStyle: { fill: '#0f172a', fillOpacity: 0.9, rx: 4, ry: 4 },
                }));
                set({
                    nodes: newNodes,
                    edges: newEdges,
                    treeId: treeData.id,
                    activeMemberId: null,
                    activeEdgeId: null,
                    isReadOnly: false,
                    isPublic: treeData.isPublic || false
                });
            },
            createNewTree: () => {
                const t = useLanguageStore.getState().t;
                const rootId = crypto.randomUUID();
                const defaultNode: Node<Member> = {
                    id: rootId,
                    type: 'custom',
                    position: { x: 0, y: 0 },
                    data: {
                        id: rootId,
                        fullName: t('tree.default_node_name'),
                        gender: 'male',
                        isAlive: true,
                        job: t('tree.default_node_job'),
                        alias: t('tree.default_node_alias'),
                        birthDate: '',
                        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${rootId}`
                    },
                };
                set({
                    nodes: [defaultNode],
                    edges: [],
                    treeId: null,
                    activeMemberId: rootId,
                    activeEdgeId: null,
                    isReadOnly: false,
                    isPublic: false
                });
            },
            setActiveMember: (id) => set({ activeMemberId: id, activeEdgeId: null }),
            setActiveEdge: (id) => set({ activeEdgeId: id, activeMemberId: null }),

            onNodesChange: (changes) => {
                set({
                    nodes: applyNodeChanges(changes, get().nodes),
                });
            },
            onEdgesChange: (changes) => {
                set({
                    edges: applyEdgeChanges(changes, get().edges),
                });
            },
            onConnect: (connection) => {
                const { nodes, edges, mergeNodes } = get();
                const sourceId = connection.source;
                const targetId = connection.target;

                if (!sourceId || !targetId) return;

                // Logic: Nếu 2 node có cùng tập hợp các mối quan hệ (cùng cha mẹ, cùng con cái)
                // thì chúng ta sẽ thực hiện gộp (merge) thay vì tạo kết nối mới.
                const getRelationsHash = (id: string) => {
                    const incoming = edges.filter(e => e.target === id).map(e => `${e.source}-${e.label}`);
                    const outgoing = edges.filter(e => e.source === id).map(e => `${e.target}-${e.label}`);
                    return [...incoming.sort(), ...outgoing.sort()].join('|');
                };

                const sourceHash = getRelationsHash(sourceId);
                const targetHash = getRelationsHash(targetId);

                if (sourceId !== targetId && sourceHash === targetHash && sourceHash !== "") {
                    mergeNodes(targetId, sourceId);
                    alert(useLanguageStore.getState().t('tree.merge_success'));
                    return;
                }

                const newEdge: Edge = {
                    ...connection,
                    id: `e-${connection.source}-${connection.target}-${Date.now()}`,
                    type: 'smoothstep',
                    animated: true,
                    label: 'Quan hệ',
                    labelStyle: { fill: '#22d3ee', fontWeight: 700, fontSize: 12 },
                    labelBgStyle: { fill: '#0f172a', fillOpacity: 0.8, rx: 5, ry: 5 },
                    style: { stroke: '#22d3ee', strokeWidth: 2, filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.4))' },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#22d3ee' }
                };
                const newEdges = addEdge(newEdge, get().edges);
                set({ edges: newEdges });
            },

            addNode: (nodeData) => {
                const newNode: Node<Member> = {
                    id: nodeData.id,
                    type: 'custom',
                    position: { x: 100, y: 100 },
                    data: {
                        id: nodeData.id,
                        fullName: nodeData.fullName || 'Thành viên mới',
                        gender: nodeData.gender || 'male',
                        isAlive: nodeData.isAlive ?? true,
                        job: nodeData.job || 'Chưa cập nhật',
                        alias: nodeData.alias || 'Người mới',
                        birthDate: nodeData.birthDate || '',
                        photoUrl: nodeData.photoUrl,
                        description: nodeData.description,
                    },
                };
                set({ nodes: [...get().nodes, newNode] });
            },

            updateNode: (id, data) => {
                set({
                    nodes: get().nodes.map((node) => {
                        if (node.id === id) {
                            return { ...node, data: { ...node.data, ...data } };
                        }
                        return node;
                    }),
                });
            },

            updateEdge: (id, data) => {
                set({
                    edges: get().edges.map((edge) => {
                        if (edge.id === id) {
                            return { ...edge, ...data };
                        }
                        return edge;
                    }),
                });
            },

            removeNode: (id) => {
                const newNodes = get().nodes.filter((node) => node.id !== id);
                const newEdges = get().edges.filter((edge) => edge.source !== id && edge.target !== id);
                set({ nodes: newNodes, edges: newEdges, activeMemberId: null });
            },

            removeEdge: (edgeId) => {
                const newEdges = get().edges.filter((edge) => edge.id !== edgeId);
                set({ edges: newEdges, activeEdgeId: null });
            },

            refreshLayout: () => {
                const { nodes: layouted } = getLayoutedElements(get().nodes, get().edges);
                set({ nodes: layouted });
            },

            mergeNodes: (targetId, sourceId) => {
                if (targetId === sourceId) return;
                const { nodes, edges } = get();
                const sourceNode = nodes.find(n => n.id === sourceId);
                const targetNode = nodes.find(n => n.id === targetId);

                if (!sourceNode || !targetNode) return;

                // 1. Chuyển tất cả các cạnh kết nối với sourceId sang targetId
                const nextEdges = edges.map(edge => {
                    const nEdge = { ...edge };
                    let changed = false;
                    if (edge.source === sourceId) {
                        nEdge.source = targetId;
                        changed = true;
                    }
                    if (edge.target === sourceId) {
                        nEdge.target = targetId;
                        changed = true;
                    }
                    if (changed) {
                        nEdge.id = `e-${nEdge.source}-${nEdge.target}-${Date.now()}-${Math.random()}`;
                    }
                    return nEdge;
                });

                // 2. Lọc bỏ các cạnh tự lặp và cạnh trùng lập
                const finalEdges = nextEdges.filter((edge, index, self) => {
                    if (edge.source === edge.target) return false;
                    return index === self.findIndex(e =>
                        e.source === edge.source &&
                        e.target === edge.target &&
                        e.label === edge.label
                    );
                });

                // 3. Xóa node nguồn
                const finalNodes = nodes.filter(n => n.id !== sourceId);

                set({
                    nodes: finalNodes,
                    edges: finalEdges,
                    activeMemberId: targetId
                });
            },

            addParent: (nodeId) => {
                const sourceNode = get().nodes.find(n => n.id === nodeId);
                const newId = crypto.randomUUID();
                const newMember: Member = {
                    id: newId,
                    fullName: 'Người thân mới',
                    gender: 'male',
                    isAlive: true,
                    job: 'Chưa cập nhật',
                    alias: 'Thế hệ trước',
                    birthDate: '',
                    photoUrl: ''
                };

                const newNode: Node<Member> = {
                    id: newId,
                    type: 'custom',
                    position: {
                        x: (sourceNode?.position.x || 0),
                        y: (sourceNode?.position.y || 0) - 200
                    },
                    data: newMember
                };

                const newEdge: Edge = {
                    id: `e${newId}-${nodeId}`,
                    source: newId,
                    target: nodeId,
                    label: 'Cha/Mẹ',
                    type: 'smoothstep',
                    animated: true,
                    labelStyle: { fill: '#22d3ee', fontWeight: 700, fontSize: 12 },
                    labelBgStyle: { fill: '#0f172a', fillOpacity: 0.8, rx: 5, ry: 5 },
                    style: { stroke: '#22d3ee', strokeWidth: 2, filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.4))' },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#22d3ee' }
                };

                set({
                    nodes: [...get().nodes, newNode],
                    edges: [...get().edges, newEdge],
                    activeMemberId: newId
                });
            },

            addChild: (nodeId) => {
                const sourceNode = get().nodes.find(n => n.id === nodeId);
                const newId = crypto.randomUUID();
                const newMember: Member = {
                    id: newId,
                    fullName: 'Thành viên mới',
                    gender: 'female',
                    isAlive: true,
                    job: 'Chưa cập nhật',
                    alias: 'Hậu duệ',
                    birthDate: '',
                    photoUrl: ''
                };

                const newNode: Node<Member> = {
                    id: newId,
                    type: 'custom',
                    position: {
                        x: (sourceNode?.position.x || 0),
                        y: (sourceNode?.position.y || 0) + 200
                    },
                    data: newMember
                };

                const newEdge: Edge = {
                    id: `e${nodeId}-${newId}`,
                    source: nodeId,
                    target: newId,
                    label: 'Con',
                    type: 'smoothstep',
                    animated: true,
                    labelStyle: { fill: '#22d3ee', fontWeight: 700, fontSize: 12 },
                    labelBgStyle: { fill: '#0f172a', fillOpacity: 0.8, rx: 5, ry: 5 },
                    style: { stroke: '#22d3ee', strokeWidth: 2, filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.4))' },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#22d3ee' }
                };

                set({
                    nodes: [...get().nodes, newNode],
                    edges: [...get().edges, newEdge],
                    activeMemberId: newId
                });
            },

            addSibling: (nodeId) => {
                const sourceNode = get().nodes.find(n => n.id === nodeId);
                const edges = get().edges;
                const parents = edges.filter(e => e.target === nodeId).map(e => e.source);

                const newId = crypto.randomUUID();
                const newMember: Member = {
                    id: newId,
                    fullName: 'Anh/Chị/Em mới',
                    gender: 'male',
                    isAlive: true,
                    job: 'Chưa cập nhật',
                    alias: 'Đồng thế hệ',
                    birthDate: '',
                    photoUrl: ''
                };

                const newNode: Node<Member> = {
                    id: newId,
                    type: 'custom',
                    position: {
                        x: (sourceNode?.position.x || 0) + 150,
                        y: (sourceNode?.position.y || 0)
                    },
                    data: newMember
                };

                const newEdgesToAdd: Edge[] = [];
                if (parents.length > 0) {
                    parents.forEach(pId => {
                        newEdgesToAdd.push({
                            id: `e${pId}-${newId}`,
                            source: pId,
                            target: newId,
                            label: 'Con',
                            type: 'smoothstep',
                            animated: true,
                            labelStyle: { fill: '#22d3ee', fontWeight: 700, fontSize: 12 },
                            labelBgStyle: { fill: '#0f172a', fillOpacity: 0.8, rx: 5, ry: 5 },
                            style: { stroke: '#22d3ee', strokeWidth: 2, filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.4))' },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#22d3ee' }
                        });
                    });
                }

                set({
                    nodes: [...get().nodes, newNode],
                    edges: [...get().edges, ...newEdgesToAdd],
                    activeMemberId: newId
                });
            },

            syncTree: async (token, treeId, name) => {
                if (get().isReadOnly) {
                    throw new Error('Chế độ chỉ xem. Bạn không có quyền đồng bộ.');
                }
                const { nodes, edges } = get();
                const syncData = {
                    treeId: treeId || undefined,
                    name,
                    nodes: nodes.map(n => ({
                        id: n.id,
                        fullName: n.data.fullName,
                        gender: n.data.gender,
                        birthDate: n.data.birthDate,
                        isAlive: n.data.isAlive,
                        photoUrl: n.data.photoUrl,
                        job: n.data.job,
                        alias: n.data.alias,
                        description: n.data.description,
                        positionX: n.position.x,
                        positionY: n.position.y,
                    })),
                    edges: edges.map(e => ({
                        id: e.id,
                        sourceMemberId: e.source,
                        targetMemberId: e.target,
                        relationType: (e.label as string) || 'Quan hệ',
                    })),
                    isPublic: get().isPublic
                };

                const response = await fetch(`${API_BASE_URL}/trees/sync`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(syncData)
                });

                if (response.status === 401) {
                    // We can't easily call logout here without circular dependency or extra imports
                    // but we can throw a specific error and let the component handle it
                    throw new Error('UNAUTHORIZED');
                }

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Sync failed');
                }
                const result = await response.json();
                set({ treeId: result.id });
                return result;
            },

            deleteTree: async (token, id) => {
                const response = await fetch(`${API_BASE_URL}/trees/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401) {
                    throw new Error('UNAUTHORIZED');
                }

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Delete failed');
                }

                if (get().treeId === id) {
                    get().createNewTree();
                }

                // Refresh list
                const treesResponse = await fetch(`${API_BASE_URL}/trees`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (treesResponse.status === 401) {
                    throw new Error('UNAUTHORIZED');
                }

                if (treesResponse.ok) {
                    set({ userTrees: await treesResponse.json() });
                }
            },

            accessPublicTree: async (email, password) => {
                try {
                    const response = await fetch(`${API_BASE_URL}/trees/public-access`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Truy cập thất bại');
                    }

                    const treeData = await response.json();

                    // Use loadTree logic but set isReadOnly
                    const newNodes = treeData.members.map((m: any) => ({
                        id: m.id,
                        type: 'custom',
                        position: { x: m.positionX, y: m.positionY },
                        data: {
                            id: m.id,
                            fullName: m.fullName,
                            gender: m.gender,
                            birthDate: m.birthDate,
                            isAlive: m.isAlive,
                            photoUrl: m.photoUrl || '',
                            job: m.job,
                            alias: m.alias,
                            description: m.description,
                        },
                    }));
                    const newEdges = treeData.relations.map((r: any) => ({
                        id: r.id,
                        source: r.sourceMemberId,
                        target: r.targetMemberId,
                        label: r.relationType,
                        type: 'smoothstep',
                        animated: true,
                        style: { stroke: '#06b6d4', strokeWidth: 2, filter: 'drop-shadow(0 0 5px rgba(6,182,212,0.3))' },
                        labelStyle: { fill: '#22d3ee', fontWeight: 700, fontSize: 10 },
                        labelBgStyle: { fill: '#0f172a', fillOpacity: 0.9, rx: 4, ry: 4 },
                    }));

                    set({
                        nodes: newNodes,
                        edges: newEdges,
                        treeId: treeData.id,
                        isReadOnly: true,
                        activeMemberId: null,
                        activeEdgeId: null
                    });
                } catch (error) {
                    throw error;
                }
            },

            exportTree: () => {
                const { nodes, edges, backgroundColor, gridColor, nodeStyle } = get();
                const data = {
                    version: '1.0',
                    app: 'AnhEmTui',
                    timestamp: new Date().toISOString(),
                    nodes,
                    edges,
                    settings: { backgroundColor, gridColor, nodeStyle }
                };
                const json = JSON.stringify(data, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `gia-pha-${new Date().getTime()}.aet`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },

            importTree: async (file: File) => {
                try {
                    const text = await file.text();
                    const data = JSON.parse(text);

                    // Basic verification
                    if (data.app !== 'AnhEmTui') {
                        throw new Error('Invalid file format');
                    }

                    set({
                        nodes: data.nodes || [],
                        edges: data.edges || [],
                        backgroundColor: data.settings?.backgroundColor || '#2a1b15',
                        gridColor: data.settings?.gridColor || '#1a120b',
                        nodeStyle: data.settings?.nodeStyle || 'polaroid',
                        treeId: null, // Reset treeId as it's a local import
                        activeMemberId: null,
                        activeEdgeId: null
                    });
                } catch (error) {
                    console.error('Import error:', error);
                    throw error;
                }
            }
        }
        ),
        {
            name: 'genealogy-tree-storage',
            partialize: (state) => ({
                nodes: state.nodes,
                edges: state.edges,
                treeId: state.treeId,
                backgroundColor: state.backgroundColor,
                gridColor: state.gridColor,
                nodeStyle: state.nodeStyle
            }),
        }
    )
);
