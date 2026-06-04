import { useSnapshot } from "valtio";
import { appSettings } from "@/store/1-ui-settings";
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "@/ui/shadcn/resizable";
import type { Layout } from "react-resizable-panels";

export function TestResizablePanels() {
    const settings = useSnapshot(appSettings);

    const onHorizontalLayout = (layout: Layout) => {
        appSettings.panelSizes = {
            ...appSettings.panelSizes,
            horizontal: layout,
        };
    };

    const onVerticalLayout = (layout: Layout) => {
        appSettings.panelSizes = {
            ...appSettings.panelSizes,
            vertical: layout,
        };
    };

    const horizontalLayout = settings.panelSizes?.horizontal ?? { left: 30, right: 70 };
    const verticalLayout = settings.panelSizes?.vertical ?? { top: 50, bottom: 50 };

    const leftWidth = horizontalLayout.left ?? 30;
    const rightWidth = horizontalLayout.right ?? 70;
    const topHeight = verticalLayout.top ?? 50;
    const bottomHeight = verticalLayout.bottom ?? 50;

    return (
        <div className="w-full h-[400px] border rounded-xl overflow-hidden bg-card text-card-foreground shadow-xs mt-6 flex flex-col">
            <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
                <span className="font-semibold text-sm">Resizable Panels Demo</span>
                <span className="text-xs text-muted-foreground font-mono">
                    H: {Math.round(leftWidth)} : {Math.round(rightWidth)} | V: {Math.round(topHeight)} : {Math.round(bottomHeight)}
                </span>
            </div>
            <div className="flex-1 min-h-0">
                <ResizablePanelGroup
                    orientation="horizontal"
                    defaultLayout={horizontalLayout as Layout}
                    onLayoutChanged={onHorizontalLayout}
                >
                    <ResizablePanel id="left" minSize={15}>
                        <div className="flex flex-col items-center justify-center h-full p-6 bg-muted/40 text-center">
                            <span className="font-semibold text-sm">Left Panel</span>
                            <span className="text-xs text-muted-foreground mt-1">Width: {Math.round(leftWidth)}%</span>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel id="right" minSize={20}>
                        <ResizablePanelGroup
                            orientation="vertical"
                            defaultLayout={verticalLayout as Layout}
                            onLayoutChanged={onVerticalLayout}
                        >
                            <ResizablePanel id="top" minSize={15}>
                                <div className="flex flex-col items-center justify-center h-full p-6 bg-muted/10 text-center">
                                    <span className="font-semibold text-sm">Top Right Panel</span>
                                    <span className="text-xs text-muted-foreground mt-1">Height: {Math.round(topHeight)}%</span>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel id="bottom" minSize={15}>
                                <div className="flex flex-col items-center justify-center h-full p-6 bg-muted/20 text-center">
                                    <span className="font-semibold text-sm">Bottom Right Panel</span>
                                    <span className="text-xs text-muted-foreground mt-1">Height: {Math.round(bottomHeight)}%</span>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
