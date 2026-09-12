import React from 'react';
import { 
  Printer, 
  Download, 
  Plus, 
  Calendar, 
  RotateCcw, 
  Settings, 
  Sliders, 
  Calculator,
  Languages,
  Award,
  TableProperties,
  LayoutDashboard
} from 'lucide-react';
import { FiscalYearPayroll, SchoolInfo } from '../types';
import { toNepaliNumber } from '../utils/nepaliNumber';

interface HeaderProps {
  schoolInfo: SchoolInfo;
  currentYear: FiscalYearPayroll;
  availableYears: FiscalYearPayroll[];
  useNepaliDigits: boolean;
  autoCalculate: boolean;
  activeTab: 'register' | 'monthly' | 'grade-split';
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onChangeTab: (tab: 'register' | 'monthly' | 'grade-split') => void;
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
  onOpenPartialSalaryModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  schoolInfo,
  currentYear,
  availableYears,
  useNepaliDigits,
  autoCalculate,
  activeTab,
  isSidebarCollapsed,
  onToggleSidebar,
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
  onOpenPartialSalaryModal
}) => {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-2xs">
      {/* Top Banner / School Info */}
      <div className="w-full px-4 py-2.5 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                title={isSidebarCollapsed ? 'देब्रे साइडबार खोल्नुहोस् (Show Sidebar)' : 'देब्रे साइडबार लुकाउनुहोस्'}
                className="p-2 text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-300 shrink-0"
              >
                <Sliders className="w-4 h-4 text-blue-700" />
              </button>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded">
                  नेपाल सरकार ढाँचा
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  {schoolInfo.address}
                </span>
                <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-200">
                  आ.व. {currentYear.fiscalYear}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight mt-0.5">
                {schoolInfo.schoolName}
              </h1>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Active view badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-lg text-xs font-semibold text-stone-700 border border-stone-200">
              {activeTab === 'monthly' && (
                <>
                  <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                  <span>मासिक प्रतिवेदन ड्यासबोर्ड (साउन/चैत)</span>
                </>
              )}
              {activeTab === 'register' && (
                <>
                  <TableProperties className="w-3.5 h-3.5 text-blue-600" />
                  <span>फोटो अनुसार तलबी भर्पाई (रजिस्टर)</span>
                </>
              )}
              {activeTab === 'grade-split' && (
                <>
                  <Calculator className="w-3.5 h-3.5 text-amber-600" />
                  <span>९ महिना र ३ महिना (वैशाख नयाँ ग्रेड)</span>
                </>
              )}
            </div>

            {/* Print Button */}
            <button
              id="btn-print-bharpai"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिन्ट / PDF</span>
            </button>

            {/* Export CSV */}
            <button
              id="btn-export-excel"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>एक्सेल</span>
            </button>

            {/* Add Teacher */}
            <button
              id="btn-add-teacher"
              onClick={onOpenTeacherModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ शिक्षक थप्नुहोस्</span>
            </button>

            {/* School Settings */}
            <button
              id="btn-open-settings"
              onClick={onOpenSettingsModal}
              title="विद्यालय र हस्ताक्षरकर्ता विवरण"
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded border border-stone-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

