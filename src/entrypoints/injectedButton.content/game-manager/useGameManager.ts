import { useMemo } from 'react';

import { getCurrentManager } from '.';

function useGameManager() {
  return useMemo(getCurrentManager, []);
}

export default useGameManager;
