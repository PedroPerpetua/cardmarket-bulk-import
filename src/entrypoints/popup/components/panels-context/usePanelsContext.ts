import { useContext } from 'react';

import PanelsContext from '.';

function usePanelsContext() {
  return useContext(PanelsContext);
}

export default usePanelsContext;
