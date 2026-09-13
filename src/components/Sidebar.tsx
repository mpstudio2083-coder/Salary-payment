import React from 'react';
import { 
  LayoutDashboard, 
  TableProperties, 
  Calculator, 
  Award, 
  Calendar, 
  Sliders, 
  RotateCcw, 
  Plus, 
  Printer, 
  Download, 
  Settings, 
  Languages, 
  ChevronLeft, 
  ChevronRight,
  School,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { FiscalYearPayroll, SchoolInfo } from '../types';
import { toNepaliNumber } from '../utils/nepaliNumber';

interface SidebarProps {
  schoolInfo: SchoolInfo;
  currentYear: FiscalYearPayroll;
  availableYears: FiscalYearPayroll[];
  useNepaliDigits: boolean;
  autoCalculate: boolean;
  activeTab: 'register' | 'monthly' | 'grade-split' | 'quarterly-allowances';
  isCollapsed: boolean;
  onChangeTab: (tab: 'register' | 'monthly' | 'grade-split' | 'quarterly-allowances') => void;
  onSelectYear: (year: string) => void;
  onToggleDigits: () => void;
  onToggleAutoCalc: () => void;
  onOpenTeacherModal: () => void;
  onOpenYearModal: () => void;
  onOpenSettingsModal: () => void;
  onPrint: () => void;
  onExportCsv: () => void;
  onResetData: () => void;
  onIncrementAllGrades: () => void;
  onChangeMonthsCount: (months: number) => void;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  schoolInfo,
  currentYear,
  availableYears,
  useNepaliDigits,
  autoCalculate,
  activeTab,
  isCollapsed,
  onChangeTab,
  onSelectYear,
  onToggleDigits,
  onToggleAutoCalc,
  onOpenTeacherModal,
  onOpenYearModal,
  onOpenSettingsModal,
  onPrint,
  onExportCsv,
  onResetData,
  onIncrementAllGrades,
  onChangeMonthsCount,
  onToggleCollapse
}) => {
  return (
    <aside
      className={`bg-stone-900 text-stone-200 border-r border-stone-800 flex flex-col shrink-0 transition-all duration-300 z-40 print:hidden ${
        isCollapsed ? 'w-16' : 'w-72 sm:w-80'
      }`}
    >
      {/* 1. Header / School Branding */}
      <div className="p-3.5 border-b border-stone-800 flex items-center justify-between gap-2 bg-stone-950/70">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <School className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xs font-bold text-white truncate leading-tight">
                {schoolInfo.schoolName || 'श्री मंगल सिंह मा.वि.'}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-stone-400 truncate">{schoolInfo.address || 'झापा'}</span>
                <span className="text-[9px] bg-blue-900/80 text-blue-300 px-1 py-0.2 rounded font-mono font-semibold">
                  {currentYear.fiscalYear}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
              <School className="w-5 h-5" />
            </div>
          </div>
        )}

        {/* Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'साइडबार खोल्नुहोस्' : 'साइडबार बन्द गर्नुहोस्'}
          className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 transition-colors shrink-0"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Scrollable Body containing requested items */}
      <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-4">
        {/* Section A: मुख्य भर्पाई नेभिगेसन (Tabs) */}
        <div>
          {!isCollapsed && (
            <p className="text-[10px] font-bold tracking-wider text-stone-400 uppercase px-2 mb-1.5">
              भर्पाई तथा प्रतिवेदन
            </p>
          )}

          <div className="space-y-1">
            {/* १. मासिक प्रतिवेदन ड्यासबोर्ड (साउन/चैत) */}
            <button
              type="button"
              id="sidebar-tab-monthly"
              onClick={() => onChangeTab('monthly')}
              title="मासिक प्रतिवेदन ड्यासबोर्ड (साउन/चैत)"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                activeTab === 'monthly'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === 'monthly' ? 'text-white' : 'text-blue-400'}`} />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>मासिक प्रतिवेदन ड्यासबोर्ड</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                      activeTab === 'monthly'
                        ? 'bg-blue-800 text-white'
                        : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    }`}
                  >
                    साउन/चैत
                  </span>
                </div>
              )}
            </button>

            {/* २. फोटो अनुसार तलबी भर्पाई (रजिस्टर) */}
            <button
              type="button"
              id="sidebar-tab-register"
              onClick={() => onChangeTab('register')}
              title="फोटो अनुसार तलबी भर्पाई (रजिस्टर)"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                activeTab === 'register'
                  ? 'bg-white text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
              }`}
            >
              <TableProperties className={`w-4 h-4 shrink-0 ${activeTab === 'register' ? 'text-blue-700' : 'text-emerald-400'}`} />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>फोटो अनुसार तलबी भर्पाई</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                    activeTab === 'register' ? 'bg-stone-200 text-stone-900' : 'text-stone-400'
                  }`}>
                    रजिस्टर
                  </span>
                </div>
              )}
            </button>

            {/* ३. त्रैमासिक भत्ता प्रविष्टि (दसैं, पोशाक, प्रोत्साहन) */}
            <button
              type="button"
              id="sidebar-tab-allowances"
              onClick={() => onChangeTab('quarterly-allowances')}
              title="त्रैमासिक भत्ता प्रविष्टि (दसैं र पोशाक भत्ता प्रविष्टि)"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                activeTab === 'quarterly-allowances'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
              }`}
            >
              <Sliders className={`w-4 h-4 shrink-0 ${activeTab === 'quarterly-allowances' ? 'text-white' : 'text-amber-400'}`} />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>त्रैमासिक भत्ता प्रविष्टि</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                      activeTab === 'quarterly-allowances'
                        ? 'bg-amber-800 text-white'
                        : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    }`}
                  >
                    दसैं/पोशाक
                  </span>
                </div>
              )}
            </button>

            {/* ४. ९ महिना र ३ महिना (वैशाख ग्रेड) - नयाँ ग्रेड */}
            <button
              type="button"
              id="sidebar-tab-grade-split"
              onClick={() => onChangeTab('grade-split')}
              title="९ महिना र ३ महिना (वैशाख ग्रेड)"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                activeTab === 'grade-split'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
              }`}
            >
              <Sparkles className={`w-4 h-4 shrink-0 ${activeTab === 'grade-split' ? 'text-white' : 'text-emerald-400'}`} />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>९ महिना र ३ महिना</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                      activeTab === 'grade-split'
                        ? 'bg-amber-800 text-white'
                        : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    }`}
                  >
                    नयाँ ग्रेड
                  </span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Section B: द्रुत गणना तथा ग्रेड कार्यहरू (Calculations) */}
        <div>
          {!isCollapsed && (
            <p className="text-[10px] font-bold tracking-wider text-stone-400 uppercase px-2 mb-1.5">
              गणना तथा ग्रेड
            </p>
          )}

          <div className="space-y-1.5">
            {/* ४. स्वत: गणना: चालु / बन्द */}
            <button
              type="button"
              id="sidebar-btn-autocalc"
              onClick={onToggleAutoCalc}
              title={`स्वत: गणना: ${autoCalculate ? 'चालु (सक्रिय)' : 'बन्द'}`}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                autoCalculate
                  ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-750'
              }`}
            >
              <Calculator className={`w-4 h-4 shrink-0 ${autoCalculate ? 'text-emerald-400' : 'text-stone-400'}`} />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>स्वत: गणना:</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-extrabold flex items-center gap-1 ${
                      autoCalculate
                        ? 'bg-emerald-500 text-stone-950 shadow-2xs'
                        : 'bg-stone-700 text-stone-300'
                    }`}
                  >
                    {autoCalculate ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-stone-950" />
                        <span>चालु</span>
                      </>
                    ) : (
                      <span>बन्द</span>
                    )}
                  </span>
                </div>
              )}
            </button>

            {/* ५. सबैमा +१ ग्रेड */}
            <button
              type="button"
              id="sidebar-btn-increment-grades"
              onClick={onIncrementAllGrades}
              title="सबै स्थायी शिक्षकहरूको १ ग्रेड थप्नुहोस् (तहगत अधिकतम सिमा अनुसार)"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/60 transition-colors shadow-2xs"
            >
              <Award className="w-4 h-4 text-indigo-400 shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>सबैमा +१ ग्रेड</span>
                  <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.2 rounded font-extrabold">
                    +१
                  </span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Section C: वर्ष व्यवस्थापन (Fiscal Year & Period Management) */}
        <div>
          {!isCollapsed && (
            <p className="text-[10px] font-bold tracking-wider text-stone-400 uppercase px-2 mb-1.5">
              आर्थिक वर्ष तथा अवधि
            </p>
          )}

          <div className="space-y-2">
            {!isCollapsed ? (
              <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700/60 space-y-2">
                {/* ६. आर्थिक वर्ष Selector */}
                <div>
                  <label htmlFor="sidebar-select-fiscal-year" className="text-[11px] font-semibold text-stone-300 flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>आर्थिक वर्ष:</span>
                  </label>
                  <select
                    id="sidebar-select-fiscal-year"
                    value={currentYear.fiscalYear}
                    onChange={(e) => onSelectYear(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-600 text-white text-xs rounded px-2.5 py-1.5 font-bold focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {availableYears.map((yr) => (
                      <option key={`sidebar-year-${yr.fiscalYear}`} value={yr.fiscalYear}>
                        आ.व. {yr.fiscalYear}
                      </option>
                    ))}
                  </select>
                </div>

                {/* वर्ष व्यवस्थापन Button */}
                <button
                  type="button"
                  id="sidebar-btn-manage-years"
                  onClick={onOpenYearModal}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-blue-300 hover:text-white bg-blue-950/60 hover:bg-blue-900/80 border border-blue-800/70 py-1.5 rounded transition-colors font-medium"
                >
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  <span>वर्ष व्यवस्थापन</span>
                </button>

                {/* भर्पाई अवधि (Only when in photo register view) */}
                {activeTab === 'register' && (
                  <div className="pt-1.5 border-t border-stone-700/60">
                    <span className="text-[11px] font-semibold text-stone-300 block mb-1">
                      भर्पाई अवधि:
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      {[
                        { label: '१ महिना', months: 1 },
                        { label: '३ महिना', months: 3 },
                        { label: '४ महिना', months: 4 },
                        { label: '१२ महिना', months: 12 },
                      ].map((opt) => (
                        <button
                          key={`sidebar-period-${opt.months}`}
                          type="button"
                          onClick={() => onChangeMonthsCount(opt.months)}
                          className={`py-1 px-1.5 text-center font-medium rounded border transition-colors ${
                            currentYear.monthsCount === opt.months
                              ? 'bg-blue-600 text-white border-blue-500 font-bold'
                              : 'bg-stone-900 text-stone-300 border-stone-700 hover:bg-stone-750'
                          }`}
                        >
                          {useNepaliDigits ? toNepaliNumber(opt.months) : opt.months} महिना
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenYearModal}
                title={`वर्ष व्यवस्थापन (आ.व. ${currentYear.fiscalYear})`}
                className="w-full flex justify-center p-2 rounded-lg text-blue-400 bg-stone-800 hover:bg-stone-700"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Section D: थप कार्यहरू (+ शिक्षक, प्रिन्ट, सेटिङ, रिसेट) */}
        <div>
          {!isCollapsed && (
            <p className="text-[10px] font-bold tracking-wider text-stone-400 uppercase px-2 mb-1.5">
              कार्य तथा सेटिङ
            </p>
          )}

          <div className="space-y-1">
            {/* Add Teacher */}
            <button
              type="button"
              onClick={onOpenTeacherModal}
              title="नयाँ शिक्षक वा कर्मचारी थप्नुहोस्"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>+ नयाँ शिक्षक थप्नुहोस्</span>}
            </button>

            {/* Print / PDF */}
            <button
              type="button"
              onClick={onPrint}
              title="भर्पाई प्रिन्ट वा PDF सेभ गर्नुहोस्"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
            >
              <Printer className="w-4 h-4 text-blue-400 shrink-0" />
              {!isCollapsed && <span>प्रिन्ट / PDF पूर्वावलोकन</span>}
            </button>

            {/* Export CSV/Excel */}
            <button
              type="button"
              onClick={onExportCsv}
              title="एक्सेल (CSV) फाइल डाउनलोड गर्नुहोस्"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400 shrink-0" />
              {!isCollapsed && <span>एक्सेल (Excel) निर्यात</span>}
            </button>

            {/* Digits Toggle */}
            <button
              type="button"
              onClick={onToggleDigits}
              title="अंक लिपि परिवर्तन (नेपाली / अंग्रेजी)"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
            >
              <Languages className="w-4 h-4 text-amber-400 shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>अंक लिपि</span>
                  <span className="text-[10px] bg-stone-800 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    {useNepaliDigits ? 'नेपाली (१२३)' : 'English (123)'}
                  </span>
                </div>
              )}
            </button>

            {/* School Settings */}
            <button
              type="button"
              onClick={onOpenSettingsModal}
              title="विद्यालय र हस्ताक्षरकर्ता विवरण सेटिङ"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4 text-stone-400 shrink-0" />
              {!isCollapsed && <span>विद्यालय सेटिङ</span>}
            </button>

            {/* ७. रिसेट (Reset data) */}
            <button
              type="button"
              id="sidebar-btn-reset-data"
              onClick={onResetData}
              title="फोटो अनुसारको मूल डाटामा रिसेट गर्नुहोस्"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-300 hover:bg-rose-950/60 hover:text-rose-200 transition-colors border border-rose-900/40 mt-2"
            >
              <RotateCcw className="w-4 h-4 text-rose-400 shrink-0" />
              {!isCollapsed && <span>रिसेट (मूल डाटा)</span>}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Footer status */}
      {!isCollapsed && (
        <div className="p-3 border-t border-stone-800 text-[10px] text-stone-500 bg-stone-950/40 text-center">
          नेपाल सरकार • शिक्षा मन्त्रालय ढाँचा
        </div>
      )}
    </aside>
  );
};
