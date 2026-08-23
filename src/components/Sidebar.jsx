import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';
import { FILTER_OPTIONS, TAG_CONFIG } from '../data/certificates';

function FilterGroup({ groupKey, label, options, selected, onToggle, config }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/5"
      >
        <span>{label}</span>
        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {isOpen && (
        <div className="mt-1 space-y-0.5">
          {options.map((opt) => {
            const cfg = config[opt] || {};
            const isActive = selected.includes(opt);

            return (
              <label
                key={opt}
                className={`sidebar-checkbox ${isActive ? 'active' : ''}`}
                htmlFor={`filter-${groupKey}-${opt}`}
              >
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    id={`filter-${groupKey}-${opt}`}
                    checked={isActive}
                    onChange={() => onToggle(groupKey, opt)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-600 border-brand-500'
                      : 'bg-white/5 border-white/15'
                  }`}>
                    {isActive && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>

                <span className="text-sm flex items-center gap-1.5">
                  <span>{cfg.icon}</span>
                  <span>{opt}</span>
                </span>

                {isActive && cfg.dot && (
                  <span className={`ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ filters, onToggle, onClear }) {
  const activeCount = Object.values(filters).flat().length;

  return (
    <aside className="glass-sidebar fixed left-0 top-16 bottom-0 w-64 overflow-y-auto hidden lg:flex flex-col z-40">
      <div className="p-4 flex flex-col gap-4 flex-1">

        {/* Sidebar Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600/20 flex items-center justify-center">
              <SlidersHorizontal size={13} className="text-brand-400" />
            </div>
            <span className="text-sm font-semibold text-slate-200">ตัวกรอง</span>
          </div>
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400 transition-colors px-2 py-1 rounded-lg hover:bg-rose-500/10"
            >
              <X size={11} />
              ล้าง ({activeCount})
            </button>
          )}
        </div>

        {/* Active filter pills summary */}
        {activeCount > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(filters).map(([groupKey, vals]) =>
              vals.map((val) => {
                const cfgMap = groupKey === 'ownerType' ? TAG_CONFIG.owner_type
                  : groupKey === 'itemType' ? TAG_CONFIG.item_type
                  : TAG_CONFIG.level;
                const cfg = cfgMap[val] || {};
                return (
                  <button
                    key={`${groupKey}-${val}`}
                    onClick={() => onToggle(groupKey, val)}
                    className={`tag border text-xs ${cfg.bg} ${cfg.text} ${cfg.border} gap-1`}
                  >
                    {cfg.icon} {val}
                    <X size={9} className="ml-0.5 opacity-60" />
                  </button>
                );
              })
            )}
          </div>
        )}

        <div className="h-px bg-white/5" />

        {/* Filter Groups */}
        <div className="space-y-2">
          <FilterGroup
            groupKey="ownerType"
            label={FILTER_OPTIONS.ownerType.label}
            options={FILTER_OPTIONS.ownerType.options}
            selected={filters.ownerType}
            onToggle={onToggle}
            config={TAG_CONFIG.owner_type}
          />
          <div className="h-px bg-white/5 mx-3" />
          <FilterGroup
            groupKey="itemType"
            label={FILTER_OPTIONS.itemType.label}
            options={FILTER_OPTIONS.itemType.options}
            selected={filters.itemType}
            onToggle={onToggle}
            config={TAG_CONFIG.item_type}
          />
          <div className="h-px bg-white/5 mx-3" />
          <FilterGroup
            groupKey="level"
            label={FILTER_OPTIONS.level.label}
            options={FILTER_OPTIONS.level.options}
            selected={filters.level}
            onToggle={onToggle}
            config={TAG_CONFIG.level}
          />
        </div>

      </div>

      {/* Footer stat */}
      <div className="p-4 border-t border-white/5">
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-[10px] text-slate-500 mb-1">เกียรติบัตรทั้งหมด</p>
          <p className="text-xl font-bold gradient-text">2,847</p>
          <p className="text-[10px] text-slate-500 mt-1">อัปเดตล่าสุด วันนี้</p>
        </div>
      </div>
    </aside>
  );
}
