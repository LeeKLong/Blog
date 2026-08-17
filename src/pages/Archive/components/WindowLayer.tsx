import { useOS } from '../context/OSContext';
import Window from './Window';

export default function WindowLayer() {
  const { state } = useOS();

  return (
    <div id="windows-layer" className="absolute inset-0 z-20 pointer-events-none">
      {Object.values(state.windows).map((win) => (
        <Window key={win.id} winState={win} />
      ))}
    </div>
  );
}
