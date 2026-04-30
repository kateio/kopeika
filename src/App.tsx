import { Routes, Route, useNavigate } from 'react-router-dom';
import { StartScreen } from '@/screens/StartScreen';
import { MainScreen } from '@/screens/MainScreen';
import { UIKitPage } from '@/uikit/UIKitPage';

export function App() {
  return (
    <Routes>
      <Route path="/start" element={<StartScreenRoute />} />
      <Route path="/" element={<MainScreenRoute />} />
      <Route path="/uikit" element={<UIKitPage />} />
    </Routes>
  );
}

function StartScreenRoute() {
  const navigate = useNavigate();
  return <StartScreen onContinue={() => navigate('/')} />;
}

function MainScreenRoute() {
  const navigate = useNavigate();
  return <MainScreen onGoToStart={() => navigate('/start')} />;
}
