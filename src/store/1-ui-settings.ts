import { proxy, subscribe } from 'valtio';
import { type ThemeMode, themeApplyMode } from '../utils/theme-apply';
import type { Layout } from 'react-resizable-panels';

const STORE_KEY = "basic-template-26";
const STORE_VER = "v1.0";
const STORAGE_ID = `${STORE_KEY}__${STORE_VER}`;

export interface PanelSizes {
    horizontal?: Layout;
    vertical?: Layout;
}

export interface AppSettings {
    theme: ThemeMode;
    showFooter: boolean;
    panelSizes?: PanelSizes;      // ResizablePanelGroup panel sizes
}

const DEFAULT_SETTINGS: AppSettings = {
    theme: 'light',
    showFooter: true,
    panelSizes: {
        horizontal: { left: 30, right: 70 },
        vertical: { top: 50, bottom: 50 },
    },
};

// Load settings from localStorage

function loadSettings(): AppSettings {
    try {
        const stored = localStorage.getItem(STORAGE_ID);
        if (stored) {
            const parsed = JSON.parse(stored) as Partial<AppSettings>;
            
            // Safe migration for panelSizes from old format (array) to new format (object)
            let panelSizes = DEFAULT_SETTINGS.panelSizes;
            if (parsed.panelSizes) {
                if (Array.isArray(parsed.panelSizes)) {
                    panelSizes = {
                        horizontal: parsed.panelSizes.length >= 2 ? { left: parsed.panelSizes[0], right: parsed.panelSizes[1] } : DEFAULT_SETTINGS.panelSizes?.horizontal,
                        vertical: DEFAULT_SETTINGS.panelSizes?.vertical,
                    };
                } else {
                    panelSizes = {
                        horizontal: parsed.panelSizes.horizontal ?? DEFAULT_SETTINGS.panelSizes?.horizontal,
                        vertical: parsed.panelSizes.vertical ?? DEFAULT_SETTINGS.panelSizes?.vertical,
                    };
                }
            }

            // merge stored settings with defaults to ensure new fields are present
            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
                panelSizes,
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
