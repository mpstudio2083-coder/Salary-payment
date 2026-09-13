import React, { useState } from 'react';
import { 
  Users, 
  Coins, 
  Banknote, 
  Receipt, 
  ShieldAlert, 
  CheckCircle2, 
  TableProperties, 
  Calendar, 
  SlidersHorizontal, 
  ArrowRight, 
  Printer, 
  Sparkles,
  School,
  Building,
  GraduationCap,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { TeacherRecord, SchoolInfo, NepaliMonth } from '../types';
import { formatNepaliCurrency, toNepaliNumber, numberToNepaliWords } from '../utils/nepaliNumber';
import { calculateGrandTotals } from '../utils/calculations';

interface MainDashboardProps {
  teachers: TeacherRecord[];
  schoolInfo: SchoolInfo;
  fiscalYear: string;
  monthsCount: number;
  useNepaliDigits: boolean;
  onNavigateTab: (tab: 'register' | 'quarterly-allowances' | 'monthly' | 'grade-split') => void;
  onSelectQuarter?: (quarter: string) => void;
  onPrint?: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  teachers,
  schoolInfo,
  fiscalYear,
  monthsCount,
  useNepaliDigits,
  onNavigateTab,
  onSelectQuarter,
  onPrint
}) => {
  // Mode toggle: Live dynamic calculations vs. Official photo verified figures
  const [useOfficialTarget, setUseOfficialTarget] = useState<boolean>(true);

  const activeTeachers = teachers.filter((t) => !t.isHidden);
  const liveTotals = calculateGrandTotals(activeTeachers);

  // Formatting helpers
  const format = (val: number | undefined | null) =>
    formatNepaliCurrency(val, { nepaliDigits: useNepaliDigits });

  const num = (val: number | string | undefined | null) =>
    useNepaliDigits ? toNepaliNumber(val) : (val !== undefined && val !== null ? val.toString() : '0');

  // Teacher level groupings
  const mawiTeachers = activeTeachers.filter((t) => t.designation.includes('मा.वि.') && !t.designation.includes('नि.मा.वि.') && !t.designation.includes('प्रा.वि.'));
  const nimawiTeachers = activeTeachers.filter((t) => t.designation.includes('नि.मा.वि.'));
  const prawiTeachers = activeTeachers.filter((t) => t.designation.includes('प्रा.वि.'));
  const rahatTeachers = activeTeachers.filter((t) => t.designation.includes('राहत'));
  const staffTeachers = activeTeachers.filter((t) => 
    !t.designation.includes('मा.वि.') && 
    !t.designation.includes('नि.मा.वि.') && 
    !t.designation.includes('प्रा.वि.') && 
    !t.designation.includes('राहत')
  );

  // Dynamic 12-Month Calculations (Accounting for Dashain & Poshak)
  const dynamic1MonthGross = liveTotals.monthlyGross;
  const dynamicTotalDashain = activeTeachers.reduce((acc, t) => {
    if (t.dashainBhatta !== undefined && t.dashainBhatta > 0) return acc + t.dashainBhatta;
    const basicPlusGrade = (t.basicSalary || 0) + (t.gradeAmount || 0);
    return acc + (t.category === 'permanent' || t.designation.includes('वि.') ? basicPlusGrade : 0);
  }, 0);

  const dynamicTotalPoshak = activeTeachers.reduce((acc, t) => {
    if (t.poshakBhatta !== undefined && t.poshakBhatta > 0) return acc + t.poshakBhatta;
    return acc + (t.category === 'permanent' || t.designation.includes('वि.') ? 10000 : 0);
  }, 0);

  const dynamic12MonthGross = Math.round((dynamic1MonthGross * 12 + dynamicTotalDashain + dynamicTotalPoshak) * 100) / 100;
  const dynamic12MonthKatti = Math.round((liveTotals.monthlyKatti * 12) * 100) / 100;
  const dynamic12MonthTax = Math.round(((dynamic12MonthGross - dynamic12MonthKatti) * 0.01) * 100) / 100;
  const dynamic12MonthNet = Math.round((dynamic12MonthGross - dynamic12MonthKatti - dynamic12MonthTax) * 100) / 100;

  // The 6 Target Metrics (User's Exact Verified Official Targets)
  // सक्रिय शिक्षक/कर्मचारी: २४ जना
  // १ महिनाको कुल जम्मा: रू १०,१५,२०८.८० (तलब + ग्रेड + कोष + भत्ता)
  // १२ महिनाको कुल जम्मा: रू १,२२,२१,०२२.०० (सरकारी निकासा कुल रकम)
  // कुल कट्टी रकम: रू २७,९४,१११.८० (क. कोष, बिमा र नागरिक लगानी कोष)
  // १% सामाजिक सुरक्षा कर: रू ९४,२६९.११ (आन्तरिक राजस्व कर कट्टी)
  // कुल खुद पाउने रकम: रू ९३,३२,६४१.०९ (बैंक खातामा जाने खुद रकम)
  const officialStaffCount = 24;
  const official1MonthGross = 1015208.80;
  const official12MonthGross = 12221022.00;
  const official12MonthKatti = 2794111.80;
  const official12MonthTax = 94269.11;
  const official12MonthNet = 9332641.09;

  // Current display values depending on toggle
  const displayStaffCount = useOfficialTarget ? officialStaffCount : activeTeachers.length;
  const display1MonthGross = useOfficialTarget ? official1MonthGross : dynamic1MonthGross;
  const display12MonthGross = useOfficialTarget ? official12MonthGross : dynamic12MonthGross;
  const display12MonthKatti = useOfficialTarget ? official12MonthKatti : dynamic12MonthKatti;
  const display12MonthTax = useOfficialTarget ? official12MonthTax : dynamic12MonthTax;
  const display12MonthNet = useOfficialTarget ? official12MonthNet : dynamic12MonthNet;

  const displayNetWords = numberToNepaliWords(display12MonthNet);

  // 4 Quarters estimated breakdown
  const q1Gross = Math.round((display1MonthGross * 3 + (useOfficialTarget ? 661416 : dynamicTotalDashain)) * 100) / 100;
  const q1Katti = Math.round((display12MonthKatti / 4) * 100) / 100;
  const q1Tax = Math.round(((q1Gross - q1Katti) * 0.01) * 100) / 100;
  const q1Net = Math.round((q1Gross - q1Katti - q1Tax) * 100) / 100;

  const q2Gross = Math.round((display1MonthGross * 3) * 100) / 100;
  const q2Katti = Math.round((display12MonthKatti / 4) * 100) / 100;
  const q2Tax = Math.round(((q2Gross - q2Katti) * 0.01) * 100) / 100;
  const q2Net = Math.round((q2Gross - q2Katti - q2Tax) * 100) / 100;

  const q3Gross = Math.round((display1MonthGross * 3 + (useOfficialTarget ? 170000 : dynamicTotalPoshak)) * 100) / 100;
  const q3Katti = Math.round((display12MonthKatti / 4) * 100) / 100;
  const q3Tax = Math.round(((q3Gross - q3Katti) * 0.01) * 100) / 100;
  const q3Net = Math.round((q3Gross - q3Katti - q3Tax) * 100) / 100;

  const q4Gross = Math.round((display12MonthGross - (q1Gross + q2Gross + q3Gross)) * 100) / 100;
  const q4Katti = Math.round((display12MonthKatti - (q1Katti + q2Katti + q3Katti)) * 100) / 100;
  const q4Tax = Math.round(((q4Gross - q4Katti) * 0.01) * 100) / 100;
  const q4Net = Math.round((q4Gross - q4Katti - q4Tax) * 100) / 100;

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-4 space-y-5">
      {/* 1. Header Banner */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <School className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                मुख्य तलबी ड्यासबोर्ड (Dashboard)
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {schoolInfo.address}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                आ.व. {fiscalYear}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {schoolInfo.schoolName}
            </h1>
            <p className="text-xs text-stone-600 mt-0.5">
              शिक्षक तथा कर्मचारीहरूको तलब, ग्रेड, कोष, भत्ता, कट्टी तथा बैंक खातामा जाने खुद रकमको एकीकृत सारांश
            </p>
          </div>
        </div>

        {/* Quick View Controls & Navigation */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Official Target vs Live Data Toggle */}
          <button
            type="button"
            onClick={() => setUseOfficialTarget((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              useOfficialTarget
                ? 'bg-blue-50 text-blue-900 border-blue-300 shadow-2xs'
                : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
            }`}
            title="आधिकारिक फोटो लक्ष्य र हालको तालिका गणना बीच स्विच गर्नुहोस्"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{useOfficialTarget ? 'फोटो प्रमाणित लक्ष्य (२४ जना)' : 'हालको तालिका गणना'}</span>
          </button>

          {/* Go to Photo Register / Payroll Table */}
          <button
            type="button"
            onClick={() => onNavigateTab('register')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-xs transition-colors cursor-pointer"
          >
            <TableProperties className="w-4 h-4" />
            <span>तलबी भर्पाई हेर्नुहोस्</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Go to Quarterly Allowance Entry */}
          <button
            type="button"
            onClick={() => onNavigateTab('quarterly-allowances')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 shadow-2xs transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
            <span>त्रैमासिक भत्ता इन्ट्री</span>
          </button>
        </div>
      </div>

      {/* 2. THE 6 PRIMARY EXECUTIVE SUMMARY CARDS (User Specification) */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h2 className="text-sm font-extrabold text-stone-900 uppercase tracking-wide">
              निकासा तथा भुक्तानी प्रमुख परिसूचकहरू (Key Financial Indicators)
            </h2>
          </div>
          <span className="text-[11px] text-stone-500 font-medium">
            {useOfficialTarget ? 'फोटो अनुसार प्रमाणित सरकारी तथ्याङ्क' : `हालको तालिकामा ${num(activeTeachers.length)} जना`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Card 1: सक्रिय शिक्षक/कर्मचारी */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-colors">
            <div>
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-bold text-stone-700">सक्रिय शिक्षक/कर्मचारी</span>
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-stone-900 font-mono mt-1">
                {num(displayStaffCount)} <span className="text-sm font-bold text-stone-600">जना</span>
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-500 font-medium">
              <span>मा.वि., नि.मा.वि., प्रा.वि. र कर्मचारी</span>
            </div>
          </div>

          {/* Card 2: १ महिनाको कुल जम्मा */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
            <div>
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-bold text-stone-700">१ महिनाको कुल जम्मा</span>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-black text-emerald-950 font-mono mt-1">
                रू {format(display1MonthGross)}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-500 font-medium">
              <span>तलब + ग्रेड + कोष + भत्ता</span>
            </div>
          </div>

          {/* Card 3: १२ महिनाको कुल जम्मा */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
            <div>
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-bold text-stone-700">१२ महिनाको कुल जम्मा</span>
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                  <Banknote className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-black text-indigo-950 font-mono mt-1">
                रू {format(display12MonthGross)}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-500 font-medium">
              <span>सरकारी निकासा कुल रकम</span>
            </div>
          </div>

          {/* Card 4: कुल कट्टी रकम */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex flex-col justify-between hover:border-rose-300 transition-colors">
            <div>
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-bold text-stone-700">कुल कट्टी रकम</span>
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-black text-rose-900 font-mono mt-1">
                रू {format(display12MonthKatti)}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-500 font-medium">
              <span>क. कोष, बिमा र नागरिक लगानी कोष</span>
            </div>
          </div>

          {/* Card 5: १% सामाजिक सुरक्षा कर */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex flex-col justify-between hover:border-amber-300 transition-colors">
            <div>
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-bold text-stone-700">१% सामाजिक सुरक्षा कर</span>
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-black text-amber-950 font-mono mt-1">
                रू {format(display12MonthTax)}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-500 font-medium">
              <span>आन्तरिक राजस्व कर कट्टी</span>
            </div>
          </div>

          {/* Card 6: कुल खुद पाउने रकम (खुद) */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-4 rounded-xl shadow-xs text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-3 -bottom-3 opacity-15 pointer-events-none">
              <CheckCircle2 className="w-24 h-24 text-white" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-100">कुल खुद पाउने रकम</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
                  खुद
                </span>
              </div>
              <p className="text-lg sm:text-xl font-black text-white font-mono mt-1 tracking-tight">
                रू {format(display12MonthNet)}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-white/20 text-[11px] text-emerald-100 font-semibold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-white" />
              <span>बैंक खातामा जाने खुद रकम</span>
            </div>
          </div>
        </div>

        {/* Words Banner */}
        <div className="mt-3 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-stone-900">अक्षरूपी (वार्षिक खुद भुक्तानी):</span>
            <span className="text-stone-800 font-semibold italic">{displayNetWords}</span>
          </div>
          <div className="text-stone-500 text-[11px] font-mono font-medium">
            (मासिक खुद जम्मा: रू {format(display1MonthGross - (display12MonthKatti / 12) - (display12MonthTax / 12))})
          </div>
        </div>
      </div>

      {/* 3. QUARTERLY PERIOD BREAKDOWN TABLE (त्रैमासिक अवधि बजेट तथा निकासा सारांश) */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 bg-stone-50/80 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
              त्रैमासिक अवधि बजेट तथा निकासा तालिका (Quarterly Breakdown)
            </h3>
            <span className="text-[11px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold">
              ४ वटै त्रैमासिक
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('quarterly-allowances')}
            className="text-xs text-blue-700 hover:text-blue-900 font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            <span>त्रैमासिक भत्ता रकम इन्ट्री / व्यवस्थापन गर्नुहोस्</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-stone-800 border-collapse">
            <thead className="bg-stone-100/90 text-stone-900 font-bold border-b border-stone-300">
              <tr>
                <th className="px-3 py-2.5 text-left min-w-[140px]">त्रैमासिक अवधि</th>
                <th className="px-3 py-2.5 text-left min-w-[130px]">महिनाहरू</th>
                <th className="px-3 py-2.5 text-left min-w-[160px]">विशेष समावेश भत्ता</th>
                <th className="px-3 py-2.5 text-right min-w-[120px]">कुल निकासा</th>
                <th className="px-3 py-2.5 text-right min-w-[110px] text-rose-900">कुल कट्टी</th>
                <th className="px-3 py-2.5 text-right min-w-[90px] text-amber-900">१% कर</th>
                <th className="px-3 py-2.5 text-right min-w-[130px] font-black text-emerald-950 bg-emerald-50/70">बैंक जाने खुद</th>
                <th className="px-3 py-2.5 text-center min-w-[110px]">कार्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-mono">
              {/* Q1 */}
              <tr className="hover:bg-blue-50/30 transition-colors">
                <td className="px-3 py-3 font-sans font-bold text-stone-900">
                  पहिलो त्रैमासिक (Q1)
                </td>
                <td className="px-3 py-3 font-sans text-stone-600">
                  साउन - असोज (३ महिना)
                </td>
                <td className="px-3 py-3 font-sans">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                    🎁 दसैं भत्ता (साउन)
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-bold text-stone-900">
                  रू {format(q1Gross)}
                </td>
                <td className="px-3 py-3 text-right text-rose-800 font-medium">
                  रू {format(q1Katti)}
                </td>
                <td className="px-3 py-3 text-right text-amber-900 font-medium">
                  रू {format(q1Tax)}
                </td>
                <td className="px-3 py-3 text-right font-black text-emerald-900 bg-emerald-50/40">
                  रू {format(q1Net)}
                </td>
                <td className="px-3 py-3 text-center font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectQuarter) onSelectQuarter('first');
                      onNavigateTab('register');
                    }}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 transition-colors cursor-pointer"
                  >
                    भर्पाई खोल्नुहोस्
                  </button>
                </td>
              </tr>

              {/* Q2 */}
              <tr className="hover:bg-blue-50/30 transition-colors">
                <td className="px-3 py-3 font-sans font-bold text-stone-900">
                  दोस्रो त्रैमासिक (Q2)
                </td>
                <td className="px-3 py-3 font-sans text-stone-600">
                  कात्तिक - पुस (३ महिना)
                </td>
                <td className="px-3 py-3 font-sans">
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700">
                    नियमित मासिक तलब
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-bold text-stone-900">
                  रू {format(q2Gross)}
                </td>
                <td className="px-3 py-3 text-right text-rose-800 font-medium">
                  रू {format(q2Katti)}
                </td>
                <td className="px-3 py-3 text-right text-amber-900 font-medium">
                  रू {format(q2Tax)}
                </td>
                <td className="px-3 py-3 text-right font-black text-emerald-900 bg-emerald-50/40">
                  रू {format(q2Net)}
                </td>
                <td className="px-3 py-3 text-center font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectQuarter) onSelectQuarter('second');
                      onNavigateTab('register');
                    }}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 transition-colors cursor-pointer"
                  >
                    भर्पाई खोल्नुहोस्
                  </button>
                </td>
              </tr>

              {/* Q3 */}
              <tr className="hover:bg-blue-50/30 transition-colors">
                <td className="px-3 py-3 font-sans font-bold text-stone-900">
                  तेस्रो त्रैमासिक (Q3)
                </td>
                <td className="px-3 py-3 font-sans text-stone-600">
                  माघ - चैत (३ महिना)
                </td>
                <td className="px-3 py-3 font-sans">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                    👔 पोशाक भत्ता (चैत)
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-bold text-stone-900">
                  रू {format(q3Gross)}
                </td>
                <td className="px-3 py-3 text-right text-rose-800 font-medium">
                  रू {format(q3Katti)}
                </td>
                <td className="px-3 py-3 text-right text-amber-900 font-medium">
                  रू {format(q3Tax)}
                </td>
                <td className="px-3 py-3 text-right font-black text-emerald-900 bg-emerald-50/40">
                  रू {format(q3Net)}
                </td>
                <td className="px-3 py-3 text-center font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectQuarter) onSelectQuarter('third');
                      onNavigateTab('register');
                    }}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 transition-colors cursor-pointer"
                  >
                    भर्पाई खोल्नुहोस्
                  </button>
                </td>
              </tr>

              {/* Q4 */}
              <tr className="hover:bg-blue-50/30 transition-colors">
                <td className="px-3 py-3 font-sans font-bold text-stone-900">
                  चौथो त्रैमासिक (Q4)
                </td>
                <td className="px-3 py-3 font-sans text-stone-600">
                  वैशाख - असार (३ महिना)
                </td>
                <td className="px-3 py-3 font-sans">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    ⭐ नयाँ ग्रेड वृद्धि (वैशाख १)
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-bold text-stone-900">
                  रू {format(q4Gross)}
                </td>
                <td className="px-3 py-3 text-right text-rose-800 font-medium">
                  रू {format(q4Katti)}
                </td>
                <td className="px-3 py-3 text-right text-amber-900 font-medium">
                  रू {format(q4Tax)}
                </td>
                <td className="px-3 py-3 text-right font-black text-emerald-900 bg-emerald-50/40">
                  रू {format(q4Net)}
                </td>
                <td className="px-3 py-3 text-center font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectQuarter) onSelectQuarter('fourth');
                      onNavigateTab('register');
                    }}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 transition-colors cursor-pointer"
                  >
                    भर्पाई खोल्नुहोस्
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-stone-100 border-t-2 border-stone-400 font-mono font-bold">
              <tr>
                <td className="px-3 py-3 font-sans text-stone-900 text-sm font-black" colSpan={3}>
                  वार्षिक कुल निकासा (१२ महिना)
                </td>
                <td className="px-3 py-3 text-right text-stone-950 font-black">
                  रू {format(display12MonthGross)}
                </td>
                <td className="px-3 py-3 text-right text-rose-900 font-black">
                  रू {format(display12MonthKatti)}
                </td>
                <td className="px-3 py-3 text-right text-amber-950 font-black">
                  रू {format(display12MonthTax)}
                </td>
                <td className="px-3 py-3 text-right text-emerald-950 bg-emerald-100 font-black text-sm">
                  रू {format(display12MonthNet)}
                </td>
                <td className="px-3 py-3 text-center font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectQuarter) onSelectQuarter('yearly');
                      onNavigateTab('register');
                    }}
                    className="text-[11px] font-bold text-white bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded shadow-2xs transition-colors cursor-pointer"
                  >
                    वार्षिक भर्पाई
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 4. DESIGNATION / LEVEL BREAKDOWN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3.5">
        {/* Secondary (मा.वि.) */}
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <span className="font-extrabold text-xs text-stone-900">माध्यमिक तह (मा.वि.)</span>
            <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {num(mawiTeachers.length)} जना
            </span>
          </div>
          <div className="mt-2.5 space-y-1 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>मासिक तलब स्केल:</span>
              <span className="font-bold font-mono text-stone-800">
                रू {format(mawiTeachers.reduce((s, t) => s + (t.basicSalary || 0), 0))}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>मासिक निकासा:</span>
              <span className="font-bold font-mono text-indigo-900">
                रू {format(mawiTeachers.reduce((s, t) => s + (t.monthlyGross || 0), 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Lower Secondary (नि.मा.वि.) */}
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <span className="font-extrabold text-xs text-stone-900">निम्न माध्यमिक (नि.मा.वि.)</span>
            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              {num(nimawiTeachers.length)} जना
            </span>
          </div>
          <div className="mt-2.5 space-y-1 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>मासिक तलब स्केल:</span>
              <span className="font-bold font-mono text-stone-800">
                रू {format(nimawiTeachers.reduce((s, t) => s + (t.basicSalary || 0), 0))}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>मासिक निकासा:</span>
              <span className="font-bold font-mono text-indigo-900">
                रू {format(nimawiTeachers.reduce((s, t) => s + (t.monthlyGross || 0), 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Primary (प्रा.वि.) */}
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <span className="font-extrabold text-xs text-stone-900">प्राथमिक तह (प्रा.वि.)</span>
            <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
              {num(prawiTeachers.length)} जना
            </span>
          </div>
          <div className="mt-2.5 space-y-1 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>मासिक तलब स्केल:</span>
              <span className="font-bold font-mono text-stone-800">
                रू {format(prawiTeachers.reduce((s, t) => s + (t.basicSalary || 0), 0))}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>मासिक निकासा:</span>
              <span className="font-bold font-mono text-indigo-900">
                रू {format(prawiTeachers.reduce((s, t) => s + (t.monthlyGross || 0), 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Relief (राहत शिक्षक) */}
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <span className="font-extrabold text-xs text-stone-900">राहत शिक्षक</span>
            <span className="text-[11px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full">
              {num(rahatTeachers.length)} जना
            </span>
          </div>
          <div className="mt-2.5 space-y-1 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>मासिक तलब स्केल:</span>
              <span className="font-bold font-mono text-stone-800">
                रू {format(rahatTeachers.reduce((s, t) => s + (t.basicSalary || 0), 0))}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>मासिक निकासा:</span>
              <span className="font-bold font-mono text-indigo-900">
                रू {format(rahatTeachers.reduce((s, t) => s + (t.monthlyGross || 0), 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Staff / Employees */}
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <span className="font-extrabold text-xs text-stone-900">कर्मचारी तथा बालविकास</span>
            <span className="text-[11px] font-bold bg-stone-200 text-stone-800 px-2 py-0.5 rounded-full">
              {num(staffTeachers.length)} जना
            </span>
          </div>
          <div className="mt-2.5 space-y-1 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>मासिक तलब स्केल:</span>
              <span className="font-bold font-mono text-stone-800">
                रू {format(staffTeachers.reduce((s, t) => s + (t.basicSalary || 0), 0))}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>मासिक निकासा:</span>
              <span className="font-bold font-mono text-indigo-900">
                रू {format(staffTeachers.reduce((s, t) => s + (t.monthlyGross || 0), 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. QUICK NAVIGATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div 
          onClick={() => onNavigateTab('register')}
          className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-extrabold text-stone-900 text-sm group-hover:text-blue-700 transition-colors">
              फोटो अनुसार तलबी भर्पाई (Master Register)
            </span>
            <TableProperties className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs text-stone-600">
            १९ देखि २४ जना शिक्षक/कर्मचारीको पूर्ण तलबी भर्पाई तालिका, ग्रेड दर, कोष, बिमा, र कट्टी सहितको मास्टर पाना।
          </p>
          <div className="mt-3 text-xs font-bold text-blue-700 flex items-center gap-1">
            <span>भर्पाई तालिका हेर्नुहोस्</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('quarterly-allowances')}
          className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs hover:shadow-sm hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-extrabold text-stone-900 text-sm group-hover:text-amber-700 transition-colors">
              त्रैमासिक भत्ता रकम इन्ट्री (Allowance Entry)
            </span>
            <SlidersHorizontal className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-xs text-stone-600">
            त्रैमासिक अवधि अनुसार दसैं भत्ता, पोशाक भत्ता, अन्य भत्ता, र प्रोत्साहन भत्ताको रकम सजिलै इन्ट्री तथा सम्पादन गर्नुहोस्।
          </p>
          <div className="mt-3 text-xs font-bold text-amber-800 flex items-center gap-1">
            <span>भत्ता इन्ट्री व्यवस्थापन</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('monthly')}
          className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs hover:shadow-sm hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-extrabold text-stone-900 text-sm group-hover:text-emerald-700 transition-colors">
              मासिक तलबी प्रतिवेदन (साउन/चैत)
            </span>
            <Calendar className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xs text-stone-600">
            १२ महिनाको छुट्टाछुट्टै मासिक तलबी भर्पाई, साउनमा दसैं भत्ता र चैतमा पोशाक भत्ता सहितको रिपोर्ट तथा प्रिन्ट।
          </p>
          <div className="mt-3 text-xs font-bold text-emerald-800 flex items-center gap-1">
            <span>मासिक प्रतिवेदन खोल्नुहोस्</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
