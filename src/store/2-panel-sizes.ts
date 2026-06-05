import { type Layout } from 'react-resizable-panels';

export interface PanelSizes {
    horizontal: Layout;
    vertical: Layout;
}

export function getValidPanelSizes(parsedSizes?: unknown): PanelSizes {
    const defaultHorizontal = { left: 30, right: 70 };
    const defaultVertical = { top: 50, bottom: 50 };

    if (!parsedSizes) {
        return {
            horizontal: defaultHorizontal,
            vertical: defaultVertical,
        };
    }

    let horizontal: Layout = defaultHorizontal;
    let vertical: Layout = defaultVertical;

    if (parsedSizes !== null) {
        const obj = parsedSizes as Record<string, any>;

        // Validate horizontal
        if (obj.horizontal && typeof obj.horizontal === 'object') {
            const h = obj.horizontal as Record<string, any>;
            horizontal = {
                left: typeof h.left === 'number' ? h.left : defaultHorizontal.left,
                right: typeof h.right === 'number' ? h.right : defaultHorizontal.right,
            };
        }

        // Validate vertical
        if (obj.vertical && typeof obj.vertical === 'object') {
            const v = obj.vertical as Record<string, any>;
            vertical = {
                top: typeof v.top === 'number' ? v.top : defaultVertical.top,
                bottom: typeof v.bottom === 'number' ? v.bottom : defaultVertical.bottom,
            };
        }
    } else {
        horizontal = defaultHorizontal;
        vertical = defaultVertical;
    }

    return {
        horizontal,
        vertical,
    };
}
