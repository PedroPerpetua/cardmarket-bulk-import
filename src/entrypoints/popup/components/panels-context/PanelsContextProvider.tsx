import { useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import PanelsContext, { DEFAULT_PANEL } from '.';
import type { PanelKey, PanelsContextValue } from '.';

function PanelsContextProvider({ children }: PropsWithChildren) {
  const [current, setCurrent] = useState<PanelKey>(DEFAULT_PANEL);

  const contextValue = useMemo<PanelsContextValue>(() => ({
    currentPanel: current,
    setPanel: setCurrent,
    goBack: () => setCurrent(DEFAULT_PANEL),
    canGoBack: current !== DEFAULT_PANEL,
  }), [current]);

  return (
    <PanelsContext.Provider value={contextValue}>
      { children }
    </PanelsContext.Provider>
  );
}

export default PanelsContextProvider;
