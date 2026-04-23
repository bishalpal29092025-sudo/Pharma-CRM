import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';

function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080B12]">
      <LeftPanel />
      <RightPanel />
    </div>
  );
}

export default App;
