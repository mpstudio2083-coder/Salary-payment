import React, { useState } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Shirt, 
  Printer, 
  Download, 
  CheckCircle, 
  SlidersHorizontal,
  FileSpreadsheet,
  Layers,
  Coins,
  Receipt,
  Users,
  Check,
  LayoutDashboard,
  PanelLeft,
  PanelTop
} from 'lucide-react';
import { 
  TeacherRecord, 
  SchoolInfo, 
  NepaliMonth, 
  NEPALI_MONTHS, 
  SpecialAllowanceSettings 
} from '../types';
import { 
  calculateAllTeachersForMonth, 
  calculateMonthlyTotals, 
  generateAnnualMonthsSummary,
  DEFAULT_ALLOWANCE_SETTINGS 
} from '../utils/monthlyCalculations';
import { formatNepaliCurrency, toNepaliNumber, numberToNepaliWords } from '../utils/nepaliNumber';

interface MonthlyDashboardProps {
  teachers: TeacherRecord[];
  schoolInfo: SchoolInfo;
  fiscalYear: string;
  useNepaliDigits: boolean;
  onPrintMonthly: (month: NepaliMonth) => void;
}

export const MonthlyDashboard: React.FC<MonthlyDashboardProps> = ({
  teachers,
  schoolInfo,
  fiscalYear,
  useNepaliDigits,
  onPrintMonthly
}) => {
  const [selectedMonth, setSelectedMonth] = useState<NepaliMonth>('साउन');
  const [viewMode, setViewMode] = useState<'monthly' | 'annual'>('monthly');
  const [dashboardLayout, setDashboardLayout] = useState<'sidebar' | 'top'>('sidebar');
  const [allowanceSettings, setAllowanceSettings] = useState<SpecialAllowanceSettings>(DEFAULT_ALLOWANCE_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);

  const format = (val: number | undefined | null) =>
    formatNepaliCurrency(val, { nepaliDigits: useNepaliDigits });

  const num = (val: number | string | undefined | null) =>
    useNepaliDigits ? toNepaliNumber(val) : (val !== undefined && val !== null ? val.toString() : '0');

  // Filter active teachers (respecting hide/show flag)
  const activeTeachers = teachers.filter((t) => !t.isHidden);

  // Compute records for selected month
  const monthlyRecords = calculateAllTeachersForMonth(activeTeachers, selectedMonth, allowanceSettings);
  const totals = calculateMonthlyTotals(monthlyRecords);

  // Compute 12-month summary matrix
  const annualSummary = generateAnnualMonthsSummary(activeTeachers, allowanceSettings);
  const annualGrandTotal = annualSummary.reduce(
    (acc, m) => {
      acc.regularGross += m.regularGross;
      acc.dashainTotal += m.dashainTotal;
      acc.poshakTotal += m.poshakTotal;
      acc.totalGross += m.totalGross;
      acc.totalDeductions += m.totalDeductions;
      acc.totalTax += m.totalTax;
      acc.totalNet += m.totalNet;
      return acc;
    },
    {
      regularGross: 0,
      dashainTotal: 0,
      poshakTotal: 0,
      totalGross: 0,
      totalDeductions: 0,
      totalTax: 0,
      totalNet: 0
    }
  );

  const netInWords = numberToNepaliWords(totals.netPayable);

  // Export Monthly CSV
  const handleExportMonthlyCsv = () => {
    const headers = [
      'क्र. सं.',
      'शिक्षकको नाम',
      'पद / श्रेणी',
      'तलब स्केल',
      'ग्रेड रकम',
      'क. कोष थप (१०%)',
      'बिमा थप',
      'भत्ताहरू',
      'नियमित तलब',
      'दसैं भत्ता',
      'पोशाक भत्ता',
      'यस महिनाको कुल तलब',
      'क. कोष कट्टी',
      'बिमा कट्टी',
      'सा. क. कोष कट्टी',
      'जम्मा कट्टी',
      '१% सामाजिक सुरक्षा कर',
      'खुद भुक्तानी'
    ];

    const rows = monthlyRecords.map((m) => [
      m.sn,
      `"${m.name}"`,
      `"${m.designation}"`,
      m.basicSalary,
      m.gradeAmount,
      m.koshThap,
      m.bimaThap,
      m.praABhatta + m.mahangiBhatta + (m.protsahanBhatta || 0) + m.anyaBhatta,
      m.regularMonthlyGross,
      m.dashainBhatta,
      m.poshakBhatta,
      m.totalMonthlyGross,
      m.koshKatti,
      m.bimaKatti,
      m.citKatti,
      m.totalMonthlyKatti,
      m.tax1Percent,
      m.netPayable
    ]);

    const totalRow = [
      'अन्तिम जम्मा',
      '',
      '',
      totals.basicSalary,
      totals.gradeAmount,
      totals.koshThap,
      totals.bimaThap,
      totals.praABhatta + totals.mahangiBhatta + (totals.protsahanBhatta || 0) + totals.anyaBhatta,
      totals.regularMonthlyGross,
      totals.dashainBhatta,
      totals.poshakBhatta,
      totals.totalMonthlyGross,
      totals.koshKatti,
      totals.bimaKatti,
      totals.citKatti,
      totals.totalMonthlyKatti,
      totals.tax1Percent,
      totals.netPayable
    ];

    let csvContent = '\uFEFF';
    csvContent += `"${schoolInfo.schoolName}, ${schoolInfo.address}"\n`;
    csvContent += `"${selectedMonth} महिनाको तलबी प्रतिवेदन (आ.व. ${fiscalYear})"\n\n`;
    csvContent += headers.join(',') + '\n';
    rows.forEach((r) => {
      csvContent += r.join(',') + '\n';
    });
    csvContent += totalRow.join(',') + '\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Monthly_Payroll_${selectedMonth}_${fiscalYear.replace('/', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTablesContent = () => (
    <>
      {/* Words Banner */}
      <div className="bg-stone-50 border border-stone-200 rounded px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
        <div>
          <span className="font-bold text-stone-800">{selectedMonth} महिनाको खुद भुक्तानी अक्षरूपी: </span>
          <span className="text-stone-700 font-medium italic">{netInWords}</span>
        </div>
        <div className="text-stone-500 text-[11px]">
          (१% सामाजिक सुरक्षा कर: रू {format(totals.tax1Percent)})
        </div>
      </div>

      {/* View 1: Detailed Single Month Table */}
      {viewMode === 'monthly' ? (
        <div className="bg-white border border-stone-300 shadow-sm rounded-xl overflow-hidden">
          <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-xs text-stone-900">
                {schoolInfo.schoolName} — {selectedMonth} महिनाको तलबी भर्पाई प्रतिवेदन
              </span>
              {selectedMonth === allowanceSettings.dashainMonth && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold text-[11px] rounded">
                  🎁 दसैं भत्ता समावेश
                </span>
              )}
              {selectedMonth === allowanceSettings.poshakMonth && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded">
                  👔 पोशाक भत्ता (रू १०,०००) समावेश
                </span>
              )}
            </div>
            <span className="text-xs text-stone-500">
              कुल {num(monthlyRecords.length)} जना कर्मचारी
            </span>
          </div>

          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-[11px] text-stone-800 border-collapse border border-stone-400">
              <thead className="bg-stone-100 text-stone-900 sticky top-0 z-20 shadow-2xs select-none">
                <tr className="border-b border-stone-400">
                  <th className="border border-stone-300 px-2 py-2 text-center font-bold sticky left-0 bg-stone-100 z-30 min-w-[38px]">
                    क्र. सं.
                  </th>
                  <th className="border border-stone-300 px-3 py-2 text-left font-bold sticky left-[38px] bg-stone-100 z-30 min-w-[130px] whitespace-nowrap">
                    शिक्षकको नाम
                  </th>
                  <th className="border border-stone-300 px-2.5 py-2 text-left font-bold min-w-[95px] whitespace-nowrap">
                    पद / श्रेणी
                  </th>
                  <th className="border border-stone-300 px-2 py-2 text-right font-bold min-w-[70px]">
                    तलब स्केल
                  </th>
                  <th className="border border-stone-300 px-2 py-2 text-right font-bold min-w-[65px] bg-blue-50/50">
                    ग्रेड रकम
                  </th>
                  <th className="border border-stone-300 px-2 py-2 text-right font-bold min-w-[65px] bg-emerald-50/40">
                    क. कोष थप
                  </th>
                  <th className="border border-stone-300 px-1.5 py-2 text-right font-bold min-w-[50px] bg-emerald-50/40">
                    बिमा थप
                  </th>
                  <th className="border border-stone-300 px-2 py-2 text-right font-bold min-w-[65px] bg-amber-50/50">
                    भत्ताहरू
                  </th>
                  <th className="border border-stone-300 px-2.5 py-2 text-right font-bold bg-indigo-50/70 min-w-[85px]">
                    नियमित तलब
                  </th>

                  {/* Special Allowance Columns */}
                  <th className={`border border-stone-300 px-2.5 py-2 text-right font-bold min-w-[85px] ${
                    selectedMonth === allowanceSettings.dashainMonth ? 'bg-purple-100 text-purple-950' : 'bg-stone-50 text-stone-400'
                  }`}>
                    दसैं भत्ता (साउन)
                  </th>
                  <th className={`border border-stone-300 px-2.5 py-2 text-right font-bold min-w-[85px] ${
                    selectedMonth === allowanceSettings.poshakMonth ? 'bg-emerald-100 text-emerald-950' : 'bg-stone-50 text-stone-400'
                  }`}>
                    पोशाक भत्ता (चैत)
                  </th>

                  <th className="border border-stone-300 px-2.5 py-2 text-right font-extrabold bg-indigo-100 text-indigo-950 min-w-[95px]">
                    कुल महिना निकासा
                  </th>

                  {/* Deductions */}
                  <th className="border border-stone-300 px-2 py-2 text-right font-bold min-w-[60px] bg-rose-50/60 text-rose-950">
                    क. कोष कट्टी
                  </th>
                  <th className="border border-stone-300 px-1.5 py-2 text-right font-bold min-w-[50px] bg-rose-50/60 text-rose-950">
                    बिमा कट्टी
                  </th>
                  <th className="border border-stone-300 px-1.5 py-2 text-right font-bold min-w-[50px] bg-rose-50/60 text-rose-950">
                    सा.क. कोष
                  </th>
                  <th className="border border-stone-300 px-2.5 py-2 text-right font-bold bg-rose-100 text-rose-950 min-w-[75px]">
                    जम्मा कट्टी
                  </th>

                  {/* 1% Tax */}
                  <th className="border border-stone-300 px-2 py-2 text-right font-bold min-w-[60px] bg-amber-50/70 text-amber-950">
                    १% कर
                  </th>

                  {/* Net Payable */}
                  <th className="border border-stone-300 px-3 py-2 text-right font-extrabold bg-emerald-200 text-emerald-950 min-w-[105px]">
                    खुद भुक्तानी रकम
                  </th>

                  <th className="border border-stone-300 px-2 py-2 text-center font-bold min-w-[70px]">
                    हस्ताक्षर
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-200">
                {monthlyRecords.map((m, index) => {
                  return (
                    <tr 
                      key={m.teacherId} 
                      className={`hover:bg-blue-50/30 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'
                      }`}
                    >
                      <td className="border border-stone-300 px-2 py-1.5 text-center font-medium sticky left-0 bg-inherit z-10">
                        {num(index + 1)}
                      </td>
                      <td className="border border-stone-300 px-3 py-1.5 text-left font-bold text-stone-900 sticky left-[38px] bg-inherit z-10 whitespace-nowrap">
                        {m.name}
                      </td>
                      <td className="border border-stone-300 px-2.5 py-1.5 text-left text-[10.5px] text-stone-600 whitespace-nowrap">
                        {m.designation}
                      </td>
                      <td className="border border-stone-300 px-2 py-1.5 text-right font-mono">
                        {format(m.basicSalary)}
                      </td>
                      <td className="border border-stone-300 px-2 py-1.5 text-right font-mono bg-blue-50/30 font-medium">
                        {m.gradeAmount > 0 ? format(m.gradeAmount) : '-'}
                      </td>
                      <td className="border border-stone-300 px-2 py-1.5 text-right font-mono bg-emerald-50/20">
                        {m.category === 'permanent' && m.koshThap > 0 ? format(m.koshThap) : '-'}
                      </td>
                      <td className="border border-stone-300 px-1.5 py-1.5 text-right font-mono bg-emerald-50/20">
                        {m.category === 'permanent' && m.bimaThap > 0 ? format(m.bimaThap) : '-'}
                      </td>
                      <td className="border border-stone-300 px-2 py-1.5 text-right font-mono bg-amber-50/20">
                        {m.praABhatta + m.mahangiBhatta + (m.protsahanBhatta || 0) + m.anyaBhatta > 0 
                          ? format(m.praABhatta + m.mahangiBhatta + (m.protsahanBhatta || 0) + m.anyaBhatta) 
                          : '-'}
                      </td>
                      <td className="border border-stone-300 px-2.5 py-1.5 text-right font-bold text-stone-900 bg-indigo-50/40 font-mono">
                        {format(m.regularMonthlyGross)}
                      </td>

                      {/* Dashain */}
                      <td className={`border border-stone-300 px-2.5 py-1.5 text-right font-mono ${
                        m.dashainBhatta > 0 ? 'font-bold text-purple-900 bg-purple-50' : 'text-stone-300'
                      }`}>
                        {m.dashainBhatta > 0 ? format(m.dashainBhatta) : '-'}
                      </td>

                      {/* Poshak */}
                      <td className={`border border-stone-300 px-2.5 py-1.5 text-right font-mono ${
                        m.poshakBhatta > 0 ? 'font-bold text-emerald-900 bg-emerald-50' : 'text-stone-300'
                      }`}>
                        {m.poshakBhatta > 0 ? format(m.poshakBhatta) : '-'}
                      </td>

                      {/* Month Total Gross */}
                      <td className="border border-stone-300 px-2.5 py-1.5 text-right font-extrabold text-indigo-950 bg-indigo-50/70 font-mono">
                        {format(m.totalMonthlyGross)}
                      </td>

                      {/* Deductions */}
                      <td className="border border-stone-300 px-2 py-1.5 text-right font-mono bg-rose-50/20 text-rose-900">
                        {m.category === 'permanent' && m.koshKatti > 0 ? format(m.koshKatti) : '-'}
                      </td>
                      <td className="border border-stone-300 px-1.5 py-1.5 text-right font-mono bg-rose-50/20 text-rose-900">
                        {m.category === 'permanent' && m.bimaKatti > 0 ? format(m.bimaKatti) : '-'}
                      </td>
                      <td className="border border-stone-300 px-1.5 py-1.5 text-right font-mono bg-rose-50/20 text-rose-900">
                        {m.citKatti > 0 ? format(m.citKatti) : '-'}
                      </td>
                      <td className="border border-stone-300 px-2 py-1.5 text-right font-bold font-mono bg-rose-100/40 text-rose-950">
                        {format(m.totalMonthlyKatti)}
                      </td>

                      {/* 1% Tax */}
                      <td className="border border-stone-300 px-2 py-1.5 text-right font-mono text-amber-900 bg-amber-50/30">
                        {format(m.tax1Percent)}
                      </td>

                      {/* Net Payable */}
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-extrabold text-emerald-950 bg-emerald-100/70 font-mono">
                        {format(m.netPayable)}
                      </td>

                      <td className="border border-stone-300 px-2 py-1.5 text-center text-[10px] text-stone-300">
                        ...............
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot className="bg-amber-100/95 font-extrabold text-stone-900 sticky bottom-0 z-20 shadow-md border-t-2 border-stone-500">
                <tr>
                  <td colSpan={3} className="border border-stone-400 px-3 py-2 text-center text-xs tracking-wider sticky left-0 bg-amber-100 z-30">
                    {selectedMonth} महिनाको कुल जम्मा
                  </td>
                  <td className="border border-stone-400 px-2 py-2 text-right font-mono">
                    {format(totals.basicSalary)}
                  </td>
                  <td className="border border-stone-400 px-2 py-2 text-right font-mono">
                    {format(totals.gradeAmount)}
                  </td>
                  <td className="border border-stone-400 px-2 py-2 text-right font-mono">
                    {format(totals.koshThap)}
                  </td>
                  <td className="border border-stone-400 px-1.5 py-2 text-right font-mono">
                    {format(totals.bimaThap)}
                  </td>
                  <td className="border border-stone-400 px-2 py-2 text-right font-mono">
                    {format(totals.praABhatta + totals.mahangiBhatta + (totals.protsahanBhatta || 0) + totals.anyaBhatta)}
                  </td>
                  <td className="border border-stone-400 px-2.5 py-2 text-right font-mono bg-amber-200/70">
                    {format(totals.regularMonthlyGross)}
                  </td>

                  {/* Dashain total */}
                  <td className="border border-stone-400 px-2.5 py-2 text-right font-mono bg-purple-200/80 text-purple-950">
                    {format(totals.dashainBhatta)}
                  </td>

                  {/* Poshak total */}
                  <td className="border border-stone-400 px-2.5 py-2 text-right font-mono bg-emerald-200/80 text-emerald-950">
                    {format(totals.poshakBhatta)}
                  </td>

                  {/* Month Gross Total */}
                  <td className="border border-stone-400 px-2.5 py-2 text-right font-mono bg-indigo-200 text-indigo-950">
                    {format(totals.totalMonthlyGross)}
                  </td>

                  {/* Deductions */}
                  <td className="border border-stone-400 px-2 py-2 text-right font-mono">
                    {format(totals.koshKatti)}
                  </td>
                  <td className="border border-stone-400 px-1.5 py-2 text-right font-mono">
                    {format(totals.bimaKatti)}
                  </td>
                  <td className="border border-stone-400 px-1.5 py-2 text-right font-mono">
                    {format(totals.citKatti)}
                  </td>
                  <td className="border border-stone-400 px-2 py-2 text-right font-mono bg-rose-200 text-rose-950">
                    {format(totals.totalMonthlyKatti)}
                  </td>

                  {/* Tax */}
                  <td className="border border-stone-400 px-2 py-2 text-right font-mono bg-amber-200/80">
                    {format(totals.tax1Percent)}
                  </td>

                  {/* Net */}
                  <td className="border border-stone-400 px-3 py-2 text-right font-mono bg-emerald-300 text-emerald-950">
                    {format(totals.netPayable)}
                  </td>

                  <td className="border border-stone-400 px-2 py-2 text-center text-[10px]">
                    प्रमाणित
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        /* View 2: Annual 12-Month Matrix Comparison Table */
        <div className="bg-white border border-stone-300 shadow-sm rounded-xl overflow-hidden">
          <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-xs text-stone-900">
                आर्थिक वर्ष {fiscalYear} को १२ महिनाको विस्तृत निकासा तथा बजेट तुलना
              </span>
            </div>
            <span className="text-xs text-stone-500">
              वैशाख देखि चैत सम्म (१ वर्ष)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-stone-800 border-collapse border border-stone-300">
              <thead className="bg-stone-100 text-stone-900 border-b border-stone-300">
                <tr>
                  <th className="border border-stone-300 px-3 py-2 text-center font-bold">क्र.सं.</th>
                  <th className="border border-stone-300 px-4 py-2 text-left font-bold">महिना</th>
                  <th className="border border-stone-300 px-3 py-2 text-left font-bold">विशेष भुक्तानी प्रकार</th>
                  <th className="border border-stone-300 px-3 py-2 text-right font-bold">नियमित तलब जम्मा</th>
                  <th className="border border-stone-300 px-3 py-2 text-right font-bold text-purple-900 bg-purple-50">
                    दसैं भत्ता (साउन)
                  </th>
                  <th className="border border-stone-300 px-3 py-2 text-right font-bold text-emerald-900 bg-emerald-50">
                    पोशाक भत्ता (चैत)
                  </th>
                  <th className="border border-stone-300 px-3 py-2 text-right font-bold bg-indigo-50 text-indigo-950">
                    महिनाको कुल निकासा
                  </th>
                  <th className="border border-stone-300 px-3 py-2 text-right font-bold text-rose-900">
                    कुल कट्टी
                  </th>
                  <th className="border border-stone-300 px-3 py-2 text-right font-bold text-amber-900">
                    १% कर
                  </th>
                  <th className="border border-stone-300 px-4 py-2 text-right font-extrabold bg-emerald-100 text-emerald-950">
                    खुद भुक्तानी रकम
                  </th>
                  <th className="border border-stone-300 px-3 py-2 text-center font-bold">कार्य</th>
                </tr>
              </thead>

              <tbody>
                {annualSummary.map((m, index) => {
                  const isDashain = m.isDashainMonth;
                  const isPoshak = m.isPoshakMonth;

                  return (
                    <tr
                      key={m.month}
                      className={`border-b border-stone-200 hover:bg-stone-50 transition-colors ${
                        isDashain ? 'bg-purple-50/40' : isPoshak ? 'bg-emerald-50/40' : 'bg-white'
                      }`}
                    >
                      <td className="border border-stone-300 px-3 py-2 text-center font-medium">
                        {num(index + 1)}
                      </td>
                      <td className="border border-stone-300 px-4 py-2 font-bold text-stone-900">
                        {m.month}
                      </td>
                      <td className="border border-stone-300 px-3 py-2">
                        {isDashain ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-purple-100 text-purple-800 rounded">
                            🎁 दसैं भत्ता भुक्तानी
                          </span>
                        ) : isPoshak ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded">
                            👔 पोशाक भत्ता भुक्तानी
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">नियमित मासिक</span>
                        )}
                      </td>
                      <td className="border border-stone-300 px-3 py-2 text-right font-mono">
                        {format(m.regularGross)}
                      </td>
                      <td className="border border-stone-300 px-3 py-2 text-right font-mono text-purple-900 font-semibold bg-purple-50/30">
                        {m.dashainTotal > 0 ? format(m.dashainTotal) : '-'}
                      </td>
                      <td className="border border-stone-300 px-3 py-2 text-right font-mono text-emerald-900 font-semibold bg-emerald-50/30">
                        {m.poshakTotal > 0 ? format(m.poshakTotal) : '-'}
                      </td>
                      <td className="border border-stone-300 px-3 py-2 text-right font-mono font-bold bg-indigo-50/50 text-indigo-950">
                        {format(m.totalGross)}
                      </td>
                      <td className="border border-stone-300 px-3 py-2 text-right font-mono text-rose-900">
                        {format(m.totalDeductions)}
                      </td>
                      <td className="border border-stone-300 px-3 py-2 text-right font-mono text-amber-900">
                        {format(m.totalTax)}
                      </td>
                      <td className="border border-stone-300 px-4 py-2 text-right font-mono font-extrabold bg-emerald-100/70 text-emerald-950">
                        {format(m.totalNet)}
                      </td>
                      <td className="border border-stone-300 px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMonth(m.month);
                            setViewMode('monthly');
                          }}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2"
                        >
                          विस्तृत हेर्नुहोस्
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot className="bg-amber-100/90 font-extrabold text-stone-900 border-t-2 border-stone-500">
                <tr>
                  <td colSpan={3} className="border border-stone-400 px-4 py-2.5 text-center font-bold">
                    वार्षिक कुल जम्मा (१२ महिना)
                  </td>
                  <td className="border border-stone-400 px-3 py-2.5 text-right font-mono">
                    {format(annualGrandTotal.regularGross)}
                  </td>
                  <td className="border border-stone-400 px-3 py-2.5 text-right font-mono text-purple-950 bg-purple-200">
                    {format(annualGrandTotal.dashainTotal)}
                  </td>
                  <td className="border border-stone-400 px-3 py-2.5 text-right font-mono text-emerald-950 bg-emerald-200">
                    {format(annualGrandTotal.poshakTotal)}
                  </td>
                  <td className="border border-stone-400 px-3 py-2.5 text-right font-mono bg-indigo-200 text-indigo-950 font-black">
                    {format(annualGrandTotal.totalGross)}
                  </td>
                  <td className="border border-stone-400 px-3 py-2.5 text-right font-mono text-rose-950 bg-rose-200">
                    {format(annualGrandTotal.totalDeductions)}
                  </td>
                  <td className="border border-stone-400 px-3 py-2.5 text-right font-mono bg-amber-200 text-amber-950">
                    {format(annualGrandTotal.totalTax)}
                  </td>
                  <td className="border border-stone-400 px-4 py-2.5 text-right font-mono bg-emerald-300 text-emerald-950 font-black">
                    {format(annualGrandTotal.totalNet)}
                  </td>
                  <td className="border border-stone-400 px-3 py-2.5 text-center text-xs">
                    वार्षिक बजेट
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="max-w-[1750px] mx-auto px-4 sm:px-6 pb-16 space-y-4">
      {dashboardLayout === 'sidebar' ? (
        /* LEFT SIDEBAR DASHBOARD LAYOUT */
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Sidebar Dashboard */}
          <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-20 space-y-3">
            {/* Card 1: Month Selector & Navigation */}
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs">
                  <LayoutDashboard className="w-4 h-4 text-blue-600" />
                  <span>मासिक ड्यासबोर्ड (Dashboard)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDashboardLayout('top')}
                  title="माथिल्लो दृश्यमा बदल्नुहोस् (Top Bar View)"
                  className="flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded border border-stone-300 font-medium transition-colors"
                >
                  <PanelTop className="w-3.5 h-3.5 text-stone-600" />
                  <span>माथि</span>
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-lg border border-stone-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setViewMode('monthly')}
                  className={`py-1.5 px-2 rounded flex items-center justify-center gap-1 text-[11px] transition-colors ${
                    viewMode === 'monthly'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>मासिक तालिका</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('annual')}
                  className={`py-1.5 px-2 rounded flex items-center justify-center gap-1 text-[11px] transition-colors ${
                    viewMode === 'annual'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>१२ महिना तुलना</span>
                </button>
              </div>

              {/* 12 Months Selection Grid */}
              <div>
                <div className="text-[11px] font-semibold text-stone-500 mb-1.5 flex items-center justify-between">
                  <span>महिना छनोट (Select Month):</span>
                  <span className="text-[10px] text-stone-400">आ.व. {fiscalYear}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {NEPALI_MONTHS.map((month) => {
                    const isSelected = month === selectedMonth;
                    const isDashain = month === allowanceSettings.dashainMonth;
                    const isPoshak = month === allowanceSettings.poshakMonth;
                    const isNewGrade = (month === 'वैशाख' || month === 'जेठ' || month === 'असार') && !isDashain && !isPoshak;

                    return (
                      <button
                        type="button"
                        key={month}
                        onClick={() => {
                          setSelectedMonth(month);
                          if (viewMode === 'annual') setViewMode('monthly');
                        }}
                        className={`p-2 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                            : isDashain
                            ? 'bg-purple-50 text-purple-950 border-purple-300 hover:bg-purple-100 font-semibold'
                            : isPoshak
                            ? 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100 font-semibold'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{month}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        {isDashain && (
                          <span className={`text-[9px] mt-1 rounded px-1 font-bold inline-block ${
                            isSelected ? 'bg-purple-800 text-white' : 'text-purple-700 bg-purple-100'
                          }`}>
                            🎁 दसैं भत्ता
                          </span>
                        )}
                        {isPoshak && (
                          <span className={`text-[9px] mt-1 rounded px-1 font-bold inline-block ${
                            isSelected ? 'bg-emerald-800 text-white' : 'text-emerald-700 bg-emerald-100'
                          }`}>
                            👔 पोशाक भत्ता
                          </span>
                        )}
                        {isNewGrade && (
                          <span className={`text-[9px] mt-1 rounded px-1 font-bold inline-block ${
                            isSelected ? 'bg-amber-700 text-white' : 'text-amber-800 bg-amber-100'
                          }`}>
                            ⭐ नयाँ ग्रेड
                          </span>
                        )}
                        {!isDashain && !isPoshak && !isNewGrade && (
                          <span className={`text-[9px] mt-1 ${isSelected ? 'text-blue-100' : 'text-stone-400'}`}>
                            नियमित महिना
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Card 2: Current Month Summary Metrics Card */}
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                <span className="font-bold text-stone-900">{selectedMonth} महिनाको सारांश</span>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {num(teachers.length)} जना कर्मचारी
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-stone-600">
                  <span>नियमित तलब जम्मा:</span>
                  <span className="font-bold text-stone-800 font-mono">रू {format(totals.regularMonthlyGross)}</span>
                </div>

                {selectedMonth === allowanceSettings.dashainMonth && (
                  <div className="flex justify-between items-center text-purple-900 bg-purple-50 px-2 py-1 rounded">
                    <span className="font-semibold">🎁 दसैं भत्ता थप:</span>
                    <span className="font-bold font-mono">रू {format(totals.dashainBhatta)}</span>
                  </div>
                )}

                {selectedMonth === allowanceSettings.poshakMonth && (
                  <div className="flex justify-between items-center text-emerald-900 bg-emerald-50 px-2 py-1 rounded">
                    <span className="font-semibold">👔 पोशाक भत्ता थप:</span>
                    <span className="font-bold font-mono">रू {format(totals.poshakBhatta)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-stone-200 pt-1 text-stone-900">
                  <span className="font-bold">महिनाको कुल निकासा:</span>
                  <span className="font-extrabold text-indigo-900 font-mono">रू {format(totals.totalMonthlyGross)}</span>
                </div>

                <div className="flex justify-between items-center text-rose-800">
                  <span>कुल कट्टी (कोष, बिमा):</span>
                  <span className="font-bold font-mono">- रू {format(totals.totalMonthlyKatti)}</span>
                </div>

                <div className="flex justify-between items-center text-amber-800 text-[11px]">
                  <span>१% सामाजिक सुरक्षा कर:</span>
                  <span className="font-mono">रू {format(totals.tax1Percent)}</span>
                </div>

                <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-lg mt-2 flex justify-between items-center">
                  <div>
                    <span className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider">खुद भुक्तानी (Net)</span>
                    <span className="text-[10px] text-emerald-700">खातामा जम्मा हुने रकम</span>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-950 font-mono">रू {format(totals.netPayable)}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Quick Actions & Settings */}
            <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onPrintMonthly(selectedMonth)}
                  className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>प्रिन्ट प्रतिवेदन</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportMonthlyCsv}
                  className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel (CSV)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="w-full inline-flex items-center justify-between px-2.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
                  <span>दसैं र पोशाक भत्ता महिना सेटिङ</span>
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                  {allowanceSettings.dashainMonth} / {allowanceSettings.poshakMonth}
                </span>
              </button>
            </div>
          </aside>

          {/* Right Main Table Area */}
          <main className="flex-1 min-w-0 w-full space-y-4">
            {/* Allowance Settings Drawer (Expandable) */}
            {showSettings && (
              <div className="p-3.5 bg-white rounded-xl border border-stone-200 text-xs flex flex-wrap items-center gap-4 shadow-2xs animate-in fade-in duration-150">
                <span className="font-bold text-stone-800">भत्ता भुक्तानी महिना कन्फिगरेसन:</span>
                <div className="flex items-center gap-2">
                  <label className="text-stone-600 font-medium">दसैं भत्ता महिना:</label>
                  <select
                    value={allowanceSettings.dashainMonth}
                    onChange={(e) => setAllowanceSettings({ ...allowanceSettings, dashainMonth: e.target.value as NepaliMonth })}
                    className="bg-white border border-stone-300 rounded px-2 py-1 font-bold text-stone-800"
                  >
                    {NEPALI_MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-stone-600 font-medium">पोशाक भत्ता महिना:</label>
                  <select
                    value={allowanceSettings.poshakMonth}
                    onChange={(e) => setAllowanceSettings({ ...allowanceSettings, poshakMonth: e.target.value as NepaliMonth })}
                    className="bg-white border border-stone-300 rounded px-2 py-1 font-bold text-stone-800"
                  >
                    {NEPALI_MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-stone-600 font-medium">पोशाक भत्ता रकम:</label>
                  <input
                    type="number"
                    value={allowanceSettings.poshakAmount}
                    onChange={(e) => setAllowanceSettings({ ...allowanceSettings, poshakAmount: parseInt(e.target.value) || 10000 })}
                    className="bg-white border border-stone-300 rounded px-2 py-1 font-bold w-24 text-right"
                  />
                </div>
              </div>
            )}

            {renderTablesContent()}
          </main>
        </div>
      ) : (
        /* TOP BAR DASHBOARD LAYOUT */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded">
                    मासिक प्रतिवेदन तथा भत्ता ड्यासबोर्ड
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    साउनमा दसैं भुक्तानी • चैतमा पोशाक भुक्तानी
                  </span>
                </div>
                <h2 className="text-lg font-bold text-stone-900 mt-1">
                  महिना अनुसार तलबी निकासा विवरण (Monthly Payroll Dashboard)
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Switch back to Sidebar button */}
                <button
                  type="button"
                  onClick={() => setDashboardLayout('sidebar')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                  title="ड्यासबोर्डलाई बायाँ साइडबारमा देखाउनुहोस्"
                >
                  <PanelLeft className="w-3.5 h-3.5" />
                  <span>बायाँ ड्यासबोर्ड</span>
                </button>

                {/* View Mode Toggle: Single Month vs 12-Month Matrix */}
                <div className="inline-flex rounded-lg border border-stone-300 p-0.5 bg-stone-50">
                  <button
                    type="button"
                    onClick={() => setViewMode('monthly')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
                      viewMode === 'monthly'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-stone-700 hover:text-stone-900'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>मासिक प्रतिवेदन तालिका</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('annual')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
                      viewMode === 'annual'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-stone-700 hover:text-stone-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>१२ महिनाको वार्षिक तुलना</span>
                  </button>
                </div>

                {/* Print Button */}
                <button
                  type="button"
                  onClick={() => onPrintMonthly(selectedMonth)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{selectedMonth} प्रतिवेदन प्रिन्ट</span>
                </button>

                {/* Export CSV */}
                <button
                  type="button"
                  onClick={handleExportMonthlyCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{selectedMonth} Excel (CSV)</span>
                </button>

                {/* Settings Toggle */}
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded border border-stone-200"
                  title="दसैं र पोशाक भत्ता महिना सेटिङ"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Allowance Settings Drawer (Expandable) */}
            {showSettings && (
              <div className="mt-3 p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs flex flex-wrap items-center gap-4 animate-in fade-in duration-150">
                <span className="font-bold text-stone-800">भत्ता भुक्तानी महिना कन्फिगरेसन:</span>
                <div className="flex items-center gap-2">
                  <label className="text-stone-600 font-medium">दसैं भत्ता भुक्तानी महिना:</label>
                  <select
                    value={allowanceSettings.dashainMonth}
                    onChange={(e) => setAllowanceSettings({ ...allowanceSettings, dashainMonth: e.target.value as NepaliMonth })}
                    className="bg-white border border-stone-300 rounded px-2 py-1 font-bold text-stone-800"
                  >
                    {NEPALI_MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-stone-600 font-medium">पोशाक भत्ता भुक्तानी महिना:</label>
                  <select
                    value={allowanceSettings.poshakMonth}
                    onChange={(e) => setAllowanceSettings({ ...allowanceSettings, poshakMonth: e.target.value as NepaliMonth })}
                    className="bg-white border border-stone-300 rounded px-2 py-1 font-bold text-stone-800"
                  >
                    {NEPALI_MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-stone-600 font-medium">पोशाक भत्ता रकम (प्रति शिक्षक):</label>
                  <input
                    type="number"
                    value={allowanceSettings.poshakAmount}
                    onChange={(e) => setAllowanceSettings({ ...allowanceSettings, poshakAmount: parseInt(e.target.value) || 10000 })}
                    className="bg-white border border-stone-300 rounded px-2 py-1 font-bold w-24 text-right"
                  />
                </div>
              </div>
            )}

            {/* 12 Months Navigation Pills */}
            <div className="mt-3 pt-2">
              <div className="text-xs font-semibold text-stone-500 mb-2 flex items-center justify-between">
                <span>महिना छनोट गर्नुहोस् (Select Month):</span>
                <span className="text-[11px] text-stone-400">
                  * साउनमा दसैं भत्ता र चैतमा पोशाक भत्ता स्वतः थप गरिएको छ
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
                {NEPALI_MONTHS.map((month) => {
                  const isSelected = month === selectedMonth;
                  const isDashain = month === allowanceSettings.dashainMonth;
                  const isPoshak = month === allowanceSettings.poshakMonth;

                  return (
                    <button
                      type="button"
                      key={month}
                      onClick={() => setSelectedMonth(month)}
                      className={`p-2 rounded-lg border text-center transition-all relative ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                          : isDashain
                          ? 'bg-purple-50 text-purple-950 border-purple-300 hover:bg-purple-100 font-semibold'
                          : isPoshak
                          ? 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100 font-semibold'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className="text-xs">{month}</div>
                      {isDashain && (
                        <span className={`block text-[9px] mt-0.5 rounded px-1 font-bold ${
                          isSelected ? 'bg-purple-800 text-white' : 'text-purple-700 bg-purple-100'
                        }`}>
                          🎁 दसैं भुक्तानी
                        </span>
                      )}
                      {isPoshak && (
                        <span className={`block text-[9px] mt-0.5 rounded px-1 font-bold ${
                          isSelected ? 'bg-emerald-800 text-white' : 'text-emerald-700 bg-emerald-100'
                        }`}>
                          👔 पोशाक भत्ता
                        </span>
                      )}
                      {(month === 'वैशाख' || month === 'जेठ' || month === 'असार') && !isDashain && !isPoshak && (
                        <span className={`block text-[9px] mt-0.5 rounded px-1 font-bold ${
                          isSelected ? 'bg-amber-700 text-white' : 'text-amber-800 bg-amber-100'
                        }`}>
                          ⭐ नयाँ ग्रेड (३ महिना)
                        </span>
                      )}
                      {!isDashain && !isPoshak && (
                        <span className={`block text-[9px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-stone-400'}`}>
                          नियमित
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Month Specific Metric Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Staff */}
            <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">कुल कर्मचारी</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-stone-900 mt-1">
                {num(teachers.length)} जना
              </p>
              <span className="text-[11px] text-stone-500">{selectedMonth} महिनाको लागि</span>
            </div>

            {/* Regular Gross */}
            <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">नियमित तलब जम्मा</span>
                <Coins className="w-4 h-4 text-stone-600" />
              </div>
              <p className="text-lg font-bold text-stone-900 mt-1">
                रू {format(totals.regularMonthlyGross)}
              </p>
              <span className="text-[11px] text-stone-500">तलब + ग्रेड + कोष + भत्ता</span>
            </div>

            {/* Dashain / Poshak Extra */}
            {selectedMonth === allowanceSettings.dashainMonth ? (
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-300 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900">🎁 दसैं भत्ता जम्मा</span>
                  <Sparkles className="w-4 h-4 text-purple-700" />
                </div>
                <p className="text-lg font-extrabold text-purple-950 mt-1">
                  रू {format(totals.dashainBhatta)}
                </p>
                <span className="text-[11px] text-purple-700 font-medium">साउनमा निकासा हुने रकम</span>
              </div>
            ) : selectedMonth === allowanceSettings.poshakMonth ? (
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-300 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">👔 पोशाक भत्ता जम्मा</span>
                  <Shirt className="w-4 h-4 text-emerald-700" />
                </div>
                <p className="text-lg font-extrabold text-emerald-950 mt-1">
                  रू {format(totals.poshakBhatta)}
                </p>
                <span className="text-[11px] text-emerald-700 font-medium">चैतमा निकासा हुने रकम</span>
              </div>
            ) : (
              <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-500">चाडपर्व/पोशाक भत्ता</span>
                  <span className="text-[10px] text-stone-400">नियमित महिना</span>
                </div>
                <p className="text-lg font-bold text-stone-400 mt-1">रू ०.००</p>
                <span className="text-[11px] text-stone-400">साउन र चैतमा मात्र</span>
              </div>
            )}

            {/* Total Monthly Gross */}
            <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">{selectedMonth} कुल निकासा</span>
                <span className="text-[11px] font-bold text-indigo-700">कुल तलब</span>
              </div>
              <p className="text-lg font-extrabold text-indigo-950 mt-1">
                रू {format(totals.totalMonthlyGross)}
              </p>
              <span className="text-[11px] text-stone-500">नियमित + थप भत्ता</span>
            </div>

            {/* Total Deductions */}
            <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">कुल कट्टी रकम</span>
                <Receipt className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-lg font-bold text-rose-800 mt-1">
                रू {format(totals.totalMonthlyKatti)}
              </p>
              <span className="text-[11px] text-stone-500">क. कोष, बिमा, सा.क. कोष</span>
            </div>

            {/* Net Payable - Small & Attractive */}
            <div className="bg-gradient-to-b from-emerald-50 via-emerald-50/90 to-teal-50/70 p-2.5 rounded-lg border border-emerald-400 shadow-2xs relative flex flex-col justify-between hover:border-emerald-500 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-950">खुद भुक्तानी रकम</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-full border border-emerald-300/80">
                  <CheckCircle className="w-3 h-3 text-emerald-700" />
                  <span>खुद</span>
                </span>
              </div>
              <p className="text-base sm:text-[17px] font-black text-emerald-950 mt-1 tracking-tight font-mono">
                रू {format(totals.netPayable)}
              </p>
              <span className="text-[10px] text-emerald-800 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                खातामा जाने खुद तलब
              </span>
            </div>
          </div>

          {renderTablesContent()}
        </div>
      )}
    </div>
  );
};
