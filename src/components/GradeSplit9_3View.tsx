import React from 'react';
import {
  Printer,
  Sparkles,
  UserCheck,
  RotateCcw,
  ArrowLeft,
  Calendar,
  Clock,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { TeacherRecord, SchoolInfo, FiscalYearPayroll } from '../types';
import { calculateGradeSplit9_3, GradeSplitTeacherResult } from '../utils/calculations';
import { formatCurrency, toNepaliNumber, numberToWordsNepali } from '../utils/nepaliNumber';

interface GradeSplit9_3ViewProps {
  currentFiscalYear?: FiscalYearPayroll;
  teachers?: TeacherRecord[];
  fiscalYear?: string;
  useNepaliDigits?: boolean;
  schoolInfo: SchoolInfo;
  onUpdateTeacher: (updatedTeacher: TeacherRecord) => void;
  onUpdateFiscalYear?: (updatedFY: FiscalYearPayroll) => void;
  onClose?: () => void;
}

export const GradeSplit9_3View: React.FC<GradeSplit9_3ViewProps> = ({
  currentFiscalYear,
  teachers: propTeachers,
  fiscalYear: propFiscalYear,
  useNepaliDigits = true,
  schoolInfo,
  onUpdateTeacher,
  onClose,
}) => {
  const teachers = propTeachers || currentFiscalYear?.teachers || [];
  const fiscalYear = propFiscalYear || currentFiscalYear?.fiscalYear || '२०८२/८३';

  const format = (val: number | undefined | null) =>
    formatCurrency(val, { nepaliDigits: useNepaliDigits });

  const num = (val: number | string | undefined | null) =>
    useNepaliDigits ? toNepaliNumber(val) : (val !== undefined && val !== null ? val.toString() : '0');

  // Update teacher working duration across Period 1 and Period 2 and sync with customMonths
  const handleUpdateDuration = (
    teacher: TeacherRecord,
    p1Months: number,
    p1Days: number,
    p2Months: number,
    p2Days: number
  ) => {
    const totalM = Math.max(0, p1Months) + Math.max(0, p2Months);
    const totalD = Math.max(0, p1Days) + Math.max(0, p2Days);
    const extraM = Math.floor(totalD / 30);
    const remD = totalD % 30;
    const finalM = totalM + extraM;
    let label = '';
    if (finalM > 0 && remD > 0) {
      label = `${finalM} महिना ${remD} दिन`;
    } else if (finalM > 0) {
      label = `${finalM} महिना`;
    } else if (remD > 0) {
      label = `${remD} दिन`;
    } else {
      label = '० महिना';
    }

    onUpdateTeacher({
      ...teacher,
      period1Months: p1Months,
      period1Days: p1Days,
      period2Months: p2Months,
      period2Days: p2Days,
      customMonths: finalM,
      customDays: remD,
      customDurationLabel: label,
    });
  };

  // Auto-fill all permanent teachers with +1 grade for Baisakh if not already set
  const handleAutoSetBaisakhGrades = () => {
    teachers.forEach((teacher) => {
      const currentGrade = Number(teacher.gradeCount) || 0;
      const baisakhGrade = teacher.category === 'permanent' ? currentGrade + 1 : currentGrade;
      const standardDashain = (teacher.category === 'permanent' || teacher.designation.includes('वि.'))
        ? (Number(teacher.basicSalary) || 0) + (currentGrade * (Number(teacher.gradeRate) || Math.round((Number(teacher.basicSalary) || 0) / 30)))
        : 0;
      const standardPoshak = (teacher.category === 'permanent' || teacher.designation.includes('वि.')) ? 10000 : 0;

      onUpdateTeacher({
        ...teacher,
        gradeCountBaisakh: teacher.gradeCountBaisakh !== undefined ? teacher.gradeCountBaisakh : baisakhGrade,
        dashainBhatta: teacher.dashainBhatta !== undefined ? teacher.dashainBhatta : standardDashain,
        poshakBhatta: teacher.poshakBhatta !== undefined ? teacher.poshakBhatta : standardPoshak,
      });
    });
    alert('सबै स्थायी शिक्षकहरूको वैशाख १ देखिको १ ग्रेड वृद्धि र दसैं/पोशाक भत्ता प्रारम्भिक सेट गरियो!');
  };

  // Set standard 9 and 3 months for regular teachers without modifying teachers with custom partial periods
  const handleKeepPartialAndSetStandard = () => {
    teachers.forEach((teacher) => {
      const hasCustom = (teacher.customMonths !== undefined && teacher.customMonths < 12) || 
        (teacher.period1Months !== undefined && (teacher.period1Months !== 9 || teacher.period2Months !== 3));
      if (!hasCustom) {
        handleUpdateDuration(teacher, 9, 0, 3, 0);
      }
    });
    alert('नियमित शिक्षकहरूको ९ र ३ महिना सेट गरियो (आंशिक अवधि भएका शिक्षकहरूको यथावत राखियो)!');
  };

  // Reset everyone to standard full 12 months (9 months in Period 1 and 3 months in Period 2)
  const handleResetAllTo9And3 = () => {
    if (confirm('के तपाईं सबै शिक्षकहरूको अवधि ९ महिना (साउन-चैत) र ३ महिना (वैशाख-असार) पूर्ण १२ महिना सेट गर्न चाहनुहुन्छ? (चेतावनी: आंशिक अवधि भएका शिक्षकहरूको पनि १२ महिना हुनेछ)')) {
      teachers.forEach((teacher) => {
        handleUpdateDuration(teacher, 9, 0, 3, 0);
      });
    }
  };

  // Compute 9/3 split calculations for all teachers respecting individual working periods
  const calculatedRows: GradeSplitTeacherResult[] = teachers.map((t) =>
    calculateGradeSplit9_3(t)
  );

  // Totals
  const totalAnnualGross = calculatedRows.reduce((acc, r) => acc + r.annualTotalGross, 0);
  const totalAnnualKatti = calculatedRows.reduce((acc, r) => acc + r.annualTotalKatti, 0);
  const totalAnnualTax = calculatedRows.reduce((acc, r) => acc + r.annualTax1Percent, 0);
  const totalAnnualNet = calculatedRows.reduce((acc, r) => acc + r.annualNetPayable, 0);
  const totalDashain = calculatedRows.reduce((acc, r) => acc + r.dashainBhatta, 0);
  const totalPoshak = calculatedRows.reduce((acc, r) => acc + r.poshakBhatta, 0);
  const totalP1Gross = calculatedRows.reduce((acc, r) => acc + r.p1PeriodGross, 0);
  const totalP1Katti = calculatedRows.reduce((acc, r) => acc + r.p1PeriodKatti, 0);
  const totalP1Cit = calculatedRows.reduce((acc, r) => acc + (r.p1CitKatti || 0), 0);
  const totalP2Gross = calculatedRows.reduce((acc, r) => acc + r.p2PeriodGross, 0);
  const totalP2Katti = calculatedRows.reduce((acc, r) => acc + r.p2PeriodKatti, 0);
  const totalP2Cit = calculatedRows.reduce((acc, r) => acc + (r.p2CitKatti || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Top Controls & Navigation Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                <Sparkles className="w-3.5 h-3.5" />
                <span>साउन १ देखि असार मसान्त आर्थिक वर्ष</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900">
                <Clock className="w-3.5 h-3.5" />
                <span>प्रत्येक शिक्षकको काम गरेको अवधि (महिना र दिन) अनुसारको हिसाब</span>
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-stone-900">
              ९ महिना (साउन-चैत) र ३ महिना (वैशाख-असार नयाँ ग्रेड) वार्षिक तलब भर्पाई
            </h2>
            <p className="text-xs text-stone-600 max-w-3xl">
              साउनदेखि चैतसम्म पुरानो ग्रेड र वैशाखदेखि असारसम्म नयाँ ग्रेड कायम गरी तयार गरिएको भर्पाई। कुनै शिक्षकले थोरै वा धेरै महिना (जस्तै: १ महिना १७ दिन, ५ महिना आदि) काम गरेको भए तलको तालिकामा सोही अनुसार अवधि सच्याउन सक्नुहुन्छ।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg shadow-2xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>रजिस्टरमा फर्कनुहोस्</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleAutoSetBaisakhGrades}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg shadow-2xs transition-colors"
              title="स्थायी शिक्षकहरूको वैशाख १ देखि १ ग्रेड थप र भत्ता सेट गर्नुहोस्"
            >
              <UserCheck className="w-4 h-4 text-amber-700" />
              <span>वैशाख १ ग्रेड स्वतः भर्नुहोस्</span>
            </button>

            <button
              type="button"
              onClick={handleKeepPartialAndSetStandard}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-colors"
              title="नियमित शिक्षकहरूलाई ९ र ३ महिना सेट गर्नुहोस् तर आंशिक महिना काम गरेका शिक्षकहरूको अवधि सुरक्षित राख्नुहोस्"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>नियमित शिक्षक ९ र ३ महिना (आंशिक सुरक्षित)</span>
            </button>

            <button
              type="button"
              onClick={handleResetAllTo9And3}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-lg shadow-2xs transition-colors"
              title="सबैलाई पूर्ण १२ महिना (९ महिना + ३ महिना) रिसेट गर्नुहोस्"
            >
              <RotateCcw className="w-4 h-4 text-blue-700" />
              <span>सबैलाई ९ र ३ महिना सेट</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg shadow-2xs transition-colors"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              <span>वार्षिक भर्पाई प्रिन्ट</span>
            </button>
          </div>
        </div>

        {/* Helpful Guidance Alert Box */}
        <div className="mt-3 p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start gap-2 text-[11px] text-amber-900">
          <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <b>महत्त्वपूर्ण जानकारी:</b> सबै शिक्षकको काम गरेको अवधि एकैनास नहुन सक्छ। तालिकाको <b>अवधि १ (साउन-चैत)</b> र <b>अवधि २ (वैशाख-असार)</b> कोठामा महिना र दिन सिधै टाइप गर्नुहोस् (जस्तै: १ महिना १७ दिन, ५ महिना आदि)। तलब र कट्टी रकम अवधि अनुसार नै ठ्याक्कै तलबी भर्पाईसँग मिल्ने गरी हिसाब हुनेछ।
          </div>
        </div>

        {/* Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-stone-200">
          <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
            <span className="text-[11px] text-stone-500 font-medium block">साउन-चैत तलब (अवधि १)</span>
            <span className="text-xs font-bold text-stone-800 font-mono">
              {format(totalP1Gross)}
            </span>
          </div>

          <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200">
            <span className="text-[11px] text-amber-800 font-bold block">वैशाख-असार तलब (अवधि २)</span>
            <span className="text-xs font-bold text-amber-950 font-mono">
              {format(totalP2Gross)}
            </span>
          </div>

          <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200">
            <span className="text-[11px] text-purple-800 font-bold block">दसैं भत्ता (म्यानुअल)</span>
            <span className="text-xs font-bold text-purple-950 font-mono">
              {format(totalDashain)}
            </span>
          </div>

          <div className="bg-sky-50 p-2.5 rounded-lg border border-sky-200">
            <span className="text-[11px] text-sky-800 font-bold block">पोशाक भत्ता (म्यानुअल)</span>
            <span className="text-xs font-bold text-sky-950 font-mono">
              {format(totalPoshak)}
            </span>
          </div>

          <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            <span className="text-[11px] text-rose-800 font-bold block">वार्षिक कट्टी र १% कर</span>
            <span className="text-xs font-bold text-rose-950 font-mono">
              {format(totalAnnualKatti + totalAnnualTax)}
            </span>
          </div>

          <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-300">
            <span className="text-[11px] text-emerald-800 font-black block">वार्षिक खुद भुक्तानी</span>
            <span className="text-sm font-black text-emerald-950 font-mono">
              {format(totalAnnualNet)}
            </span>
          </div>
        </div>
      </div>

      {/* Main 9/3 Split Table with Duration Controls */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        {/* Table Header Details */}
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-stone-800">
              {schoolInfo.schoolName} | आ.व. {fiscalYear} वार्षिक तलबी भर्पाई
            </span>
            <p className="text-[11px] text-stone-500">
              * प्रत्येक शिक्षकको काम गरेको महिना/दिन, नयाँ ग्रेड, दसैं र पोशाक भत्ता सोझै सम्पादन गर्न सकिन्छ
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-stone-600">
            <span>
              कुल शिक्षक संख्या: <span className="font-bold text-stone-900">{num(teachers.length)}</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              {/* Level 1 Super Header */}
              <tr className="bg-stone-100 text-stone-800 border-b border-stone-300 text-center font-bold">
                <th colSpan={4} className="border border-stone-300 px-2 py-2 bg-stone-200 text-left">
                  शिक्षकको विवरण
                </th>
                <th colSpan={6} className="border border-stone-300 px-2 py-2 bg-blue-100 text-blue-950">
                  अवधि १: साउनदेखि चैतसम्म (पुरानो ग्रेड)
                </th>
                <th colSpan={6} className="border border-stone-300 px-2 py-2 bg-amber-100 text-amber-950">
                  अवधि २: वैशाखदेखि असारसम्म (नयाँ ग्रेड)
                </th>
                <th colSpan={2} className="border border-stone-300 px-2 py-2 bg-purple-100 text-purple-950">
                  चाडपर्व तथा पोशाक (म्यानुअल)
                </th>
                <th colSpan={4} className="border border-stone-300 px-2 py-2 bg-emerald-100 text-emerald-950">
                  वार्षिक कुल जम्मा (काम गरेको अवधि अनुसार)
                </th>
              </tr>

              {/* Level 2 Column Headers */}
              <tr className="bg-stone-50 text-stone-700 border-b border-stone-300 text-[11px]">
                <th className="border border-stone-300 px-2 py-1.5 w-10 text-center">क्र.सं.</th>
                <th className="border border-stone-300 px-2 py-1.5 text-left min-w-[150px]">शिक्षकको नाम र अवधि</th>
                <th className="border border-stone-300 px-2 py-1.5 text-left min-w-[90px]">पद / श्रेणी</th>
                <th className="border border-stone-300 px-2 py-1.5 text-right min-w-[75px]">सुरु तलब</th>

                {/* Period 1 (Shrawan-Chaitra) */}
                <th className="border border-stone-300 px-1 py-1.5 text-center bg-blue-50/50 w-12">ग्रेड</th>
                <th className="border border-stone-300 px-1.5 py-1.5 text-right bg-blue-50/50 min-w-[70px]">मासिक जम्मा</th>
                <th className="border border-stone-300 px-1.5 py-1.5 text-center bg-blue-100/70 min-w-[110px] font-bold text-blue-950">
                  अवधि १ (महिना र दिन) ✏️
                </th>
                <th className="border border-stone-300 px-1.5 py-1.5 text-right bg-blue-50/50 min-w-[80px] font-bold text-blue-900">
                  अवधि १ तलब
                </th>
                <th className="border border-stone-300 px-1.5 py-1.5 text-right bg-blue-50/50 min-w-[70px] text-rose-800">
                  अवधि १ कट्टी
                </th>
                <th className="border border-stone-300 px-1.5 py-1.5 text-right bg-blue-100/80 min-w-[65px] text-stone-800 font-semibold" title="साउनदेखि चैतसम्मको सा.क. कोष / ना.ल. कोष कट्टी">
                  अवधि १ सा.क.
                </th>

                {/* Period 2 (Baisakh-Ashad) */}
                <th className="border border-stone-300 px-1 py-1.5 text-center bg-amber-50/70 w-18 font-bold text-amber-900">
                  वैशाख ग्रेड ✏️
                </th>
                <th className="border border-stone-300 px-1.5 py-1.5 text-right bg-amber-50/70 min-w-[70px]">मासिक जम्मा</th>
                <th className="border border-stone-300 px-1.5 py-1.5 text-center bg-amber-100/80 min-w-[110px] font-bold text-amber-950">
                  अवधि २ (महिना र दिन) ✏️
                </th>
                <th className="border border-stone-300 px-1.5 py-1.5 text-right bg-amber-50/70 min-w-[80px] font-bold text-amber-900">
                  अवधि २ तलब
                </th>
                <th className="border border-stone-300 px-1.5 py-1.5 text-right bg-amber-50/70 min-w-[70px] text-rose-800">
                  अवधि २ कट्टी
                </th>
                <th className="border border-stone-300 px-1.5 py-1.5 text-right bg-amber-100 min-w-[85px] font-bold text-amber-950" title="वैशाखदेखि असारसम्म फरक सा.क. कोष कट्टी भए सोझै भर्नुहोस्">
                  वैशाख सा.क. ✏️
                </th>

                {/* Manual Allowances */}
                <th className="border border-stone-300 px-1.5 py-1.5 text-right bg-purple-50/50 min-w-[85px] font-bold text-purple-900">
                  दसैं भत्ता ✏️
                </th>
                <th className="border border-stone-300 px-1.5 py-1.5 text-right bg-purple-50/50 min-w-[80px] font-bold text-purple-900">
                  पोशाक भत्ता ✏️
                </th>

                {/* Annual Totals */}
                <th className="border border-stone-300 px-2 py-1.5 text-right bg-emerald-50/40 min-w-[85px] font-bold">वार्षिक तलब</th>
                <th className="border border-stone-300 px-2 py-1.5 text-right bg-rose-50/40 min-w-[75px] text-rose-900">वार्षिक कट्टी</th>
                <th className="border border-stone-300 px-2 py-1.5 text-right bg-amber-50/40 min-w-[65px]">१% कर</th>
                <th className="border border-stone-300 px-2 py-1.5 text-right bg-emerald-100 min-w-[95px] font-extrabold text-emerald-950">
                  खुद पाउने
                </th>
              </tr>
            </thead>

            <tbody>
              {calculatedRows.map((r, idx) => {
                const teacher = r.teacher;
                const isPermanent = teacher.category === 'permanent';
                const isCustomDuration = r.totalWorkedMonths < 12;

                return (
                  <tr
                    key={`split-${teacher.id}-${idx}`}
                    className={`hover:bg-stone-50/90 transition-colors ${
                      idx % 2 === 1 ? 'bg-stone-50/30' : 'bg-white'
                    }`}
                  >
                    {/* SN */}
                    <td className="border border-stone-300 px-2 py-1.5 text-center text-stone-500 font-mono">
                      {num(idx + 1)}
                    </td>

                    {/* Name & Duration Tag & Quick Presets */}
                    <td className="border border-stone-300 px-2 py-1.5 font-bold text-stone-900">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span>{teacher.name}</span>
                          {isPermanent && (
                            <span className="text-[9px] px-1 py-0.2 bg-blue-100 text-blue-800 rounded font-normal">
                              स्थायी
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {isCustomDuration ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[10px] font-bold rounded border border-amber-300" title="यो शिक्षकको काम गरेको अवधि १२ महिना भन्दा फरक छ">
                              ⏳ कुल: {r.durationLabel}
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-500 font-normal">
                              कुल: १२ महिना
                            </span>
                          )}
                        </div>

                        {/* 1-Click Quick Presets for this Teacher */}
                        <div className="flex items-center gap-1 flex-wrap mt-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateDuration(teacher, 9, 0, 3, 0)}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-colors"
                            title="९ महिना (साउन-चैत) + ३ महिना (वैशाख-असार) = कुल १२ महिना"
                          >
                            १२म (९+३)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateDuration(teacher, 9, 0, 0, 0)}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition-colors"
                            title="साउन-चैत ९ महिना मात्र, वैशाख-असार ० महिना"
                          >
                            ९म (९+०)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateDuration(teacher, 6, 0, 0, 0)}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
                            title="साउन-चैत ६ महिना, वैशाख-असार ० महिना"
                          >
                            ६म
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateDuration(teacher, 3, 0, 0, 0)}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
                            title="साउन-चैत ३ महिना, वैशाख-असार ० महिना"
                          >
                            ३म (३+०)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateDuration(teacher, 0, 0, 3, 0)}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
                            title="साउन-चैत ० महिना, वैशाख-असार ३ महिना"
                          >
                            ३म (०+३)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateDuration(teacher, 1, 17, 0, 0)}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-semibold transition-colors"
                            title="१ महिना १७ दिन सेट (अवधि २ स्वतः ० महिना)"
                          >
                            १म १७दि
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateDuration(teacher, 0, 0, 0, 0)}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-300 transition-colors"
                            title="० महिना (काम नगरेको)"
                          >
                            ०म
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="border border-stone-300 px-2 py-1.5 text-stone-700 whitespace-nowrap text-[11px]">
                      {teacher.designation}
                    </td>

                    {/* Basic Salary */}
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-mono text-stone-800">
                      {format(teacher.basicSalary)}
                    </td>

                    {/* Period 1 (Shrawan-Chaitra) */}
                    <td className="border border-stone-300 px-1 py-1 text-center font-mono bg-blue-50/20">
                      {num(r.p1GradeCount)}
                    </td>
                    <td className="border border-stone-300 px-1.5 py-1 text-right font-mono bg-blue-50/20">
                      {format(r.p1MonthlyGross)}
                    </td>

                    {/* Period 1 Working Duration (Months & Days) */}
                    <td className="border border-stone-300 px-1.5 py-1 bg-blue-100/40">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center justify-center gap-1 font-mono">
                          <input
                            type="number"
                            min="0"
                            max="12"
                            value={r.period1Months}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              handleUpdateDuration(teacher, val, r.period1Days, r.period2Months, r.period2Days);
                            }}
                            className="w-10 text-center font-mono font-bold text-xs py-0.5 border border-blue-300 rounded bg-white text-blue-950 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                            title="साउन-चैत काम गरेको महिना (सामान्यतया ९ महिना)"
                          />
                          <span className="text-[10px] text-blue-800 font-semibold">म</span>
                          <input
                            type="number"
                            min="0"
                            max="29"
                            value={r.period1Days}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(29, parseInt(e.target.value) || 0));
                              handleUpdateDuration(teacher, r.period1Months, val, r.period2Months, r.period2Days);
                            }}
                            className="w-10 text-center font-mono font-bold text-xs py-0.5 border border-blue-300 rounded bg-white text-blue-950 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                            title="साउन-चैत काम गरेको थप दिन (० देखि २९ सम्म)"
                          />
                          <span className="text-[10px] text-blue-800 font-semibold">दि</span>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateDuration(teacher, 9, 0, r.period2Months, r.period2Days)}
                            className="text-[9px] px-1 py-0.2 rounded bg-blue-100 hover:bg-blue-200 text-blue-800"
                            title="साउन-चैत ९ महिना सेट"
                          >
                            ९म
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateDuration(teacher, 6, 0, r.period2Months, r.period2Days)}
                            className="text-[9px] px-1 py-0.2 rounded bg-blue-100 hover:bg-blue-200 text-blue-800"
                            title="साउन-चैत ६ महिना सेट"
                          >
                            ६म
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateDuration(teacher, 3, 0, r.period2Months, r.period2Days)}
                            className="text-[9px] px-1 py-0.2 rounded bg-blue-100 hover:bg-blue-200 text-blue-800"
                            title="साउन-चैत ३ महिना सेट"
                          >
                            ३म
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateDuration(teacher, 1, 17, 0, 0)}
                            className="text-[9px] px-1 py-0.2 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold"
                            title="१ महिना १७ दिन सेट (अवधि २ स्वतः ० महिना हुनेछ)"
                          >
                            १म १७दि
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateDuration(teacher, 0, 0, r.period2Months, r.period2Days)}
                            className="text-[9px] px-1 py-0.2 rounded bg-stone-100 hover:bg-stone-200 text-stone-600"
                            title="० महिना सेट"
                          >
                            ०
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="border border-stone-300 px-1.5 py-1 text-right font-mono font-bold text-blue-950 bg-blue-50/40">
                      {format(r.p1PeriodGross)}
                    </td>
                    <td className="border border-stone-300 px-1.5 py-1 text-right font-mono text-rose-800 bg-blue-50/20">
                      {format(r.p1PeriodKatti)}
                    </td>
                    <td className="border border-stone-300 px-1.5 py-1 text-right font-mono text-stone-700 bg-blue-100/30 font-semibold" title="अवधि १ सा.क. कोष कट्टी">
                      {r.p1CitKatti > 0 ? format(r.p1CitKatti) : '-'}
                    </td>

                    {/* Period 2 (Baisakh-Ashad) - Editable Grade */}
                    <td className="border border-stone-300 px-1 py-1 text-center bg-amber-50/40">
                      <input
                        type="number"
                        min="0"
                        max="25"
                        value={r.p2GradeCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          onUpdateTeacher({
                            ...teacher,
                            gradeCountBaisakh: val,
                          });
                        }}
                        className="w-12 text-center font-mono font-bold text-xs py-0.5 border border-amber-300 rounded bg-white text-amber-950 focus:ring-1 focus:ring-amber-500 shadow-2xs"
                        title="वैशाख १ देखिको नयाँ ग्रेड संख्या"
                      />
                    </td>
                    <td className="border border-stone-300 px-1.5 py-1 text-right font-mono bg-amber-50/30">
                      {format(r.p2MonthlyGross)}
                    </td>

                    {/* Period 2 Working Duration (Months & Days) */}
                    <td className="border border-stone-300 px-1.5 py-1 bg-amber-100/40">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center justify-center gap-1 font-mono">
                          <input
                            type="number"
                            min="0"
                            max="12"
                            value={r.period2Months}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              handleUpdateDuration(teacher, r.period1Months, r.period1Days, val, r.period2Days);
                            }}
                            className="w-10 text-center font-mono font-bold text-xs py-0.5 border border-amber-300 rounded bg-white text-amber-950 focus:ring-1 focus:ring-amber-500 shadow-2xs"
                            title="वैशाख-असार काम गरेको महिना (सामान्यतया ३ महिना)"
                          />
                          <span className="text-[10px] text-amber-800 font-semibold">म</span>
                          <input
                            type="number"
                            min="0"
                            max="29"
                            value={r.period2Days}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(29, parseInt(e.target.value) || 0));
                              handleUpdateDuration(teacher, r.period1Months, r.period1Days, r.period2Months, val);
                            }}
                            className="w-10 text-center font-mono font-bold text-xs py-0.5 border border-amber-300 rounded bg-white text-amber-950 focus:ring-1 focus:ring-amber-500 shadow-2xs"
                            title="वैशाख-असार काम गरेको थप दिन (० देखि २९ सम्म)"
                          />
                          <span className="text-[10px] text-amber-800 font-semibold">दि</span>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateDuration(teacher, r.period1Months, r.period1Days, 3, 0)}
                            className="text-[9px] px-1 py-0.2 rounded bg-amber-100 hover:bg-amber-200 text-amber-800"
                            title="वैशाख-असार ३ महिना सेट"
                          >
                            ३म
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateDuration(teacher, r.period1Months, r.period1Days, 2, 0)}
                            className="text-[9px] px-1 py-0.2 rounded bg-amber-100 hover:bg-amber-200 text-amber-800"
                            title="वैशाख-असार २ महिना सेट"
                          >
                            २म
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateDuration(teacher, r.period1Months, r.period1Days, 1, 0)}
                            className="text-[9px] px-1 py-0.2 rounded bg-amber-100 hover:bg-amber-200 text-amber-800"
                            title="वैशाख-असार १ महिना सेट"
                          >
                            १म
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateDuration(teacher, r.period1Months, r.period1Days, 0, 0)}
                            className="text-[9px] px-1 py-0.2 rounded bg-stone-100 hover:bg-stone-200 text-stone-600"
                            title="० महिना सेट (वैशाख-असार काम नगरेको)"
                          >
                            ०
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="border border-stone-300 px-1.5 py-1 text-right font-mono font-bold text-amber-950 bg-amber-50/40">
                      {format(r.p2PeriodGross)}
                    </td>
                    <td className="border border-stone-300 px-1.5 py-1 text-right font-mono text-rose-800 bg-amber-50/30">
                      {format(r.p2PeriodKatti)}
                    </td>
                    <td className="border border-stone-300 px-1 py-1 text-right bg-amber-100/60">
                      <input
                        type="number"
                        min="0"
                        value={teacher.citKattiBaisakh !== undefined ? teacher.citKattiBaisakh : (teacher.citKatti || 0)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          onUpdateTeacher({
                            ...teacher,
                            citKattiBaisakh: val,
                            quarterlyDetails: {
                              ...(teacher.quarterlyDetails || {}),
                              fourth: {
                                ...((teacher.quarterlyDetails && teacher.quarterlyDetails.fourth) || {}),
                                citKatti: val
                              }
                            }
                          });
                        }}
                        className="w-16 text-right font-mono font-bold text-xs py-0.5 px-1 border border-amber-300 rounded bg-white text-amber-950 focus:ring-1 focus:ring-amber-500 shadow-2xs"
                        title="वैशाख-असारको सा. क. कोष / ना. ल. कोष कट्टी रकम (यहाँ फरक राख्न सक्नुहुन्छ)"
                      />
                    </td>

                    {/* Manual Dashain Input */}
                    <td className="border border-stone-300 px-1 py-1 text-right bg-purple-50/30">
                      <input
                        type="number"
                        value={r.dashainBhatta}
                        onChange={(e) => {
                          const val = Math.max(0, parseFloat(e.target.value) || 0);
                          onUpdateTeacher({
                            ...teacher,
                            dashainBhatta: val,
                          });
                        }}
                        className="w-20 text-right font-mono font-semibold text-xs py-1 px-1 border border-purple-200 rounded bg-white text-purple-950 focus:ring-1 focus:ring-purple-500 shadow-2xs"
                        title="दसैं भत्ता (म्यानुअल प्रविष्टि)"
                      />
                    </td>

                    {/* Manual Poshak Input */}
                    <td className="border border-stone-300 px-1 py-1 text-right bg-purple-50/30">
                      <input
                        type="number"
                        value={r.poshakBhatta}
                        onChange={(e) => {
                          const val = Math.max(0, parseFloat(e.target.value) || 0);
                          onUpdateTeacher({
                            ...teacher,
                            poshakBhatta: val,
                          });
                        }}
                        className="w-18 text-right font-mono font-semibold text-xs py-1 px-1 border border-purple-200 rounded bg-white text-purple-950 focus:ring-1 focus:ring-purple-500 shadow-2xs"
                        title="पोशाक भत्ता (म्यानुअल प्रविष्टि)"
                      />
                    </td>

                    {/* Annual Summary */}
                    <td className="border border-stone-300 px-2 py-1 text-right font-mono font-bold text-stone-900 bg-emerald-50/30">
                      {format(r.annualTotalGross)}
                    </td>
                    <td className="border border-stone-300 px-2 py-1 text-right font-mono text-rose-800 bg-rose-50/30">
                      {format(r.annualTotalKatti)}
                    </td>
                    <td className="border border-stone-300 px-2 py-1 text-right font-mono text-amber-900 bg-amber-50/30">
                      {format(r.annualTax1Percent)}
                    </td>
                    <td className="border border-stone-300 px-2 py-1 text-right font-mono font-black text-emerald-950 bg-emerald-100/80">
                      {format(r.annualNetPayable)}
                    </td>
                  </tr>
                );
              })}

              {/* Grand Total Row */}
              <tr className="bg-stone-200 text-stone-900 font-extrabold border-t-2 border-stone-400">
                <td colSpan={6} className="border border-stone-300 px-3 py-2 text-right">
                  कुल जम्मा (अवधि १ + अवधि २ + भत्ताहरू):
                </td>
                <td className="border border-stone-300 px-1 py-2 text-center text-blue-900 text-[10px]">
                  साउन-चैत
                </td>
                <td className="border border-stone-300 px-1.5 py-2 text-right font-mono text-blue-950 bg-blue-100">
                  {format(totalP1Gross)}
                </td>
                <td className="border border-stone-300 px-1.5 py-2 text-right font-mono text-rose-900">
                  {format(totalP1Katti)}
                </td>
                <td className="border border-stone-300 px-1.5 py-2 text-right font-mono text-stone-800 bg-blue-100/50">
                  {format(totalP1Cit)}
                </td>
                <td colSpan={2} className="border border-stone-300 px-1.5 py-2 text-right text-[11px] text-amber-950">
                  वैशाख-असार:
                </td>
                <td className="border border-stone-300 px-1 py-2 text-center text-amber-900 text-[10px]">
                  वैशाख-असार
                </td>
                <td className="border border-stone-300 px-1.5 py-2 text-right font-mono text-amber-950 bg-amber-100">
                  {format(totalP2Gross)}
                </td>
                <td className="border border-stone-300 px-1.5 py-2 text-right font-mono text-rose-900">
                  {format(totalP2Katti)}
                </td>
                <td className="border border-stone-300 px-1.5 py-2 text-right font-mono text-amber-950 bg-amber-100 font-bold">
                  {format(totalP2Cit)}
                </td>
                <td className="border border-stone-300 px-1.5 py-2 text-right font-mono text-purple-950 bg-purple-100">
                  {format(totalDashain)}
                </td>
                <td className="border border-stone-300 px-1.5 py-2 text-right font-mono text-purple-950 bg-purple-100">
                  {format(totalPoshak)}
                </td>
                <td className="border border-stone-300 px-2 py-2 text-right font-mono text-stone-950 bg-emerald-100">
                  {format(totalAnnualGross)}
                </td>
                <td className="border border-stone-300 px-2 py-2 text-right font-mono text-rose-950 bg-rose-100">
                  {format(totalAnnualKatti)}
                </td>
                <td className="border border-stone-300 px-2 py-2 text-right font-mono text-amber-950 bg-amber-100">
                  {format(totalAnnualTax)}
                </td>
                <td className="border border-stone-300 px-2 py-2 text-right font-mono text-emerald-950 font-black bg-emerald-200 text-sm">
                  {format(totalAnnualNet)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer info & Nepali Words */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-stone-700">वार्षिक खुद भुक्तानी अक्षरेपी: </span>
            <span className="font-semibold text-stone-900">{numberToWordsNepali(totalAnnualNet)} मात्र।</span>
          </div>
          <div className="text-stone-500 italic">
            * प्रत्येक शिक्षकले काम गरेको अवधि (महिना र दिन) अनुसारको यथार्थ हिसाब
          </div>
        </div>
      </div>
    </div>
  );
};
