import { createContext } from 'react';

export type PanelKey = 'home' | 'instructions' | 'reportIssue' | 'aboutMe';

export const DEFAULT_PANEL: PanelKey = 'home';

export type PanelsContextValue = {
  currentPanel: PanelKey,
  setPanel: (panel: PanelKey) => void,
  canGoBack: boolean,
  goBack: () => void,
};

const PanelsContext = createContext<PanelsContextValue>({
  currentPanel: DEFAULT_PANEL,
  setPanel: () => {},
  canGoBack: false,
  goBack: () => {},
});

export default PanelsContext;
