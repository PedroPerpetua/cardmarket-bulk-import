import AboutMePanel from './AboutMePanel';
import HomePanel from './HomePanel';
import InstructionsPanel from './InstructionsPanel';
import ReportIssuePanel from './ReportIssuePanel';
import usePanelsContext from './panels-context/usePanelsContext';

function PanelManager() {
  const { currentPanel } = usePanelsContext();

  switch (currentPanel) {
    case 'home': return (<HomePanel />);
    case 'instructions': return (<InstructionsPanel />);
    case 'reportIssue': return (<ReportIssuePanel />);
    case 'aboutMe': return (<AboutMePanel />);
    default: return null;
  }
}

export default PanelManager;
