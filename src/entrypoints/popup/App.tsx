import PanelManager from './components/PanelManager';
import PanelsContextProvider from './components/panels-context/PanelsContextProvider';

function App() {
  return (
    <PanelsContextProvider>
      <PanelManager />
    </PanelsContextProvider>
  );
}

export default App;
