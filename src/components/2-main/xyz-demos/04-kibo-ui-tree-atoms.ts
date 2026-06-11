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

const treeData = assignTreeIds(TREE_SOURCE);

export const treeDataAtom = atom<TreeNodeWithId[]>(treeData);
export const treeSelectedIdsAtom = atom<string[]>([]);
export const treeExpandedIdsAtom = atom<string[]>(collectExpandedIds(treeData));

export const isNodeSelectedAtom = atomFamily((nodeId: string) =>
    atom((get) => get(treeSelectedIdsAtom).includes(nodeId))
);

export const treeSelectedLabelsAtom = atom((get) => {
    const selectedIds = get(treeSelectedIdsAtom);
    const nodes = get(treeDataAtom);

    return selectedIds.map((id) => findNodeLabel(nodes, id) ?? id);
});
