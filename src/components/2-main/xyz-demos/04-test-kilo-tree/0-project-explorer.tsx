import { type ComponentProps } from "react";
import { classNames } from "@/utils";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/ui/shadcn/resizable";
import { ProjectTree } from "./1-project-tree";
import { SelectedFileView } from "./3-selected-file-views";

export function ProjectExplorer({ className, ...rest }: ComponentProps<"div">) {
    return (
        <div className={classNames("font-condensed text-xs flex flex-col min-h-0", className)} {...rest}>
            <div className="flex-1 min-h-0">
                <ResizablePanelGroup
                    orientation="horizontal"
                    defaultLayout={{ tree: 30, content: 70 }}
                >
                    <ResizablePanel id="tree" minSize={15}>
                        <div className="h-full overflow-auto p-4 border-r bg-muted/10">
                            <ProjectTree />
                        </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    <ResizablePanel id="content" minSize={25}>
                        <SelectedFileView />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
