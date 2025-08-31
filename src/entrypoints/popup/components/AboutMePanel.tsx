import { i18n } from '#imports';

import { Image, Stack } from 'react-bootstrap';

import Panel from './panels-context/Panel';
import AboutMe from '../../../assets/about-me.png';
import CardmarketIcon from '../../../assets/cardmarket.png';
import GithubIcon from '../../../assets/github.svg';
import KofiButton from '../../../assets/kofi.png';

function AboutMePanel() {
  return (
    <Panel title={i18n.t('popup.panels.aboutMe.title')}>
      <Stack>
        <Stack className="align-items-center">
          <h6 className="text-decoration-underline mb-1">
            { i18n.t('popup.panels.aboutMe.header') }
          </h6>
          <p className="subtitle text-secondary">
            { i18n.t('popup.panels.aboutMe.subheader') }
          </p>
          <Image src={AboutMe} roundedCircle className="w-50" />
        </Stack>
        <Stack className=" mb-neg-8 justify-content-end">
          <p>
            { i18n.t('popup.panels.aboutMe.github') }
            <a
              href="https://github.com/PedroPerpetua/cardmarket-bulk-import"
              target="_blank"
              rel="noreferrer"
            >
              <Image src={GithubIcon} className="inline-icon" />
              Github
            </a>

            <br />

            { i18n.t('popup.panels.aboutMe.website') }
            <a
              href="https://pedroperpetua.com"
              target="_blank"
              rel="noreferrer"
            >
              pedroperpetua.com
            </a>

            <br />

            { i18n.t('popup.panels.aboutMe.cardmarket') }
            <a
              href="https://www.cardmarket.com/en/Magic/Users/WarriorPP"
              target="_blank"
              rel="noreferrer"
            >
              <Image src={CardmarketIcon} className="inline-icon" />
              Cardmarket
            </a>

          </p>

          <br />

          { i18n.t('popup.panels.aboutMe.kofi') }
          <a
            href="https://ko-fi.com/L4L5YSJW4"
            target="_blank"
            rel="noreferrer"
          >
            <Image src={KofiButton} className="w-100 mt-1" />
          </a>
          <span className="subtitle text-secondary text-center">
            { i18n.t('popup.panels.aboutMe.kofi_subtitle_1') }
            <br />
            { i18n.t('popup.panels.aboutMe.kofi_subtitle_2') }
          </span>
        </Stack>
      </Stack>
    </Panel>
  );
}

export default AboutMePanel;
