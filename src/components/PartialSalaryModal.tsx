import React, { useState } from 'react';
import { X, Calendar, Calculator, Printer, CheckCircle, Clock } from 'lucide-react';
import { TeacherRecord, SchoolInfo } from '../types';
import { calculatePartialSalary, PartialSalaryResult } from '../utils/calculations';
import { formatCurrency, toNepaliNumber, numberToWordsNepali } from '../utils/nepaliNumber';

interface PartialSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: TeacherRecord[];
  schoolInfo: SchoolInfo;
  fiscalYear: string;
  selectedTeacherId?: string;
  onApplyDurationToTeacher?: (teacherId: string, months: number, days: number) => void;
}

export const PartialSalaryModal: React.FC<PartialSalaryModalProps> = ({
  isOpen,
  onClose,
  teachers,
  schoolInfo,
  fiscalYear,
  selectedTeacherId,
  onApplyDurationToTeacher
}) => {
  const [activeTeacherId, setActiveTeacherId] = useState<string>(
    selectedTeacherId || (teachers[0] ? teachers[0].id : '')
  );
  const [months, setMonths] = useState<number>(1);
  const [days, setDays] = useState<number>(17); // default 1 month 17 days as requested!
  const [paymentRemarks, setPaymentRemarks] = useState<string>('१ महिना १७ दिनको तलब भुक्तानी');

  if (!isOpen) return null;

  const currentTeacher = teachers.find((t) => t.id === activeTeacherId) || teachers[0];
  if (!currentTeacher) return null;

  const calc: PartialSalaryResult = calculatePartialSalary(currentTeacher, months, days);

  const handlePrint = () => {
    window.print();
  };

  const handleApply = () => {
    if (onApplyDurationToTeacher) {
      onApplyDurationToTeacher(currentTeacher.id, months, days);
      alert(`${currentTeacher.name} को लागि ${toNepaliNumber(months)} महिना ${toNepaliNumber(days)} दिनको अवधि भर्पाईमा लागू भयो!`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-stone-300">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                महिना तथा दिन अनुसार तलब क्याल्कुलेटर र भुक्तानी भौचर
              </h2>
              <p className="text-xs text-stone-500">
                आंशिक अवधि (उदा. १ महिना १७ दिन) को नियमसङ्गत तलब तथा कट्टी हिसाब
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Controls: Select Teacher & Duration Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-200">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                शिक्षक / कर्मचारी छनौट गर्नुहोस्
              </label>
              <select
                value={activeTeacherId}
                onChange={(e) => setActiveTeacherId(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 border border-stone-300 rounded-lg bg-white shadow-2xs focus:ring-2 focus:ring-blue-500"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {toNepaliNumber(t.sn)}. {t.name} ({t.designation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                महिना (Months)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={months}
                  onChange={(e) => setMonths(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-sm font-bold text-center px-3 py-2 border border-stone-300 rounded-lg bg-white shadow-2xs focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-stone-600 whitespace-nowrap">महिना</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                दिन (Days - ३० दिनको महिना)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="29"
                  value={days}
                  onChange={(e) => setDays(Math.max(0, Math.min(29, parseInt(e.target.value) || 0)))}
                  className="w-full text-sm font-bold text-center px-3 py-2 border border-stone-300 rounded-lg bg-white shadow-2xs focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-stone-600 whitespace-nowrap">दिन</span>
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>प्रचलित अवधि:</span>
            </span>
            {[
              { label: '१ महिना १७ दिन', m: 1, d: 17 },
              { label: '१ महिना ० दिन', m: 1, d: 0 },
              { label: '० महिना १७ दिन (१७ दिन मात्र)', m: 0, d: 17 },
              { label: '१५ दिन (आधा महिना)', m: 0, d: 15 },
              { label: '२ महिना ५ दिन', m: 2, d: 5 },
              { label: '२२ दिन', m: 0, d: 22 },
              { label: '३ महिना (त्रैमासिक)', m: 3, d: 0 },
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setMonths(p.m);
                  setDays(p.d);
                  setPaymentRemarks(`${p.label}को तलब भुक्तानी`);
                }}
                className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                  months === p.m && days === p.d
                    ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-2xs'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100 font-medium'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Highlight Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
              <span className="text-[11px] text-stone-500 font-medium block">१ महिनाको तलब दर</span>
              <span className="text-base font-bold text-stone-900 font-mono">
                {formatCurrency(calc.monthlyGross)}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">मासिक तलब + भत्ता</span>
            </div>

            <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200">
              <span className="text-[11px] text-blue-700 font-bold block">१ दिनको तलब दर</span>
              <span className="text-base font-bold text-blue-950 font-mono">
                {formatCurrency(calc.dailyGross)}
              </span>
              <span className="text-[10px] text-blue-600 block mt-0.5">मासिक दर / ३० दिन</span>
            </div>

            <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200">
              <span className="text-[11px] text-amber-800 font-bold block">
                {toNepaliNumber(months)} महिना {toNepaliNumber(days)} दिनको जम्मा
              </span>
              <span className="text-base font-black text-amber-950 font-mono">
                {formatCurrency(calc.periodGross)}
              </span>
              <span className="text-[10px] text-amber-700 block mt-0.5">
                कट्टी: {formatCurrency(calc.periodKatti)}
              </span>
            </div>

            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-300">
              <span className="text-[11px] text-emerald-800 font-extrabold block">खुद भुक्तानी रकम</span>
              <span className="text-lg font-black text-emerald-950 font-mono">
                {formatCurrency(calc.periodNet)}
              </span>
              <span className="text-[10px] text-emerald-700 block mt-0.5">१% कर कट्टी पछिको</span>
            </div>
          </div>

          {/* Printable Voucher Section */}
          <div className="border border-stone-300 rounded-xl p-5 bg-white shadow-2xs" id="partial-salary-voucher">
            {/* Voucher Header */}
            <div className="text-center pb-4 border-b border-stone-300">
              <h3 className="text-sm font-bold text-stone-600">{schoolInfo.municipality}</h3>
              <h2 className="text-lg font-extrabold text-stone-900">{schoolInfo.schoolName}</h2>
              <p className="text-xs text-stone-600">{schoolInfo.address}</p>
              <div className="inline-block mt-2 px-3 py-1 bg-amber-100 text-amber-900 text-xs font-black rounded-md border border-amber-300">
                आंशिक तलब भुक्तानी आदेश तथा हिसाब भौचर
              </div>
              <p className="text-xs font-medium text-stone-500 mt-1">
                आर्थिक वर्ष: {fiscalYear} | भुक्तानी अवधि: {toNepaliNumber(months)} महिना {toNepaliNumber(days)} दिन ({calc.totalDaysEquivalent} दिन)
              </p>
            </div>

            {/* Teacher Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 border-b border-stone-200 text-xs">
              <div>
                <span className="text-stone-500">कर्मचारी / शिक्षक:</span>
                <p className="font-bold text-stone-900">{currentTeacher.name}</p>
              </div>
              <div>
                <span className="text-stone-500">पद / श्रेणी:</span>
                <p className="font-bold text-stone-900">{currentTeacher.designation}</p>
              </div>
              <div>
                <span className="text-stone-500">प्रकार:</span>
                <p className="font-bold text-stone-900">
                  {currentTeacher.category === 'permanent' ? 'स्थायी' : 'राहत / करार / अन्य'}
                </p>
              </div>
              <div>
                <span className="text-stone-500">ग्रेड संख्या:</span>
                <p className="font-bold text-stone-900 font-mono">
                  {toNepaliNumber(currentTeacher.gradeCount)} वटा (दर: रु. {currentTeacher.gradeRate})
                </p>
              </div>
            </div>

            {/* Detailed Itemized Calculation Table */}
            <div className="py-4">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                विस्तृत हिसाब विवरण (Itemized Salary & Deductions)
              </h4>
              <table className="w-full text-xs border border-stone-300">
                <thead>
                  <tr className="bg-stone-100 text-stone-800 border-b border-stone-300">
                    <th className="border border-stone-300 px-3 py-1.5 text-left font-bold">शीर्षक</th>
                    <th className="border border-stone-300 px-3 py-1.5 text-right font-bold">१ महिनाको दर</th>
                    <th className="border border-stone-300 px-3 py-1.5 text-right font-bold">१ दिनको दर (दर/३०)</th>
                    <th className="border border-stone-300 px-3 py-1.5 text-right font-bold">
                      {toNepaliNumber(months)} महिनाको रकम
                    </th>
                    <th className="border border-stone-300 px-3 py-1.5 text-right font-bold">
                      {toNepaliNumber(days)} दिनको रकम
                    </th>
                    <th className="border border-stone-300 px-3 py-1.5 text-right font-bold bg-amber-50">
                      कुल जम्मा
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-stone-300 px-3 py-1.5 font-medium">१. सुरु तलब स्केल (Basic)</td>
                    <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.basicSalary)}</td>
                    <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.dailyBasic)}</td>
                    <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.basicSalary * months)}</td>
                    <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.dailyBasic * days)}</td>
                    <td className="border border-stone-300 px-3 py-1.5 text-right font-mono font-bold bg-amber-50/50">
                      {formatCurrency(calc.basicSalary * months + calc.dailyBasic * days)}
                    </td>
                  </tr>

                  {calc.gradeAmount > 0 && (
                    <tr>
                      <td className="border border-stone-300 px-3 py-1.5 font-medium">२. ग्रेड रकम ({toNepaliNumber(currentTeacher.gradeCount)} ग्रेड)</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.gradeAmount)}</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.dailyGrade)}</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.gradeAmount * months)}</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.dailyGrade * days)}</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono font-bold bg-amber-50/50">
                        {formatCurrency(calc.gradeAmount * months + calc.dailyGrade * days)}
                      </td>
                    </tr>
                  )}

                  {calc.koshThap > 0 && (
                    <tr>
                      <td className="border border-stone-300 px-3 py-1.5 font-medium">३. क. कोष थप (१०% सरकारी)</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.koshThap)}</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.dailyKoshThap)}</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.koshThap * months)}</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.dailyKoshThap * days)}</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono font-bold bg-amber-50/50">
                        {formatCurrency(calc.koshThap * months + calc.dailyKoshThap * days)}
                      </td>
                    </tr>
                  )}

                  {calc.bimaThap > 0 && (
                    <tr>
                      <td className="border border-stone-300 px-3 py-1.5 font-medium">४. बिमा थप (रू ४००)</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.bimaThap)}</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.dailyBimaThap)}</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.bimaThap * months)}</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.dailyBimaThap * days)}</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono font-bold bg-amber-50/50">
                        {formatCurrency(calc.bimaThap * months + calc.dailyBimaThap * days)}
                      </td>
                    </tr>
                  )}

                  {calc.allowancesTotal > 0 && (
                    <tr>
                      <td className="border border-stone-300 px-3 py-1.5 font-medium">५. भत्ताहरू (महँगी, प्र.अ., अन्य)</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.allowancesTotal)}</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.dailyAllowances)}</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.allowancesTotal * months)}</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono">{formatCurrency(calc.dailyAllowances * days)}</td>
                      <td className="border border-stone-300 px-3 py-1.5 text-right font-mono font-bold bg-amber-50/50">
                        {formatCurrency(calc.allowancesTotal * months + calc.dailyAllowances * days)}
                      </td>
                    </tr>
                  )}

                  <tr className="bg-stone-100 font-bold border-t-2 border-stone-400">
                    <td className="border border-stone-300 px-3 py-2 text-stone-900">कुल तलब जम्मा (Gross Total)</td>
                    <td className="border border-stone-300 px-3 py-2 text-right font-mono">{formatCurrency(calc.monthlyGross)}</td>
                    <td className="border border-stone-300 px-3 py-2 text-right font-mono">{formatCurrency(calc.dailyGross)}</td>
                    <td className="border border-stone-300 px-3 py-2 text-right font-mono">{formatCurrency(calc.monthsGross)}</td>
                    <td className="border border-stone-300 px-3 py-2 text-right font-mono">{formatCurrency(calc.daysGross)}</td>
                    <td className="border border-stone-300 px-3 py-2 text-right font-mono text-indigo-950 font-black bg-amber-100">
                      {formatCurrency(calc.periodGross)}
                    </td>
                  </tr>

                  {/* Deductions breakdown */}
                  <tr className="bg-rose-50/40 text-rose-900 font-semibold">
                    <td className="border border-stone-300 px-3 py-2">
                      कट्टी रकम (क. कोष २०%, बिमा, ना.ल.क.)
                    </td>
                    <td className="border border-stone-300 px-3 py-2 text-right font-mono">{formatCurrency(calc.monthlyKatti)}</td>
                    <td className="border border-stone-300 px-3 py-2 text-right font-mono">{formatCurrency(calc.dailyKatti)}</td>
                    <td className="border border-stone-300 px-3 py-2 text-right font-mono">{formatCurrency(calc.monthsKatti)}</td>
                    <td className="border border-stone-300 px-3 py-2 text-right font-mono">{formatCurrency(calc.daysKatti)}</td>
                    <td className="border border-stone-300 px-3 py-2 text-right font-mono font-bold text-rose-950 bg-rose-100">
                      - {formatCurrency(calc.periodKatti)}
                    </td>
                  </tr>

                  {/* 1% Tax */}
                  <tr className="bg-amber-50/50">
                    <td colSpan={5} className="border border-stone-300 px-3 py-1.5 text-right font-bold text-stone-800">
                      १% सामाजिक सुरक्षा कर (Taxable: {formatCurrency(calc.periodPayableGross)} को १%)
                    </td>
                    <td className="border border-stone-300 px-3 py-1.5 text-right font-mono font-bold text-amber-950 bg-amber-100">
                      - {formatCurrency(calc.tax1Percent)}
                    </td>
                  </tr>

                  {/* Net Payable Final Row */}
                  <tr className="bg-emerald-100 text-emerald-950 font-black text-sm border-t-2 border-emerald-500">
                    <td colSpan={5} className="border border-stone-300 px-3 py-2 text-right">
                      {toNepaliNumber(months)} महिना {toNepaliNumber(days)} दिनको खुद भुक्तानी रकम (Net Payable):
                    </td>
                    <td className="border border-stone-300 px-3 py-2 text-right font-mono text-base">
                      {formatCurrency(calc.periodNet)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* In Words */}
              <div className="mt-2 p-2.5 bg-stone-50 border border-stone-200 rounded text-xs">
                <span className="font-bold text-stone-700">अक्षरेपी: </span>
                <span className="font-semibold text-stone-900">{numberToWordsNepali(calc.periodNet)} मात्र।</span>
              </div>
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs">
              <div>
                <div className="border-t border-stone-400 pt-1 font-bold">तयार गर्ने (लेखापाल)</div>
                <div className="text-stone-600 font-medium">{schoolInfo.accountantName}</div>
              </div>
              <div>
                <div className="border-t border-stone-400 pt-1 font-bold">रुजु गर्ने / पेश गर्ने</div>
                <div className="text-stone-600 font-medium">विद्यालय प्रशासन</div>
              </div>
              <div>
                <div className="border-t border-stone-400 pt-1 font-bold">सदर गर्ने (प्रधानाध्यापक)</div>
                <div className="text-stone-600 font-medium">{schoolInfo.headmasterName}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50 rounded-b-xl">
          <div className="text-xs text-stone-500 flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>नेपाल सरकारको ३० दिन प्रति महिना तलब भुक्तानी नियम अनुसार</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 shadow-2xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>भौचर प्रिन्ट गर्नुहोस्</span>
            </button>

            {onApplyDurationToTeacher && (
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
              >
                <span>भर्पाईमा यो अवधि लागू गर्नुहोस्</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              बन्द गर्नुहोस्
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
