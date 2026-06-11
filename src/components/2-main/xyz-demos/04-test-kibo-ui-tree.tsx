import { useState, type ComponentProps } from "react";
import { classNames, uuid } from "@/utils";
import { TreeExpander, TreeIcon, TreeLabel, TreeNode, TreeNodeContent, TreeNodeTrigger, TreeProvider, TreeView } from "@/ui/shadcn/kibo-ui-tree";

export function TestKiboUiTree({ className, ...rest }: ComponentProps<"div">) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    return (
        <div className={classNames("font-condensed text-xs flex flex-col", className)} {...rest}>
            <KiboTreeHeader selectedIds={selectedIds} />

            <div className="flex-1 min-h-0 overflow-auto p-4">
                <TreeProvider
                    defaultExpandedIds={DEFAULT_EXPANDED_IDS}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                >
                    <TreeView>
                        {renderTreeNodes(TREE_DATA)}
                    </TreeView>
                </TreeProvider>
            </div>
        </div>
    );
}

function renderTreeNodes(nodes: TreeNodeWithId[], level = 0) {
    return nodes.map(
        (node, index) => {
            const hasChildren = Boolean(node.children?.length);
            const isLast = index === nodes.length - 1;

            return (
                <TreeNode key={node.id} nodeId={node.id} level={level} isLast={isLast}>
                    <TreeNodeTrigger>
                        <TreeExpander hasChildren={hasChildren} />
                        <TreeIcon hasChildren={hasChildren} />
                        <TreeLabel>{node.label}</TreeLabel>
                    </TreeNodeTrigger>

                    {hasChildren && (
                        <TreeNodeContent hasChildren>
                            {renderTreeNodes(node.children!, level + 1)}
                        </TreeNodeContent>
                    )}
                </TreeNode>
            );
        }
    );
}

function KiboTreeHeader({ selectedIds }: { selectedIds: string[]; }) {
    const selectionLabel = selectedIds.length > 0 ? selectedIds.join(", ") : "none";

    return (
        <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between gap-4">
            <span className="text-sm shrink-0">Kibo UI Tree Demo</span>
            <span className="text-xs font-mono text-muted-foreground truncate">
                Selected: {selectionLabel}
            </span>
            <span className="text-xs text-muted-foreground flex gap-3 shrink-0">
                <a
                    className="underline-offset-2 hover:underline"
                    href={KIBO_UI_TREE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    kibo-ui.com
                </a>
                <a
                    className="underline-offset-2 hover:underline"
                    href={SHADCNBLOCKS_DEMO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    shadcnblocks demo
                </a>
            </span>
        </div>
    );
}

const KIBO_UI_TREE_URL = "https://www.kibo-ui.com/components/tree";
const SHADCNBLOCKS_DEMO_URL = "https://www.shadcnblocks.com/component/tree/tree-expanded-1";

type TreeDataNode = {
    label: string;
    expanded?: boolean;
    children?: TreeDataNode[];
};

type TreeNodeWithId = {
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

const TREE_DATA = assignTreeIds(TREE_SOURCE);
const DEFAULT_EXPANDED_IDS = collectExpandedIds(TREE_DATA);
