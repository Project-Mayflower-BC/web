import { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import type { ViewTab } from './components/layout/AppShell';
import { HomeView } from './views/HomeView';
import { BoardView } from './views/BoardView';
import { ReviewView } from './views/ReviewView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('hub');

  return (
    <AppShell activeTab={activeTab} onSelectTab={setActiveTab}>
      {activeTab === 'hub' && <HomeView onNavigate={setActiveTab} />}
      {activeTab === 'board' && <BoardView />}
      {activeTab === 'review' && <ReviewView />}
    </AppShell>
  );
}