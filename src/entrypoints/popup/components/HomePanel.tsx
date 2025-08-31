import { i18n } from '#imports';

import { Stack, Button, Image } from 'react-bootstrap';

import type { PanelKey } from './panels-context';
import Panel from './panels-context/Panel';
import usePanelsContext from './panels-context/usePanelsContext';
import Icon from '../../../assets/icon.png';

const BUTTON_ORDER: Exclude<PanelKey, 'home'>[] = [
  'instructions',
  'reportIssue',
  'aboutMe',
];

function HomePanel() {
  const { setPanel } = usePanelsContext();

  return (
    <Panel>
      <Stack className="justify-content-between flex-grow">
        <Stack direction="horizontal" gap={2} className="align-items-center justify-content-center">
          <Image src={Icon} height={40} />
          <h6>{ i18n.t('popup.title') }</h6>
        </Stack>
        <Stack gap={3} className="align-items-center justify-content-center">
          {
            BUTTON_ORDER.map((k) => (
              <Button key={k} className="w-75" onClick={() => setPanel(k)}>
                { i18n.t(`popup.panels.${k}.button`) }
              </Button>
            ))
          }
        </Stack>
        <p className="subtitle mb-neg-8 text-secondary text-center">
          { i18n.t('popup.panels.disclaimer_a') }
          <br />
          { i18n.t('popup.panels.disclaimer_b') }
        </p>
      </Stack>
    </Panel>
  );
}

export default HomePanel;
