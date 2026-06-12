import { type ReactNode } from "react";
import { useAtomValue } from "jotai";
import { treeSelectedFileKindAtom, treeSelectedLabelAtom } from "./8-kibo-ui-tree-atoms";

export function SelectedFileView() {
    const fileKind = useAtomValue(treeSelectedFileKindAtom);
    const fileName = useAtomValue(treeSelectedLabelAtom);

    switch (fileKind) {
        case "tsx":
            return <FilePreview_tsx fileName={fileName!} />;
        case "json":
            return <FilePreview_json fileName={fileName!} />;
        case "md":
            return <FilePreview_md fileName={fileName!} />;
        default:
            return <FilePreview_FileSelected selectedLabel={fileName} />;
    }
}

function FilePreview_FileSelected({ selectedLabel }: { selectedLabel?: string; }) {
    return (
        <div className="h-full flex flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
            {selectedLabel
                ? (<>
                    <span className="text-sm">No preview for &ldquo;{selectedLabel}&rdquo;</span>
                    <span className="text-xs">Select a .tsx, .json, or .md file</span>
                </>)
                : (<>
                    <span className="text-sm">No file selected</span>
                    <span className="text-xs">Choose a file in the project tree</span>
                </>)}
        </div>
    );
}

function FilePreviewShell({ title, fileName, children, }: { title: string; fileName: string; children: ReactNode; }) {
    return (
        <div className="h-full flex flex-col gap-3 p-4 overflow-auto">
            <div className="flex items-baseline justify-between gap-4 border-b pb-3">
                <span className="text-sm font-semibold">{title}</span>
                <span className="text-xs font-mono text-muted-foreground truncate">{fileName}</span>
            </div>
            <div className="flex-1 min-h-0">{children}</div>
        </div>
    );
}

function FilePreview_tsx({ fileName }: { fileName: string; }) {
    return (
        <FilePreviewShell title="TSX component preview" fileName={fileName}>
            <pre className="text-xs font-mono bg-muted/40 rounded-md p-4 overflow-auto">
                {getFileContent_tsx(fileName)}
            </pre>
        </FilePreviewShell>
    );
}

function FilePreview_json({ fileName }: { fileName: string; }) {
    return (
        <FilePreviewShell title="JSON file preview" fileName={fileName}>
            <pre className="text-xs font-mono bg-muted/40 rounded-md p-4 overflow-auto">
                {getFileContent_json(fileName)}
            </pre>
        </FilePreviewShell>
    );
}

function FilePreview_md({ fileName }: { fileName: string; }) {
    return (
        <FilePreviewShell title="Markdown preview" fileName={fileName}>
            <div className="space-y-3 text-sm">
                <h3 className="font-semibold">
                    Project README
                </h3>
                <p className="text-muted-foreground">
                    Simple markdown preview for <span className="font-mono">{fileName}</span>.
                </p>
                <ul className="list-disc list-inside text-muted-foreground text-xs space-y-1">
                    <li>Project tree on the left</li>
                    <li>File-specific test view on the right</li>
                    <li>Resizable split between panels</li>
                </ul>
            </div>
        </FilePreviewShell>
    );
}

// Helper functions for file content

function toComponentName(fileName: string) {
    const base = fileName.replace(/\.tsx$/, "");
    return base.charAt(0).toUpperCase() + base.slice(1);
}

function getFileContent_tsx(fileName: string) {
    const componentName = toComponentName(fileName);

    return (
        `import type { ComponentProps } from "react";

export function ${componentName}(props: ComponentProps<"div">) {
  return (
    <div {...props}>
      {/* ${fileName} */}
    </div>
  );
}`
    );
}

function getFileContent_json(fileName: string) {
    if (fileName === "package.json") {
        return (
            `{
  "name": "demo-app",
  "private": true,
  "version": "0.0.0"
}`
        );
    } else {
        return (
            `{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx"
  }
}`
        );
    }
}
