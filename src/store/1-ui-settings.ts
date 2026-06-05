import { proxy, subscribe } from 'valtio';
import { type ThemeMode, themeApplyMode } from '../utils/theme-apply';
import type { Layout } from 'react-resizable-panels';

const STORE_KEY = "basic-template-26";
const STORE_VER = "v1.0";
const STORAGE_ID = `${STORE_KEY}__${STORE_VER}`;

export interface PanelSizes {
    horizontal: Layout;
    vertical: Layout;
}

export interface AppSettings {
    theme: ThemeMode;
    showFooter: boolean;
    panelSizes: PanelSizes;      // ResizablePanelGroup panel sizes
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

    if (Array.isArray(parsedSizes)) {
        // Safe migration from old format (array) to new format (object)
        if (parsedSizes.length >= 2) {
            horizontal = {
                left: typeof parsedSizes[0] === 'number' ? parsedSizes[0] : 30,
                right: typeof parsedSizes[1] === 'number' ? parsedSizes[1] : 70,
            };
        }
    } else if (typeof parsedSizes === 'object' && parsedSizes !== null) {
        const obj = parsedSizes as Record<string, any>;
        
        // Validate horizontal
        if (obj.horizontal && typeof obj.horizontal === 'object') {
            const h = obj.horizontal as Record<string, any>;
            horizontal = {
                left: typeof h.left === 'number' ? h.left : 30,
                right: typeof h.right === 'number' ? h.right : 70,
            };
        }
        
        // Validate vertical
        if (obj.vertical && typeof obj.vertical === 'object') {
            const v = obj.vertical as Record<string, any>;
            vertical = {
                top: typeof v.top === 'number' ? v.top : 50,
                bottom: typeof v.bottom === 'number' ? v.bottom : 50,
            };
        }
    }

    return {
        horizontal,
        vertical,
    };
}

const DEFAULT_SETTINGS: AppSettings = {
    theme: 'light',
    showFooter: true,
    panelSizes: getValidPanelSizes(),
};

// Load settings from localStorage

function loadSettings(): AppSettings {
    try {
        const stored = localStorage.getItem(STORAGE_ID);
        if (stored) {
            const parsed = JSON.parse(stored) as Partial<AppSettings>;
            
            // merge stored settings with defaults to ensure new fields are present
            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
                panelSizes: getValidPanelSizes(parsed.panelSizes),
            };
        }
    } catch (e) {
        console.error("Failed to load settings", e);
    }
    return { ...DEFAULT_SETTINGS };
}

export const appSettings = proxy<AppSettings>(loadSettings());

themeApplyMode(appSettings.theme);

subscribe(appSettings, () => {
    try {
        themeApplyMode(appSettings.theme);
        localStorage.setItem(STORAGE_ID, JSON.stringify(appSettings));
    } catch (e) {
        console.error("Failed to save settings", e);
    }
});
