import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Calendar, 
  Plus, 
  Copy, 
  TrendingUp, 
  Download, 
  Printer, 
  Search, 
  Edit3, 
  Save, 
  Check, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { FiscalYearPayroll, TeacherRecord, SchoolInfo } from '../types';
import { formatNepaliCurrency, toNepaliNumber } from '../utils/nepaliNumber';
import { calculateGrandTotals, calculateTeacherPayroll } from '../utils/calculations';

interface TwoYearComparisonViewProps {
  fiscalYears: FiscalYearPayroll[];
  onUpdateFiscalYears: (updated: FiscalYearPayroll[]) => void;
  schoolInfo: SchoolInfo;
  useNepaliDigits: boolean;
  onOpenTeacherModalForYear?: (year: string, teacher?: TeacherRecord) => void;
}

export const TwoYearComparisonView: React.FC<TwoYearComparisonViewProps> = ({
  fiscalYears,
  onUpdateFiscalYears,
  schoolInfo,
  useNepaliDigits,
  onOpenTeacherModalForYear
}) => {
  // Select Year 1 and Year 2
  const availableYearNames = fiscalYears.map(y => y.fiscalYear);
  const [year1Name, setYear1Name] = useState<string>(
    availableYearNames.find(y => y.includes('२०८१')) || availableYearNames[1] || availableYearNames[0] || '२०८१/८२'
  );
  const [year2Name, setYear2Name] = useState<string>(
    availableYearNames.find(y => y.includes('२०८२')) || availableYearNames[0] || '२०८२/८३'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [inlineEditMode, setInlineEditMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const year1Data = fiscalYears.find(y => y.fiscalYear === year1Name) || fiscalYears[0];
  const year2Data = fiscalYears.find(y => y.fiscalYear === year2Name) || fiscalYears[1] || fiscalYears[0];

  const format = (val: number | undefined | null) => 
    formatNepaliCurrency(val, { nepaliDigits: useNepaliDigits });

  const num = (val: number | string | undefined | null) => 
    useNepaliDigits ? toNepaliNumber(val) : (val !== undefined && val !== null ? val.toString() : '0');

  // Unified teacher list (matching by name or id)
  const allTeacherNames = Array.from(
    new Set([
      ...(year1Data?.teachers || []).map(t => t.name),
      ...(year2Data?.teachers || []).map(t => t.name)
    ])
  );

  const combinedTeachers = allTeacherNames.map((name, index) => {
    const t1 = year1Data?.teachers.find(t => t.name === name);
    const t2 = year2Data?.teachers.find(t => t.name === name);
    return {
      sn: index + 1,
      name,
      designation: t2?.designation || t1?.designation || '',
      category: t2?.category || t1?.category || 'permanent',
      t1,
      t2
    };
  }).filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.sn.toString().includes(searchQuery)
  );

  // Totals for both years
  const totalsYear1 = calculateGrandTotals(year1Data?.teachers || []);
  const totalsYear2 = calculateGrandTotals(year2Data?.teachers || []);

  const netDiff = totalsYear2.periodNet - totalsYear1.periodNet;
  const grossDiff = totalsYear2.periodGross - totalsYear1.periodGross;
  const monthlyGrossDiff = totalsYear2.monthlyGross - totalsYear1.monthlyGross;

  // Handle direct inline update for a teacher in year 1 or year 2
  const handleInlineUpdate = (
    targetYear: string,
    teacherId: string,
    field: keyof TeacherRecord,
    value: number | string
  ) => {
    const updatedYears = fiscalYears.map(yr => {
      if (yr.fiscalYear !== targetYear) return yr;

      const updatedTeachers = yr.teachers.map(t => {
        if (t.id !== teacherId) return t;
        const updatedTeacher = { ...t, [field]: value };
        return calculateTeacherPayroll(updatedTeacher, yr.monthsCount, true, {
          includeDashain: yr.includeDashain ?? true,
          includePoshak: yr.includePoshak ?? true
        });
      });

      return {
        ...yr,
        teachers: updatedTeachers
      };
    });

    onUpdateFiscalYears(updatedYears);
  };

  // Copy teachers from Year 1 to Year 2 with optional +1 grade increment
  const handleCopyYear1ToYear2 = (incrementGrade: boolean) => {
    if (!year1Data || !year2Data) return;
    if (confirm(`के तपाईं आ.व. ${year1Name} का सबै शिक्षकहरूको विवरण आ.व. ${year2Name} मा प्रतिलिपि गर्न चाहनुहुन्छ? ${incrementGrade ? '(प्रत्येक शिक्षकको १ ग्रेड स्वतः वृद्धि गरिनेछ)' : ''}`)) {
      const copiedTeachers = year1Data.teachers.map((t, idx) => {
        const nextGradeCount = incrementGrade ? t.gradeCount + 1 : t.gradeCount;
        const gradeRate = t.gradeRate || Math.round(t.basicSalary / 30);
        const gradeAmount = nextGradeCount * gradeRate;

        const updated: TeacherRecord = {
          ...t,
          id: `t-${year2Name.replace(/[^0-9]/g, '')}-${idx + 1}`,
          gradeCount: nextGradeCount,
          gradeRate,
          gradeAmount
        };

        return calculateTeacherPayroll(updated, year2Data.monthsCount, true, {
          includeDashain: year2Data.includeDashain ?? true,
          includePoshak: year2Data.includePoshak ?? true
        });
      });

      const updatedYears = fiscalYears.map(yr => {
        if (yr.fiscalYear === year2Name) {
          return {
            ...yr,
            teachers: copiedTeachers
          };
        }
        return yr;
      });

      onUpdateFiscalYears(updatedYears);
      setStatusMessage(`आ.व. ${year1Name} बाट ${year2Name} मा शिक्षक डाटा सफलतापूर्वक प्रतिलिपि गरियो!`);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Export 2-Year Comparison as CSV
  const handleExportComparisonCsv = () => {
    const headers = [
      'सि.नं.',
      'शिक्षकको नाम',
      'पद',
      `तलब (${year1Name})`,
      `ग्रेड (${year1Name})`,
      `मासिक जम्मा (${year1Name})`,
      `त्रैमासिक जम्मा (${year1Name})`,
      `खुद पाउने (${year1Name})`,
      `तलब (${year2Name})`,
      `ग्रेड (${year2Name})`,
      `मासिक जम्मा (${year2Name})`,
      `त्रैमासिक जम्मा (${year2Name})`,
      `खुद पाउने (${year2Name})`,
      'खुद फरक (वृद्धि)'
    ];

    const rows = combinedTeachers.map(item => {
      const t1 = item.t1;
      const t2 = item.t2;
      const diff = (t2?.periodNet || 0) - (t1?.periodNet || 0);

      return [
        item.sn,
        `"${item.name}"`,
        `"${item.designation}"`,
        t1?.basicSalary || 0,
        t1?.gradeAmount || 0,
        t1?.monthlyGross || 0,
        t1?.periodGross || 0,
        t1?.periodNet || 0,
        t2?.basicSalary || 0,
        t2?.gradeAmount || 0,
        t2?.monthlyGross || 0,
        t2?.periodGross || 0,
        t2?.periodNet || 0,
        diff
      ].join(',');
    });

    // Add totals row
    rows.push([
      'कुल जम्मा',
      '""',
      '""',
      totalsYear1.basicSalary,
      totalsYear1.gradeAmount,
      totalsYear1.monthlyGross,
      totalsYear1.periodGross,
      totalsYear1.periodNet,
      totalsYear2.basicSalary,
      totalsYear2.gradeAmount,
      totalsYear2.monthlyGross,
      totalsYear2.periodGross,
      totalsYear2.periodNet,
      netDiff
    ].join(','));

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `२_वर्ष_तुलना_तलबी_भर्पाई_${year1Name.replace('/', '-')}_र_${year2Name.replace('/', '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-[1750px] mx-auto px-4 sm:px-6 pb-14">
      {/* Top Banner & Year Selectors */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-300 shadow-sm mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-700 text-white font-bold text-xs px-2.5 py-0.5 rounded">
                २ आर्थिक वर्ष तुलना तथा प्रविष्टि
              </span>
              <span className="text-xs text-stone-600 font-medium">
                दुई फरक वर्षमा शिक्षकको तलब, ग्रेड, भत्ता तथा कट्टी रकम प्रविष्टि र दुवैको कुल हिसाब
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 mt-1">
              आर्थिक वर्ष {year1Name} र {year2Name} को तलबी भर्पाई तुलना तथा प्रविष्टि
            </h2>
          </div>

          {/* Year Selectors & Inline Edit Switch */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Year 1 Selector */}
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-lg">
              <span className="text-xs font-bold text-blue-900">वर्ष १:</span>
              <select
                value={year1Name}
                onChange={(e) => setYear1Name(e.target.value)}
                className="bg-white text-xs font-bold text-blue-950 border border-blue-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
              >
                {availableYearNames.map(yr => (
                  <option key={`y1-${yr}`} value={yr}>आ.व. {yr}</option>
                ))}
              </select>
            </div>

            <ArrowRightLeft className="w-4 h-4 text-stone-400 hidden sm:inline" />

            {/* Year 2 Selector */}
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
              <span className="text-xs font-bold text-emerald-900">वर्ष २:</span>
              <select
                value={year2Name}
                onChange={(e) => setYear2Name(e.target.value)}
                className="bg-white text-xs font-bold text-emerald-950 border border-emerald-300 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500"
              >
                {availableYearNames.map(yr => (
                  <option key={`y2-${yr}`} value={yr}>आ.व. {yr}</option>
                ))}
              </select>
            </div>

            {/* Inline Edit Toggle */}
            <button
              onClick={() => setInlineEditMode(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                inlineEditMode 
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs' 
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{inlineEditMode ? 'सिधै प्रविष्टि सक्रिय ✓' : 'तालिकामा रकम सम्पादन गर्नुहोस्'}</span>
            </button>
          </div>
        </div>

        {/* Quick Operations Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Copy Year 1 -> Year 2 with +1 Grade */}
            <button
              onClick={() => handleCopyYear1ToYear2(true)}
              title="वर्ष १ बाट सबै शिक्षक वर्ष २ मा सारी १ ग्रेड थप गर्नुहोस्"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>वर्ष १ बाट वर्ष २ मा +१ ग्रेड वृद्धि सहित प्रतिलिपि</span>
            </button>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="शिक्षकको नाम खोज्नुहोस्..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs bg-stone-50 border border-stone-300 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 w-48 sm:w-56"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportComparisonCsv}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel (CSV) डाउनलोड</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>तुलना प्रतिवेदन प्रिन्ट</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* 2-Year Grand Total Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        {/* Year 1 Total Card */}
        <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-blue-900 font-bold mb-1">
            <span>आ.व. {year1Name} कुल त्रैमासिक</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px]">वर्ष १</span>
          </div>
          <div className="text-xl font-extrabold text-blue-950 font-mono">
            {format(totalsYear1.periodGross)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 flex justify-between">
            <span>खुद भुक्तानी: <b>{format(totalsYear1.periodNet)}</b></span>
            <span>मासिक: <b>{format(totalsYear1.monthlyGross)}</b></span>
          </div>
        </div>

        {/* Year 2 Total Card */}
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-emerald-900 font-bold mb-1">
            <span>आ.व. {year2Name} कुल त्रैमासिक</span>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px]">वर्ष २</span>
          </div>
          <div className="text-xl font-extrabold text-emerald-950 font-mono">
            {format(totalsYear2.periodGross)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 flex justify-between">
            <span>खुद भुक्तानी: <b>{format(totalsYear2.periodNet)}</b></span>
            <span>मासिक: <b>{format(totalsYear2.monthlyGross)}</b></span>
          </div>
        </div>

        {/* Difference / Net Growth */}
        <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-purple-900 font-bold mb-1">
            <span>त्रैमासिक निकासा अन्तर (वृद्धि)</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className={`text-xl font-extrabold font-mono ${grossDiff >= 0 ? 'text-purple-900' : 'text-rose-700'}`}>
            {grossDiff >= 0 ? '+' : ''}{format(grossDiff)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            मासिक कुल तलब वृद्धि: <b>{monthlyGrossDiff >= 0 ? '+' : ''}{format(monthlyGrossDiff)}</b>
          </div>
        </div>

        {/* Net Handout Growth */}
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-amber-900 font-bold mb-1">
            <span>खुद भुक्तानी अन्तर (Net Diff)</span>
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px]">कुल दायित्व</span>
          </div>
          <div className={`text-xl font-extrabold font-mono ${netDiff >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
            {netDiff >= 0 ? '+' : ''}{format(netDiff)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            शिक्षक संख्या: <b>{num(combinedTeachers.length)} जना</b>
          </div>
        </div>
      </div>

      {/* Side-by-Side 2-Year Master Comparison Table */}
      <div className="bg-white border border-stone-300 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[75vh]">
          <table className="w-full text-[11px] text-stone-800 border-collapse border border-stone-300 select-text">
            {/* Table Header */}
            <thead className="bg-stone-100 text-stone-900 sticky top-0 z-20 shadow-xs select-none">
              {/* Row 1: Major Groupings */}
              <tr className="border-b border-stone-300">
                <th rowSpan={2} className="border border-stone-300 px-2 py-2 text-center font-bold sticky left-0 bg-stone-100 z-30 min-w-[36px]">
                  क्र.सं.
                </th>
                <th rowSpan={2} className="border border-stone-300 px-3 py-2 text-left font-bold sticky left-[36px] bg-stone-100 z-30 min-w-[130px] whitespace-nowrap">
                  शिक्षकको नाम
                </th>
                <th rowSpan={2} className="border border-stone-300 px-2 py-2 text-left font-bold min-w-[90px] whitespace-nowrap">
                  पद / श्रेणी
                </th>

                {/* Year 1 Columns Group */}
                <th colSpan={6} className="border border-stone-300 px-2 py-1.5 text-center font-extrabold bg-blue-100/80 text-blue-950">
                  आर्थिक वर्ष {year1Name} (वर्ष १)
                </th>

                {/* Year 2 Columns Group */}
                <th colSpan={6} className="border border-stone-300 px-2 py-1.5 text-center font-extrabold bg-emerald-100/80 text-emerald-950">
                  आर्थिक वर्ष {year2Name} (वर्ष २)
                </th>

                {/* Difference / Increment Group */}
                <th colSpan={2} className="border border-stone-300 px-2 py-1.5 text-center font-extrabold bg-purple-100/80 text-purple-950">
                  फरक / वृद्धि रकम
                </th>
              </tr>

              {/* Row 2: Sub-Columns */}
              <tr className="border-b border-stone-300 text-[10px]">
                {/* Year 1 Sub */}
                <th className="border border-stone-300 px-2 py-1 text-right font-bold bg-blue-50/70 min-w-[70px]">तलब स्केल</th>
                <th className="border border-stone-300 px-1 py-1 text-center font-bold bg-blue-50/70 min-w-[40px]">ग्रेड</th>
                <th className="border border-stone-300 px-2 py-1 text-right font-bold bg-blue-50/70 min-w-[75px]">मासिक जम्मा</th>
                <th className="border border-stone-300 px-2 py-1 text-right font-bold bg-blue-50/70 min-w-[65px]">दसैं/पोशाक</th>
                <th className="border border-stone-300 px-2.5 py-1 text-right font-bold bg-blue-100/90 text-blue-950 min-w-[85px]">त्रैमासिक जम्मा</th>
                <th className="border border-stone-300 px-2.5 py-1 text-right font-bold bg-blue-50/90 text-blue-950 min-w-[85px]">खुद रकम</th>

                {/* Year 2 Sub */}
                <th className="border border-stone-300 px-2 py-1 text-right font-bold bg-emerald-50/70 min-w-[70px]">तलब स्केल</th>
                <th className="border border-stone-300 px-1 py-1 text-center font-bold bg-emerald-50/70 min-w-[40px]">ग्रेड</th>
                <th className="border border-stone-300 px-2 py-1 text-right font-bold bg-emerald-50/70 min-w-[75px]">मासिक जम्मा</th>
                <th className="border border-stone-300 px-2 py-1 text-right font-bold bg-emerald-50/70 min-w-[65px]">दसैं/पोशाक</th>
                <th className="border border-stone-300 px-2.5 py-1 text-right font-bold bg-emerald-100/90 text-emerald-950 min-w-[85px]">त्रैमासिक जम्मा</th>
                <th className="border border-stone-300 px-2.5 py-1 text-right font-bold bg-emerald-50/90 text-emerald-950 min-w-[85px]">खुद रकम</th>

                {/* Difference Sub */}
                <th className="border border-stone-300 px-2 py-1 text-right font-bold bg-purple-50/70 min-w-[75px]">मासिक वृद्धि</th>
                <th className="border border-stone-300 px-2 py-1 text-right font-bold bg-purple-100/80 text-purple-950 min-w-[85px]">त्रैमासिक खुद वृद्धि</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {combinedTeachers.map((item, idx) => {
                const t1 = item.t1;
                const t2 = item.t2;
                const monthlyDiff = (t2?.monthlyGross || 0) - (t1?.monthlyGross || 0);
                const periodNetDiff = (t2?.periodNet || 0) - (t1?.periodNet || 0);
                const isEven = idx % 2 === 0;

                return (
                  <tr 
                    key={`comp-${item.name}-${idx}`}
                    className={`border-b border-stone-200 hover:bg-amber-50/40 transition-colors ${
                      isEven ? 'bg-white' : 'bg-stone-50/40'
                    }`}
                  >
                    {/* SN */}
                    <td className="border border-stone-300 px-2 py-1.5 text-center font-medium text-stone-600 sticky left-0 bg-inherit z-10">
                      {num(item.sn)}
                    </td>

                    {/* Name */}
                    <td className="border border-stone-300 px-3 py-1.5 font-bold text-stone-900 sticky left-[36px] bg-inherit z-10 whitespace-nowrap">
                      {item.name}
                    </td>

                    {/* Designation */}
                    <td className="border border-stone-300 px-2 py-1.5 text-stone-700 whitespace-nowrap">
                      {item.designation}
                    </td>

                    {/* Year 1: Basic Salary */}
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-mono bg-blue-50/20">
                      {inlineEditMode && t1 ? (
                        <input
                          type="number"
                          value={t1.basicSalary}
                          onChange={(e) => handleInlineUpdate(year1Name, t1.id, 'basicSalary', parseFloat(e.target.value) || 0)}
                          className="w-20 px-1 py-0.5 text-right text-xs bg-white border border-blue-300 rounded font-mono"
                        />
                      ) : (
                        t1 ? format(t1.basicSalary) : '-'
                      )}
                    </td>

                    {/* Year 1: Grade */}
                    <td className="border border-stone-300 px-1 py-1.5 text-center font-mono bg-blue-50/20">
                      {inlineEditMode && t1 ? (
                        <input
                          type="number"
                          value={t1.gradeCount}
                          onChange={(e) => handleInlineUpdate(year1Name, t1.id, 'gradeCount', parseInt(e.target.value) || 0)}
                          className="w-10 px-1 py-0.5 text-center text-xs bg-white border border-blue-300 rounded font-mono"
                        />
                      ) : (
                        t1 ? (t1.gradeCount > 0 ? num(t1.gradeCount) : '-') : '-'
                      )}
                    </td>

                    {/* Year 1: Monthly Gross */}
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-semibold font-mono bg-blue-50/30">
                      {t1 ? format(t1.monthlyGross) : '-'}
                    </td>

                    {/* Year 1: Dashain / Poshak */}
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-mono bg-blue-50/20">
                      {t1 ? format((t1.dashainBhatta || 0) + (t1.poshakBhatta || 0)) : '-'}
                    </td>

                    {/* Year 1: Period Gross */}
                    <td className="border border-stone-300 px-2.5 py-1.5 text-right font-bold text-blue-950 font-mono bg-blue-100/40">
                      {t1 ? format(t1.periodGross) : '-'}
                    </td>

                    {/* Year 1: Period Net */}
                    <td className="border border-stone-300 px-2.5 py-1.5 text-right font-bold text-blue-900 font-mono bg-blue-50/50">
                      {t1 ? format(t1.periodNet) : '-'}
                    </td>

                    {/* Year 2: Basic Salary */}
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-mono bg-emerald-50/20">
                      {inlineEditMode && t2 ? (
                        <input
                          type="number"
                          value={t2.basicSalary}
                          onChange={(e) => handleInlineUpdate(year2Name, t2.id, 'basicSalary', parseFloat(e.target.value) || 0)}
                          className="w-20 px-1 py-0.5 text-right text-xs bg-white border border-emerald-300 rounded font-mono"
                        />
                      ) : (
                        t2 ? format(t2.basicSalary) : '-'
                      )}
                    </td>

                    {/* Year 2: Grade */}
                    <td className="border border-stone-300 px-1 py-1.5 text-center font-mono bg-emerald-50/20">
                      {inlineEditMode && t2 ? (
                        <input
                          type="number"
                          value={t2.gradeCount}
                          onChange={(e) => handleInlineUpdate(year2Name, t2.id, 'gradeCount', parseInt(e.target.value) || 0)}
                          className="w-10 px-1 py-0.5 text-center text-xs bg-white border border-emerald-300 rounded font-mono"
                        />
                      ) : (
                        t2 ? (t2.gradeCount > 0 ? num(t2.gradeCount) : '-') : '-'
                      )}
                    </td>

                    {/* Year 2: Monthly Gross */}
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-semibold font-mono bg-emerald-50/30">
                      {t2 ? format(t2.monthlyGross) : '-'}
                    </td>

                    {/* Year 2: Dashain / Poshak */}
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-mono bg-emerald-50/20">
                      {t2 ? format((t2.dashainBhatta || 0) + (t2.poshakBhatta || 0)) : '-'}
                    </td>

                    {/* Year 2: Period Gross */}
                    <td className="border border-stone-300 px-2.5 py-1.5 text-right font-bold text-emerald-950 font-mono bg-emerald-100/40">
                      {t2 ? format(t2.periodGross) : '-'}
                    </td>

                    {/* Year 2: Period Net */}
                    <td className="border border-stone-300 px-2.5 py-1.5 text-right font-bold text-emerald-900 font-mono bg-emerald-50/50">
                      {t2 ? format(t2.periodNet) : '-'}
                    </td>

                    {/* Monthly Diff */}
                    <td className={`border border-stone-300 px-2 py-1.5 text-right font-mono font-medium ${
                      monthlyDiff > 0 ? 'text-emerald-700 bg-emerald-50/30' : monthlyDiff < 0 ? 'text-rose-700 bg-rose-50/30' : 'text-stone-500'
                    }`}>
                      {monthlyDiff !== 0 ? `${monthlyDiff > 0 ? '+' : ''}${format(monthlyDiff)}` : '-'}
                    </td>

                    {/* Period Net Diff */}
                    <td className={`border border-stone-300 px-2.5 py-1.5 text-right font-mono font-bold ${
                      periodNetDiff > 0 ? 'text-purple-800 bg-purple-50/50' : periodNetDiff < 0 ? 'text-rose-700 bg-rose-50/50' : 'text-stone-500'
                    }`}>
                      {periodNetDiff !== 0 ? `${periodNetDiff > 0 ? '+' : ''}${format(periodNetDiff)}` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer: Grand Totals for Both Years */}
            <tfoot className="bg-stone-100 font-bold text-stone-900 border-t-2 border-stone-400 sticky bottom-0 z-20 shadow-xs">
              <tr>
                <td colSpan={3} className="border border-stone-300 px-3 py-2 text-left font-extrabold sticky left-0 bg-stone-100 z-30">
                  कुल जम्मा (GRAND TOTAL)
                </td>

                {/* Year 1 Totals */}
                <td className="border border-stone-300 px-2 py-2 text-right font-mono bg-blue-100/60">
                  {format(totalsYear1.basicSalary)}
                </td>
                <td className="border border-stone-300 px-1 py-2 text-center font-mono bg-blue-100/60">
                  {num(totalsYear1.gradeCount)}
                </td>
                <td className="border border-stone-300 px-2 py-2 text-right font-mono bg-blue-100/70 font-extrabold">
                  {format(totalsYear1.monthlyGross)}
                </td>
                <td className="border border-stone-300 px-2 py-2 text-right font-mono bg-blue-100/60">
                  {format((totalsYear1.dashainBhatta || 0) + (totalsYear1.poshakBhatta || 0))}
                </td>
                <td className="border border-stone-300 px-2.5 py-2 text-right font-mono bg-blue-200/90 text-blue-950 font-black">
                  {format(totalsYear1.periodGross)}
                </td>
                <td className="border border-stone-300 px-2.5 py-2 text-right font-mono bg-blue-100/80 text-blue-950 font-black">
                  {format(totalsYear1.periodNet)}
                </td>

                {/* Year 2 Totals */}
                <td className="border border-stone-300 px-2 py-2 text-right font-mono bg-emerald-100/60">
                  {format(totalsYear2.basicSalary)}
                </td>
                <td className="border border-stone-300 px-1 py-2 text-center font-mono bg-emerald-100/60">
                  {num(totalsYear2.gradeCount)}
                </td>
                <td className="border border-stone-300 px-2 py-2 text-right font-mono bg-emerald-100/70 font-extrabold">
                  {format(totalsYear2.monthlyGross)}
                </td>
                <td className="border border-stone-300 px-2 py-2 text-right font-mono bg-emerald-100/60">
                  {format((totalsYear2.dashainBhatta || 0) + (totalsYear2.poshakBhatta || 0))}
                </td>
                <td className="border border-stone-300 px-2.5 py-2 text-right font-mono bg-emerald-200/90 text-emerald-950 font-black">
                  {format(totalsYear2.periodGross)}
                </td>
                <td className="border border-stone-300 px-2.5 py-2 text-right font-mono bg-emerald-100/80 text-emerald-950 font-black">
                  {format(totalsYear2.periodNet)}
                </td>

                {/* Difference Totals */}
                <td className="border border-stone-300 px-2 py-2 text-right font-mono font-extrabold text-purple-900 bg-purple-100/70">
                  {monthlyGrossDiff >= 0 ? '+' : ''}{format(monthlyGrossDiff)}
                </td>
                <td className="border border-stone-300 px-2.5 py-2 text-right font-mono font-black text-purple-950 bg-purple-200/90">
                  {netDiff >= 0 ? '+' : ''}{format(netDiff)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
