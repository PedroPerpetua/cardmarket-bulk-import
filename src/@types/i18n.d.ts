/* Types for i18n on #imports don't appear to be automatically parsed; this file fixes it. */
import type { createI18n } from '@wxt-dev/i18n';

import type { GeneratedI18nStructure } from '../../.wxt/i18n/structure';

declare module '#imports' {
  const i18n: ReturnType<typeof createI18n<GeneratedI18nStructure>>;
}
