import React, { useState } from 'react';
import { Printer, RefreshCw, Save, CheckCircle, Info, Sparkles, ArrowRight, UserCheck } from 'lucide-react';
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
  onUpdateFiscalYear,
  onClose,
}) => {
  const teachers = propTeachers || currentFiscalYear?.teachers || [];
  const fiscalYear = propFiscalYear || currentFiscalYear?.fiscalYear || '२०८२/८३';
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  const format = (val: number | undefined | null) =>
    formatCurrency(val, { nepaliDigits: useNepaliDigits });

  const num = (val: number | string | undefined | null) =>
    useNepaliDigits ? toNepaliNumber(val) : (val !== undefined && val !== null ? val.toString() : '0');

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

  // Compute 9/3 split calculations for all teachers
  const calculatedRows: GradeSplitTeacherResult[] = teachers.map((t) =>
    calculateGradeSplit9_3(t, 9, 3)
  );

  // Totals
  const totalAnnualGross = calculatedRows.reduce((acc, r) => acc + r.annualTotalGross, 0);
  const totalAnnualKatti = calculatedRows.reduce((acc, r) => acc + r.annualTotalKatti, 0);
  const totalAnnualTax = calculatedRows.reduce((acc, r) => acc + r.annualTax1Percent, 0);
  const totalAnnualNet = calculatedRows.reduce((acc, r) => acc + r.annualNetPayable, 0);
  const totalDashain = calculatedRows.reduce((acc, r) => acc + r.dashainBhatta, 0);
  const totalPoshak = calculatedRows.reduce((acc, r) => acc + r.poshakBhatta, 0);
  const totalP1Gross = calculatedRows.reduce((acc, r) => acc + r.p1PeriodGross, 0);
  const totalP2Gross = calculatedRows.reduce((acc, r) => acc + r.p2PeriodGross, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Explainer */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
              <Sparkles className="w-3.5 h-3.5" />
              <span>नेपाल सरकारको नियम: साउन १ देखि असार मसान्त आर्थिक वर्ष</span>
            </div>
            <h2 className="text-lg font-extrabold text-stone-900">
              ९ महिना (साउन-चैत) र ३ महिना (वैशाख-असार नयाँ ग्रेड) वार्षिक तलब भर्पाई
            </h2>
            <p className="text-xs text-stone-600 max-w-3xl">
              वैशाख १ गतेदेखि शिक्षकहरूको ग्रेड वृद्धि (१ ग्रेड थप) हुने व्यवस्था अनुसार साउनदेखि चैतसम्म ९ महिनाको पुरानो ग्रेड र वैशाखदेखि असारसम्म ३ महिनाको नयाँ ग्रेड कायम गरी दसैं तथा पोशाक भत्ता सहितको एकीकृत वार्षिक हिसाब।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg shadow-2xs transition-colors"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              <span>वार्षिक भर्पाई प्रिन्ट</span>
            </button>
          </div>
        </div>

        {/* Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-stone-200">
          <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
            <span className="text-[11px] text-stone-500 font-medium block">९ महिनाको तलब (साउन-चैत)</span>
            <span className="text-xs font-bold text-stone-800 font-mono">
              {format(totalP1Gross)}
            </span>
          </div>

          <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200">
            <span className="text-[11px] text-amber-800 font-bold block">३ महिनाको तलब (वैशाख-असार)</span>
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

      {/* Main 9/3 Split Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        {/* Table Header Details */}
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-stone-700">
              {schoolInfo.schoolName} | आ.व. {fiscalYear} वार्षिक तलबी भर्पाई
            </span>
            <p className="text-[11px] text-stone-500">
              * तलका कोठाहरूमा वैशाखको नयाँ ग्रेड, दसैं भत्ता र पोशाक भत्ता सिधै टाइप गरी फेरबदल गर्न सक्नुहुन्छ
            </p>
          </div>
          <div className="text-xs font-semibold text-stone-600">
            कुल शिक्षक संख्या: <span className="font-bold text-stone-900">{num(teachers.length)}</span>
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
                <th colSpan={4} className="border border-stone-300 px-2 py-2 bg-blue-100 text-blue-950">
                  अवधि १: साउनदेखि चैतसम्म (९ महिना)
                </th>
                <th colSpan={4} className="border border-stone-300 px-2 py-2 bg-amber-100 text-amber-950">
                  अवधि २: वैशाखदेखि असारसम्म (३ महिना नयाँ ग्रेड)
                </th>
                <th colSpan={2} className="border border-stone-300 px-2 py-2 bg-purple-100 text-purple-950">
                  चाडपर्व तथा पोशाक (म्यानुअल)
                </th>
                <th colSpan={4} className="border border-stone-300 px-2 py-2 bg-emerald-100 text-emerald-950">
                  वार्षिक कुल जम्मा (१२ महिना)
                </th>
              </tr>

              {/* Level 2 Column Headers */}
              <tr className="bg-stone-50 text-stone-700 border-b border-stone-300 text-[11px]">
                <th className="border border-stone-300 px-2 py-1.5 w-10 text-center">क्र.सं.</th>
                <th className="border border-stone-300 px-2 py-1.5 text-left min-w-[140px]">शिक्षकको नाम</th>
                <th className="border border-stone-300 px-2 py-1.5 text-left min-w-[90px]">पद / श्रेणी</th>
                <th className="border border-stone-300 px-2 py-1.5 text-right min-w-[80px]">सुरु तलब</th>

                {/* 9 Months (Shrawan-Chaitra) */}
                <th className="border border-stone-300 px-1.5 py-1.5 text-center bg-blue-50/50 w-14">ग्रेड</th>
                <th className="border border-stone-300 px-1.5 py-1.5 text-right bg-blue-50/50 min-w-[75px]">मासिक जम्मा</th>
                <th className="border border-stone-300 px-1.5 py-1.5 text-right bg-blue-50/50 min-w-[85px] font-bold text-blue-900">९ महिना तलब</th>
                <th className="border border-stone-300 px-1.5 py-1.5 text-right bg-blue-50/50 min-w-[75px] text-rose-800">९ महिना कट्टी</th>

                {/* 3 Months (Baisakh-Ashad) */}
                <th className="border border-stone-300 px-1.5 py-1.5 text-center bg-amber-50/70 w-20 font-bold text-amber-900">
                  वैशाख ग्रेड ✏️
                </th>
                <th className="border border-stone-300 px-1.5 py-1.5 text-right bg-amber-50/70 min-w-[75px]">मासिक जम्मा</th>
                <th className="border border-stone-300 px-1.5 py-1.5 text-right bg-amber-50/70 min-w-[85px] font-bold text-amber-900">३ महिना तलब</th>
                <th className="border border-stone-300 px-1.5 py-1.5 text-right bg-amber-50/70 min-w-[75px] text-rose-800">३ महिना कट्टी</th>

                {/* Manual Allowances */}
                <th className="border border-stone-300 px-1.5 py-1.5 text-right bg-purple-50/50 min-w-[85px] font-bold text-purple-900">
                  दसैं भत्ता ✏️
                </th>
                <th className="border border-stone-300 px-1.5 py-1.5 text-right bg-purple-50/50 min-w-[80px] font-bold text-purple-900">
                  पोशाक भत्ता ✏️
                </th>

                {/* Annual Totals */}
                <th className="border border-stone-300 px-2 py-1.5 text-right bg-emerald-50/40 min-w-[90px] font-bold">वार्षिक तलब</th>
                <th className="border border-stone-300 px-2 py-1.5 text-right bg-rose-50/40 min-w-[80px] text-rose-900">वार्षिक कट्टी</th>
                <th className="border border-stone-300 px-2 py-1.5 text-right bg-amber-50/40 min-w-[70px]">१% कर</th>
                <th className="border border-stone-300 px-2 py-1.5 text-right bg-emerald-100 min-w-[95px] font-extrabold text-emerald-950">
                  खुद पाउने
                </th>
              </tr>
            </thead>

            <tbody>
              {calculatedRows.map((r, idx) => {
                const teacher = r.teacher;
                const isPermanent = teacher.category === 'permanent';

                return (
                  <tr
                    key={`split-${teacher.id}-${idx}`}
                    className={`hover:bg-stone-50/80 transition-colors ${
                      idx % 2 === 1 ? 'bg-stone-50/30' : 'bg-white'
                    }`}
                  >
                    <td className="border border-stone-300 px-2 py-1.5 text-center text-stone-500 font-mono">
                      {num(idx + 1)}
                    </td>
                    <td className="border border-stone-300 px-2 py-1.5 font-bold text-stone-900 whitespace-nowrap">
                      {teacher.name}
                      {isPermanent && (
                        <span className="ml-1.5 text-[9px] px-1 py-0.2 bg-blue-100 text-blue-800 rounded font-normal">
                          स्थायी
                        </span>
                      )}
                    </td>
                    <td className="border border-stone-300 px-2 py-1.5 text-stone-700 whitespace-nowrap text-[11px]">
                      {teacher.designation}
                    </td>
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-mono text-stone-800">
                      {format(teacher.basicSalary)}
                    </td>

                    {/* Period 1 (9 Months) */}
                    <td className="border border-stone-300 px-1.5 py-1.5 text-center font-mono bg-blue-50/20">
                      {num(r.p1GradeCount)}
                    </td>
                    <td className="border border-stone-300 px-1.5 py-1.5 text-right font-mono bg-blue-50/20">
                      {format(r.p1MonthlyGross)}
                    </td>
                    <td className="border border-stone-300 px-1.5 py-1.5 text-right font-mono font-bold text-blue-950 bg-blue-50/30">
                      {format(r.p1PeriodGross)}
                    </td>
                    <td className="border border-stone-300 px-1.5 py-1.5 text-right font-mono text-rose-800 bg-blue-50/20">
                      {format(r.p1PeriodKatti)}
                    </td>

                    {/* Period 2 (3 Months) - Editable Grade Input */}
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
                        className="w-14 text-center font-mono font-bold text-xs py-1 border border-amber-300 rounded bg-white text-amber-950 focus:ring-1 focus:ring-amber-500 shadow-2xs"
                        title="वैशाख १ देखिको नयाँ ग्रेड संख्या"
                      />
                    </td>
                    <td className="border border-stone-300 px-1.5 py-1.5 text-right font-mono bg-amber-50/30">
                      {format(r.p2MonthlyGross)}
                    </td>
                    <td className="border border-stone-300 px-1.5 py-1.5 text-right font-mono font-bold text-amber-950 bg-amber-50/40">
                      {format(r.p2PeriodGross)}
                    </td>
                    <td className="border border-stone-300 px-1.5 py-1.5 text-right font-mono text-rose-800 bg-amber-50/30">
                      {format(r.p2PeriodKatti)}
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
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-mono font-bold text-stone-900 bg-emerald-50/30">
                      {format(r.annualTotalGross)}
                    </td>
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-mono text-rose-800 bg-rose-50/30">
                      {format(r.annualTotalKatti)}
                    </td>
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-mono text-amber-900 bg-amber-50/30">
                      {format(r.annualTax1Percent)}
                    </td>
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-mono font-black text-emerald-950 bg-emerald-100/80">
                      {format(r.annualNetPayable)}
                    </td>
                  </tr>
                );
              })}

              {/* Grand Total Row */}
              <tr className="bg-stone-200 text-stone-900 font-extrabold border-t-2 border-stone-400">
                <td colSpan={6} className="border border-stone-300 px-3 py-2 text-right">
                  कुल जम्मा (९ महिना + ३ महिना + भत्ताहरू):
                </td>
                <td className="border border-stone-300 px-1.5 py-2 text-right font-mono text-blue-950 bg-blue-100">
                  {format(totalP1Gross)}
                </td>
                <td className="border border-stone-300 px-1.5 py-2 text-right font-mono text-rose-900">
                  {format(calculatedRows.reduce((a, b) => a + b.p1PeriodKatti, 0))}
                </td>
                <td colSpan={2} className="border border-stone-300 px-1.5 py-2 text-right">
                  ३ महिना जम्मा:
                </td>
                <td className="border border-stone-300 px-1.5 py-2 text-right font-mono text-amber-950 bg-amber-100">
                  {format(totalP2Gross)}
                </td>
                <td className="border border-stone-300 px-1.5 py-2 text-right font-mono text-rose-900">
                  {format(calculatedRows.reduce((a, b) => a + b.p2PeriodKatti, 0))}
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

        {/* Footer info & Words */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-stone-700">वार्षिक खुद भुक्तानी अक्षरेपी: </span>
            <span className="font-semibold text-stone-900">{numberToWordsNepali(totalAnnualNet)} मात्र।</span>
          </div>
          <div className="text-stone-500 italic">
            * साउन-चैत (९ महिना) र वैशाख-असार (३ महिना नयाँ ग्रेड)
          </div>
        </div>
      </div>
    </div>
  );
};
