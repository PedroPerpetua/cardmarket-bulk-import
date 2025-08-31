import { i18n, browser } from '#imports';

import { Image } from 'react-bootstrap';

import Panel from './panels-context/Panel';
import GithubIcon from '../../../assets/github.svg';

function ReportIssuePanel() {
  return (
    <Panel title={i18n.t('popup.panels.reportIssue.title')}>
      <div className="d-flex align-items-center h-100">
        <p className="text-justify">
          { i18n.t('popup.panels.reportIssue.github_a') }
          <a
            href="https://github.com/PedroPerpetua/cardmarket-bulk-import/issues"
            target="_blank"
            rel="noreferrer"
          >
            <Image src={GithubIcon} className="inline-icon" />
            { i18n.t('popup.panels.reportIssue.github_b') }
          </a>
          { i18n.t('popup.panels.reportIssue.github_c') }
          <br />
          <br />
          { i18n.t('popup.panels.reportIssue.github_d', [browser.runtime.getManifest().version]) }
        </p>
      </div>
    </Panel>
  );
}

export default ReportIssuePanel;
