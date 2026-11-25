import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { BUILDINGS, evaluateCaveGrid } from '../game/data';
import { useGameStore } from '../game/store';

interface Props {
  onNotify: (msg: string) => void;
}

export const CaveGrid: React.FC<Props> = ({ onNotify }) => {
  const caveGrid = useGameStore((s) => s.caveGrid);
  const stones = useGameStore((s) => s.stones);
  const buildInGrid = useGameStore((s) => s.buildInGrid);
  const swapGridCells = useGameStore((s) => s.swapGridCells);

  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const { synergies } = evaluateCaveGrid(caveGrid);
  const unbuilt = BUILDINGS.filter((b) => !caveGrid.includes(b.id));

  const handleCellClick = (idx: number) => {
    if (selectedCell === null) {
      setSelectedCell(idx);
      return;
    }
    if (selectedCell === idx) {
      setSelectedCell(null);
      return;
    }
    swapGridCells(selectedCell, idx);
    setSelectedCell(null);
    onNotify('已调整洞府风水布局！');
  };

  return (
    <div className="p-3.5 rounded-xl bg-paper-100/90 border border-paper-300/90 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-sm text-ink-900">洞府 3×3 风水布局（相邻建筑触发共鸣）</h3>
          <p className="text-[10px] text-ink-500">
            点击任意两格即可免费互换位置；选中空地后点击右侧建筑即可落成
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-jade-100 text-jade-600 text-[10px] font-bold border border-jade-500/40">
          已激活 {synergies.length} 项共鸣
        </span>
      </div>

      <div className="grid grid-cols-12 gap-3 items-start">
        {/* 3x3 Courtyard Grid */}
        <div className="col-span-6 grid grid-cols-3 gap-2">
          {caveGrid.map((bId, idx) => {
            const def = bId ? BUILDINGS.find((b) => b.id === bId) : null;
            const isSel = selectedCell === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleCellClick(idx)}
                title={def ? `${def.name}：${def.desc}` : '空灵地（点击选中后可在右侧建造）'}
                className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-200 ${
                  isSel
                    ? 'border-cinnabar-500 bg-gold-100/90 scale-[1.03] shadow-md'
                    : def
                      ? 'border-jade-600/50 bg-paper-50/95 hover:border-jade-600 hover:-translate-y-0.5 shadow-xs'
                      : 'border-dashed border-paper-300 bg-paper-200/40 hover:border-ink-500/60'
                }`}
              >
                {def ? (
                  <>
                    <span className="text-lg leading-none">{def.emoji}</span>
                    <span className="mt-1 font-serif font-bold text-[11px] text-ink-900">{def.name}</span>
                  </>
                ) : (
                  <span className="text-[10px] text-ink-500">{isSel ? '已选空地' : '空灵地'}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Active Synergies + Unbuilt Buildings */}
        <div className="col-span-6 space-y-2">
          {/* Active Resonance Pills */}
          <div className="space-y-1">
            {synergies.length === 0 ? (
              <div className="text-[10px] text-ink-500 bg-paper-50/70 p-2 rounded-lg border border-paper-300/60">
                试着把【聚灵阵】与【灵药田】或【炼器阁】紧邻摆放，激活风水共鸣！
              </div>
            ) : (
              synergies.map((syn) => (
                <div
                  key={syn.id}
                  className="px-2.5 py-1.5 rounded-lg bg-gold-100/80 border border-gold-500/50 text-[10px] flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-gold-600 shrink-0" />
                  <span className="font-serif font-bold text-ink-900 shrink-0">{syn.title}</span>
                  <span className="text-ink-700 truncate">{syn.desc}</span>
                </div>
              ))
            )}
          </div>

          {/* Construction List */}
          {unbuilt.length > 0 && (
            <div className="pt-1">
              <div className="text-[10px] text-ink-500 mb-1">
                可建造建筑（{selectedCell !== null && !caveGrid[selectedCell] ? `将建于第 ${selectedCell + 1} 格` : '点击自动落位空地'}）
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto pr-0.5">
                {unbuilt.map((b) => {
                  const canAfford = stones >= b.cost;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      disabled={!canAfford}
                      onClick={() => {
                        const target =
                          selectedCell !== null && !caveGrid[selectedCell]
                            ? selectedCell
                            : caveGrid.findIndex((c) => c === null);
                        if (target === -1) {
                          onNotify('洞府 9 格已满！');
                          return;
                        }
                        const res = buildInGrid(target, b.id);
                        setSelectedCell(null);
                        onNotify(res.msg);
                      }}
                      title={b.desc}
                      className={`p-1.5 rounded-lg border text-left transition ${
                        canAfford
                          ? 'bg-paper-50 border-paper-300 hover:border-jade-600'
                          : 'bg-paper-200/50 border-paper-300/50 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-serif font-bold text-ink-900">
                        <span>
                          {b.emoji} {b.name}
                        </span>
                        <span className="text-[10px] text-gold-600">{b.cost}石</span>
                      </div>
                      <div className="text-[9px] text-ink-500 truncate">{b.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
