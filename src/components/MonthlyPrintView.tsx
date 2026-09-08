import React from 'react';
import { Printer, X } from 'lucide-react';
import { TeacherRecord, SchoolInfo, NepaliMonth, SpecialAllowanceSettings } from '../types';
import { calculateAllTeachersForMonth, calculateMonthlyTotals, DEFAULT_ALLOWANCE_SETTINGS } from '../utils/monthlyCalculations';
import { formatNepaliCurrency, toNepaliNumber, numberToNepaliWords } from '../utils/nepaliNumber';

interface MonthlyPrintViewProps {
  isOpen: boolean;
  onClose: () => void;
  month: NepaliMonth;
  teachers: TeacherRecord[];
  schoolInfo: SchoolInfo;
  fiscalYear: string;
  useNepaliDigits: boolean;
  allowanceSettings?: SpecialAllowanceSettings;
}

export const MonthlyPrintView: React.FC<MonthlyPrintViewProps> = ({
  isOpen,
  onClose,
  month,
  teachers,
  schoolInfo,
  fiscalYear,
  useNepaliDigits,
  allowanceSettings = DEFAULT_ALLOWANCE_SETTINGS
}) => {
  if (!isOpen) return null;

  const records = calculateAllTeachersForMonth(teachers, month, allowanceSettings);
  const totals = calculateMonthlyTotals(records);

  const format = (val: number | undefined | null) =>
    formatNepaliCurrency(val, { nepaliDigits: useNepaliDigits });

  const num = (val: number | string | undefined | null) =>
    useNepaliDigits ? toNepaliNumber(val) : (val !== undefined && val !== null ? val.toString() : '0');

  const netInWords = numberToNepaliWords(totals.netPayable);

  const isDashain = month === allowanceSettings.dashainMonth;
  const isPoshak = month === allowanceSettings.poshakMonth;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-xs flex flex-col items-center p-2 sm:p-6 print:p-0 print:static print:bg-transparent">
      {/* Control bar */}
      <div className="w-full max-w-[1500px] mb-3 flex items-center justify-between bg-white px-4 py-2.5 rounded-lg shadow-md print:hidden border border-stone-200">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-stone-900">
            {month} महिनाको तलबी भर्पाई प्रिन्ट पूर्वावलोकन
          </span>
          {isDashain && (
            <span className="px-2 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded">
              दसैं भत्ता समावेश
            </span>
          )}
          {isPoshak && (
            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded">
              पोशाक भत्ता समावेश
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>अहिले प्रिन्ट गर्नुहोस् (Ctrl + P)</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Paper */}
      <div 
        className="w-full max-w-[1500px] bg-white p-6 sm:p-8 rounded-lg shadow-xl print:shadow-none print:p-0 print:max-w-none text-black"
        style={{ fontFamily: "'Noto Sans Devanagari', 'Mukta', sans-serif" }}
      >
        {/* Document Header */}
        <div className="text-center mb-4">
          <p className="text-xs text-stone-600 font-medium tracking-wider">
            {schoolInfo.municipality}, शिक्षा युवा तथा खेलकुद शाखा, {schoolInfo.district}
          </p>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5 text-stone-900">
            {schoolInfo.schoolName}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-stone-700">
            {schoolInfo.address}
          </p>
          <h2 className="text-sm sm:text-base font-bold text-stone-900 mt-1.5 border-y border-stone-400 py-1 inline-block px-8">
            आर्थिक वर्ष {fiscalYear} को {month} महिनाको तलबी भर्पाई
            {isDashain && ' (दसैं भत्ता सहित)'}
            {isPoshak && ' (पोशाक भत्ता सहित)'}
          </h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black text-[10px] leading-tight">
            <thead>
              <tr className="bg-stone-100 text-stone-900 border-b border-black">
                <th rowSpan={2} className="border border-black p-1 text-center font-bold">क्र.सं.</th>
                <th rowSpan={2} className="border border-black p-1 text-left font-bold min-w-[120px]">शिक्षकको नाम</th>
                <th rowSpan={2} className="border border-black p-1 text-left font-bold min-w-[85px]">पद / श्रेणी</th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold">तलब स्केल</th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold">ग्रेड रकम</th>
                <th colSpan={2} className="border border-black p-1 text-center font-bold">सरकारी थप</th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold">भत्ताहरू</th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold">नियमित तलब</th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold">
                  {isDashain ? 'दसैं भत्ता' : isPoshak ? 'पोशाक भत्ता' : 'विशेष भत्ता'}
                </th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold bg-stone-200">यस महिनाको जम्मा</th>
                <th colSpan={4} className="border border-black p-1 text-center font-bold">कट्टी रकम</th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold">१% कर</th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold bg-stone-200">खुद पाउने रकम</th>
                <th rowSpan={2} className="border border-black p-1 text-center font-bold min-w-[70px]">दस्तखत</th>
              </tr>
              <tr className="bg-stone-100 text-stone-900 border-b border-black text-[9px]">
                <th className="border border-black p-0.5 text-right font-semibold">क. कोष</th>
                <th className="border border-black p-0.5 text-right font-semibold">बिमा</th>
                <th className="border border-black p-0.5 text-right font-semibold">क. कोष</th>
                <th className="border border-black p-0.5 text-right font-semibold">बिमा</th>
                <th className="border border-black p-0.5 text-right font-semibold">सा.क. कोष</th>
                <th className="border border-black p-0.5 text-right font-semibold">जम्मा कट्टी</th>
              </tr>
            </thead>

            <tbody>
              {records.map((m) => (
                <tr key={m.teacherId} className="border-b border-black">
                  <td className="border border-black p-1 text-center">{num(m.sn)}</td>
                  <td className="border border-black p-1 font-semibold whitespace-nowrap">{m.name}</td>
                  <td className="border border-black p-1 whitespace-nowrap">{m.designation}</td>
                  <td className="border border-black p-1 text-right">{format(m.basicSalary)}</td>
                  <td className="border border-black p-1 text-right">{m.gradeAmount > 0 ? format(m.gradeAmount) : ''}</td>
                  <td className="border border-black p-1 text-right">{m.koshThap > 0 ? format(m.koshThap) : ''}</td>
                  <td className="border border-black p-1 text-right">{m.bimaThap > 0 ? format(m.bimaThap) : ''}</td>
                  <td className="border border-black p-1 text-right">
                    {format(m.praABhatta + m.mahangiBhatta + m.anyaBhatta)}
                  </td>
                  <td className="border border-black p-1 text-right font-semibold">{format(m.regularMonthlyGross)}</td>
                  <td className="border border-black p-1 text-right font-bold">
                    {m.dashainBhatta > 0 ? format(m.dashainBhatta) : m.poshakBhatta > 0 ? format(m.poshakBhatta) : '-'}
                  </td>
                  <td className="border border-black p-1 text-right font-extrabold bg-stone-100">{format(m.totalMonthlyGross)}</td>
                  <td className="border border-black p-0.5 text-right">{m.koshKatti > 0 ? format(m.koshKatti) : ''}</td>
                  <td className="border border-black p-0.5 text-right">{m.bimaKatti > 0 ? format(m.bimaKatti) : ''}</td>
                  <td className="border border-black p-0.5 text-right">{m.citKatti > 0 ? format(m.citKatti) : ''}</td>
                  <td className="border border-black p-1 text-right font-semibold">{format(m.totalMonthlyKatti)}</td>
                  <td className="border border-black p-1 text-right">{format(m.tax1Percent)}</td>
                  <td className="border border-black p-1 text-right font-extrabold bg-stone-100">{format(m.netPayable)}</td>
                  <td className="border border-black p-1 text-center text-stone-400">................</td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="border-t-2 border-black font-extrabold bg-stone-100">
                <td colSpan={3} className="border border-black p-1 text-center font-bold">
                  {month} महिनाको कुल जम्मा
                </td>
                <td className="border border-black p-1 text-right">{format(totals.basicSalary)}</td>
                <td className="border border-black p-1 text-right">{format(totals.gradeAmount)}</td>
                <td className="border border-black p-1 text-right">{format(totals.koshThap)}</td>
                <td className="border border-black p-1 text-right">{format(totals.bimaThap)}</td>
                <td className="border border-black p-1 text-right">
                  {format(totals.praABhatta + totals.mahangiBhatta + totals.anyaBhatta)}
                </td>
                <td className="border border-black p-1 text-right font-bold">{format(totals.regularMonthlyGross)}</td>
                <td className="border border-black p-1 text-right font-bold">
                  {isDashain ? format(totals.dashainBhatta) : isPoshak ? format(totals.poshakBhatta) : '-'}
                </td>
                <td className="border border-black p-1 text-right font-extrabold bg-stone-200">{format(totals.totalMonthlyGross)}</td>
                <td className="border border-black p-0.5 text-right">{format(totals.koshKatti)}</td>
                <td className="border border-black p-0.5 text-right">{format(totals.bimaKatti)}</td>
                <td className="border border-black p-0.5 text-right">{format(totals.citKatti)}</td>
                <td className="border border-black p-1 text-right font-bold">{format(totals.totalMonthlyKatti)}</td>
                <td className="border border-black p-1 text-right">{format(totals.tax1Percent)}</td>
                <td className="border border-black p-1 text-right font-extrabold bg-stone-200">{format(totals.netPayable)}</td>
                <td className="border border-black p-1 text-center">-</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* In Words & Certification Note */}
        <div className="mt-4 border border-black p-2.5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold">अक्षरूपी (खुद पाउने रकम): </span>
              <span className="font-medium italic">{netInWords}</span>
            </div>
            <div className="text-stone-700">
              कुल शिक्षक/कर्मचारी संख्या: <b>{num(teachers.length)} जना</b> | महिना: <b>{month} (आ.व. {fiscalYear})</b>
            </div>
          </div>
          <p className="text-[11px] text-stone-600 mt-1">
            प्रमाणित गरिन्छ कि माथि लेखिए बमोजिम {month} महिनाको तलबी भर्पाई विवरण अनुसार सम्पूर्ण शिक्षक तथा कर्मचारीहरूको नियमानुसारको कट्टी रकम कट्टा गरी खुद भुक्तानी रकम निकासा गर्न उपयुक्त छ।
          </p>
        </div>

        {/* 3 Signatures */}
        <div className="mt-10 grid grid-cols-3 gap-8 text-center text-xs">
          <div>
            <div className="border-b border-black pb-1 mb-1 font-semibold">
              {schoolInfo.accountantName || 'कृष्ण प्रसाद रिजाल'}
            </div>
            <p className="font-bold">तयार गर्ने (लेखापाल)</p>
            <p className="text-[10px] text-stone-500">मिति: ........................</p>
          </div>

          <div>
            <div className="border-b border-black pb-1 mb-1 font-semibold text-stone-400 italic">
              दस्तखत
            </div>
            <p className="font-bold">रुजु गर्ने (संयोजक / वि.व्य.स.)</p>
            <p className="text-[10px] text-stone-500">मिति: ........................</p>
          </div>

          <div>
            <div className="border-b border-black pb-1 mb-1 font-semibold">
              {schoolInfo.headmasterName || 'सन्तलाल सोरेन'}
            </div>
            <p className="font-bold">स्वीकृत गर्ने (प्रधानाध्यापक)</p>
            <p className="text-[10px] text-stone-500">कार्यालय छाप र मिति</p>
          </div>
        </div>
      </div>
    </div>
  );
};
