import React, { useEffect, useState } from 'react';
import { DesktopBarView } from './components/DesktopBarView';
import { FullView } from './components/FullView';
import { TitleScreen } from './components/TitleScreen';
import { soundEngine } from './game/sound';
import { steamBridge } from './game/steam';
import { useGameStore } from './game/store';

type ViewMode = 'title' | 'full' | 'bar';

export function App() {
  const [view, setView] = useState<ViewMode>('title');
  const tick = useGameStore((s) => s.tick);
  const gameSpeed = useGameStore((s) => s.gameSpeed);
  const isBossFight = useGameStore((s) => s.isBossFight);
  const isTowerFight = useGameStore((s) => s.isTowerFight);
  const slackingMode = useGameStore((s) => s.slackingMode);

  useEffect(() => {
    if (view === 'title' || gameSpeed === 0) return;
    const ms = gameSpeed === 2 ? 250 : 500;
    const timer = setInterval(() => {
      tick();
    }, ms);
    return () => clearInterval(timer);
  }, [tick, view, gameSpeed]);

  // Sync save.json to disk every 5 seconds for Steam Cloud Auto-Cloud compatibility
  useEffect(() => {
    const syncTimer = setInterval(() => {
      steamBridge.syncLocalSaveFile();
    }, 5000);
    return () => clearInterval(syncTimer);
  }, []);

  // Dynamic smooth crossfade between idle / night / boss MP3 tracks!
  useEffect(() => {
    if (view === 'title') return;
    if (isBossFight || isTowerFight) {
      soundEngine.switchTrack('boss');
    } else if (slackingMode === 'sleep' || slackingMode === 'tea' || slackingMode === 'daydream') {
      soundEngine.switchTrack('night');
    } else {
      soundEngine.switchTrack('idle');
    }
  }, [view, isBossFight, isTowerFight, slackingMode]);

  const goView = async (next: ViewMode) => {
    if (window.electronAPI?.isElectron) {
      await window.electronAPI.setMode(next === 'bar' ? 'bar' : 'full');
    }
    setView(next);
  };

  const isElectron = Boolean(window.electronAPI?.isElectron);

  if (view === 'title') {
    return isElectron ? (
      <TitleScreen onStartFull={() => goView('full')} onStartBar={() => goView('bar')} />
    ) : (
      <div className="w-screen h-screen bg-stone-800/90 flex items-center justify-center p-4">
        <div className="w-[1080px] h-[690px] max-w-full max-h-full">
          <TitleScreen onStartFull={() => goView('full')} onStartBar={() => goView('bar')} />
        </div>
      </div>
    );
  }

  if (view === 'bar') {
    if (isElectron) {
      return <DesktopBarView onExpand={() => goView('full')} />;
    }
    return (
      <div className="w-screen h-screen bg-stone-200/60 flex flex-col items-center justify-end pb-6">
        <div className="mb-3 text-xs text-stone-500">
          浏览器预览模式 · 在 Electron 客户端中此处为透明置顶的桌面底部摸鱼画卷条
        </div>
        <div className="w-[760px] h-[124px]">
          <DesktopBarView onExpand={() => goView('full')} />
        </div>
      </div>
    );
  }

  return isElectron ? (
    <FullView onSwitchToBar={() => goView('bar')} onBackToTitle={() => goView('title')} />
  ) : (
    <div className="w-screen h-screen bg-stone-800/90 flex items-center justify-center p-4">
      <div className="w-[1080px] h-[690px] max-w-full max-h-full">
        <FullView onSwitchToBar={() => goView('bar')} onBackToTitle={() => goView('title')} />
      </div>
    </div>
  );
}

export default App;
