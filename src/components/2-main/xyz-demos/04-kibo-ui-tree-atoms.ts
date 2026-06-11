import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import { uuid } from "@/utils";

export type TreeDataNode = {
    label: string;
    expanded?: boolean;
    children?: TreeDataNode[];
};

export type TreeNodeWithId = {
    id: string;
    label: string;
    expanded?: boolean;
    children?: TreeNodeWithId[];
};

const TREE_SOURCE: TreeDataNode[] = [
    {
        label: "src",
        expanded: true,
        children: [
            {
                label: "components",
                expanded: true,
                children: [
                    {
                        label: "ui",
                        expanded: true,
                        children: [
                            { label: "button.tsx" },
                            { label: "card.tsx" },
                            { label: "dialog.tsx" },
                        ],
                    },
                ],
            },
            { label: "layout" },
        ],
    },
    { label: "public" },
    { label: "package.json" },
    { label: "tsconfig.json" },
    { label: "README.md" },
];

function assignTreeIds(nodes: TreeDataNode[]): TreeNodeWithId[] {
    return nodes.map((node) => ({
        ...node,
        id: String(uuid.asRelativeNumber()),
        children: node.children ? assignTreeIds(node.children) : undefined,
    }));
}

function collectExpandedIds(nodes: TreeNodeWithId[]): string[] {
    return nodes.flatMap((node) => [
        ...(node.expanded ? [node.id] : []),
        ...(node.children ? collectExpandedIds(node.children) : []),
    ]);
}

function findNodeLabel(nodes: TreeNodeWithId[], id: string): string | undefined {
    for (const node of nodes) {
        if (node.id === id) {
            return node.label;
        }
        if (node.children) {
            const label = findNodeLabel(node.children, id);
            if (label) {
                return label;
            }
        }
    }
    return undefined;
}

function walkTreeNodes(nodes: TreeNodeWithId[]): TreeNodeWithId[] {
    return nodes.flatMap((node) => [
        node,
        ...(node.children ? walkTreeNodes(node.children) : []),
    ]);
}

const treeData = assignTreeIds(TREE_SOURCE);
const treeNodeIds = walkTreeNodes(treeData).map((node) => node.id);

export const treeDataAtom = atom<TreeNodeWithId[]>(treeData);
export const treeSelectedIdsAtom = atom<string[]>([]);
export const treeExpandedIdsAtom = atom<string[]>(collectExpandedIds(treeData));

/** Per-node primitive — only the affected nodes re-render on selection change. */
export const isNodeSelectedAtom = atomFamily((_nodeId: string) => atom(false));

export const setTreeSelectionAtom = atom(
    null,
    (get, set, newSelection: string[]) => {
        const prev = get(treeSelectedIdsAtom);
        const affected = new Set([...prev, ...newSelection]);

        set(treeSelectedIdsAtom, newSelection);
        for (const id of affected) {
            set(isNodeSelectedAtom(id), newSelection.includes(id));
        }
    }
);

export const treeSelectedLabelsAtom = atom((get) => {
    const selectedIds = get(treeSelectedIdsAtom);
    const nodes = get(treeDataAtom);

    return selectedIds.map((id) => findNodeLabel(nodes, id) ?? id);
});

for (const nodeId of treeNodeIds) {
    isNodeSelectedAtom(nodeId);
}
