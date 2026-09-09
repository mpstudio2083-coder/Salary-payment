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
  LayoutDashboard,
  ArrowRightLeft
} from 'lucide-react';
import { FiscalYearPayroll, SchoolInfo } from '../types';
import { toNepaliNumber } from '../utils/nepaliNumber';

interface HeaderProps {
  schoolInfo: SchoolInfo;
  currentYear: FiscalYearPayroll;
  availableYears: FiscalYearPayroll[];
  useNepaliDigits: boolean;
  autoCalculate: boolean;
  activeTab: 'register' | 'monthly' | 'two-year' | 'grade-split';
  onChangeTab: (tab: 'register' | 'monthly' | 'two-year' | 'grade-split') => void;
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
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner / School Info */}
      <div className="max-w-[1700px] mx-auto px-4 py-2.5 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-stone-100 pb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded">
                नेपाल सरकार • शिक्षा मन्त्रालय ढाँचा
              </span>
              <span className="text-xs text-stone-500 font-medium">
                अनुसूची अनुसारको आधिकारिक तलबी भर्पाई तथा मासिक प्रतिवेदन
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mt-0.5">
              {schoolInfo.schoolName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              {schoolInfo.address} | {currentYear.periodTitle}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Nepali / English Digits Toggle */}
            <button
              id="btn-toggle-digits"
              onClick={onToggleDigits}
              title="अंक लिपि परिवर्तन (नेपाली / अंग्रेजी)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded border border-stone-300 transition-colors"
            >
              <Languages className="w-3.5 h-3.5 text-stone-600" />
              <span>अंक: {useNepaliDigits ? 'नेपाली (१२३)' : 'English (123)'}</span>
            </button>

            {/* Auto Calculate Toggle */}
            <button
              id="btn-toggle-autocalc"
              onClick={onToggleAutoCalc}
              title="स्वतन्त्र / स्वचालित गणना"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                autoCalculate 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>स्वत: गणना: {autoCalculate ? 'चालु' : 'बन्द'}</span>
            </button>

            {/* Add 1 Grade to All Teachers Button */}
            <button
              id="btn-increment-grades"
              onClick={onIncrementAllGrades}
              title="सबै शिक्षकको १ ग्रेड थप्नुहोस् (नयाँ शैक्षिक सत्रको लागि)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>सबैमा +१ ग्रेड</span>
            </button>

            {/* Print Button */}
            <button
              id="btn-print-bharpai"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-xs transition-colors"
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
              <span>एक्सेल (Excel)</span>
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

        {/* Secondary Bar: Mode Switcher Tabs + Fiscal Year + Period Length */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
          {/* Main View Mode Navigation Tabs */}
          <div className="inline-flex rounded-lg border border-stone-300 p-1 bg-stone-100">
            <button
              id="tab-photo-register"
              onClick={() => onChangeTab('register')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-blue-700 shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <TableProperties className="w-4 h-4 text-blue-600" />
              <span>फोटो अनुसार तलबी भर्पाई (रजिस्टर)</span>
            </button>

            <button
              id="tab-monthly-dashboard"
              onClick={() => onChangeTab('monthly')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'monthly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>मासिक प्रतिवेदन तथा भत्ता</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                activeTab === 'monthly' ? 'bg-blue-800 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                साउन/चैत
              </span>
            </button>

            <button
              id="tab-two-year"
              onClick={() => onChangeTab('two-year')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'two-year'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>२ वर्ष प्रविष्टि तथा कुल तुलना</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                activeTab === 'two-year' ? 'bg-purple-900 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                दुवै साल हिसाब
              </span>
            </button>

            <button
              id="tab-grade-split"
              onClick={() => onChangeTab('grade-split')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'grade-split'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>९ महिना र ३ महिना (वैशाख ग्रेड)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                activeTab === 'grade-split' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-900'
              }`}>
                नयाँ ग्रेड
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Partial Day Tool */}
            {onOpenPartialSalaryModal && (
              <button
                type="button"
                onClick={onOpenPartialSalaryModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded-md shadow-2xs transition-colors"
                title="१ महिना १७ दिन वा अन्य आंशिक दिनको तलब हिसाब"
              >
                <Calculator className="w-3.5 h-3.5 text-blue-600" />
                <span>१ महिना १७ दिन क्याल्कुलेटर</span>
              </button>
            )}
            {/* Fiscal Year Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="select-fiscal-year" className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>आर्थिक वर्ष:</span>
              </label>
              <select
                id="select-fiscal-year"
                value={currentYear.fiscalYear}
                onChange={(e) => onSelectYear(e.target.value)}
                className="bg-white border border-stone-300 text-stone-900 text-xs rounded px-2.5 py-1.5 font-bold focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-xs cursor-pointer"
              >
                {availableYears.map((yr) => (
                  <option key={yr.fiscalYear} value={yr.fiscalYear}>
                    आ.व. {yr.fiscalYear}
                  </option>
                ))}
              </select>
              <button
                id="btn-manage-years"
                onClick={onOpenYearModal}
                className="text-xs text-blue-700 hover:text-blue-900 font-medium underline underline-offset-2 flex items-center gap-1 ml-1"
              >
                <Sliders className="w-3 h-3" />
                <span>वर्ष व्यवस्थापन</span>
              </button>
            </div>

            {/* Period selector (only relevant in register view) */}
            {activeTab === 'register' && (
              <div className="flex items-center gap-1.5 border-l border-stone-200 pl-3">
                <span className="text-xs font-semibold text-stone-700">अवधि:</span>
                <div className="inline-flex rounded-md shadow-2xs">
                  {[
                    { label: '१ महिना (मासिक)', months: 1 },
                    { label: '३ महिना (त्रैमासिक)', months: 3 },
                    { label: '४ महिना (चौमासिक)', months: 4 },
                    { label: '१२ महिना (वार्षिक)', months: 12 },
                  ].map((opt) => (
                    <button
                      key={opt.months}
                      id={`btn-period-${opt.months}`}
                      onClick={() => onChangeMonthsCount(opt.months)}
                      className={`px-2 py-1 text-xs font-medium border first:rounded-l last:rounded-r -ml-px transition-colors ${
                        currentYear.monthsCount === opt.months
                          ? 'bg-blue-600 text-white border-blue-600 z-10'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      {useNepaliDigits ? toNepaliNumber(opt.months) : opt.months} महिना
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reset / Add Teacher Buttons */}
            <div className="flex items-center gap-2 border-l border-stone-200 pl-2">
              <button
                id="btn-reset-data"
                onClick={onResetData}
                title="फोटोको मूल डाटा रिसेट गर्नुहोस्"
                className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 px-2 py-1 rounded hover:bg-stone-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>रिसेट</span>
              </button>

              <button
                id="btn-add-teacher"
                onClick={onOpenTeacherModal}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>शिक्षक थप्नुहोस्</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

