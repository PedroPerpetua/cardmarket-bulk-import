import { defineBackground } from '#imports';

import { onMessage } from 'webext-bridge/background';

import { getMTGJSONData } from './utils/mtgjson';

export default defineBackground(() => {
  // Cache this at the beginning for faster loading while usage
  getMTGJSONData();

  onMessage('cardmarket-bulk-import.getMTGJSONData', async () => {
    return await getMTGJSONData();
  });
});
