import { type Layout } from 'react-resizable-panels';

export interface PanelSizes {
    horizontal: Layout;
    vertical: Layout;
}

export function getValidPanelSizes(parsedSizes?: unknown): PanelSizes {
    const defaultHorizontal = { left: 30, right: 70 };
    const defaultVertical = { top: 50, bottom: 50 };

    const rv: PanelSizes = parsedSizes as PanelSizes ?? {
        horizontal: defaultHorizontal,
        vertical: defaultVertical,
    };

    return rv;
}
