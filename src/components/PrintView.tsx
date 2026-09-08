import React from 'react';
import { Printer, X } from 'lucide-react';
import { FiscalYearPayroll, SchoolInfo, TeacherRecord } from '../types';
import { formatNepaliCurrency, toNepaliNumber, numberToNepaliWords } from '../utils/nepaliNumber';
import { calculateGrandTotals } from '../utils/calculations';

interface PrintViewProps {
  isOpen: boolean;
  onClose: () => void;
  currentYear: FiscalYearPayroll;
  schoolInfo: SchoolInfo;
  useNepaliDigits: boolean;
}

export const PrintView: React.FC<PrintViewProps> = ({
  isOpen,
  onClose,
  currentYear,
  schoolInfo,
  useNepaliDigits
}) => {
  if (!isOpen) return null;

  const { teachers, periodTitle, monthsCount } = currentYear;
  const totals = calculateGrandTotals(teachers);

  const format = (val: number | undefined | null) =>
    formatNepaliCurrency(val, { nepaliDigits: useNepaliDigits });

  const num = (val: number | string | undefined | null) =>
    useNepaliDigits ? toNepaliNumber(val) : (val !== undefined && val !== null ? val.toString() : '0');

  const netInWords = numberToNepaliWords(totals.periodNet);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-xs flex flex-col items-center p-2 sm:p-6 print:p-0 print:static print:bg-transparent">
      {/* Top Floating Control Bar (Hidden when printing) */}
      <div className="w-full max-w-[1500px] mb-3 flex items-center justify-between bg-white px-4 py-2.5 rounded-lg shadow-md print:hidden border border-stone-200">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-stone-900">
            प्रिन्ट पूर्वावलोकन (A4 / Legal Landscape)
          </span>
          <span className="text-xs text-stone-500">
            (प्रिन्ट गर्दा 'Landscape' रोज्नुहोला)
          </span>
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

      {/* Printable Sheet Container */}
      <div 
        id="printable-sheet" 
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
          <h2 className="text-sm sm:text-base font-bold text-stone-900 mt-1.5 border-y border-stone-300 py-1 inline-block px-8">
            {periodTitle}
          </h2>
        </div>

        {/* The Exact Register Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black text-[9.5px] leading-tight">
            <thead>
              <tr className="bg-stone-100 text-stone-900 border-b border-black">
                <th rowSpan={2} className="border border-black p-1 text-center font-bold min-w-[28px]">
                  क्र. सं.
                </th>
                <th rowSpan={2} className="border border-black p-1 text-left font-bold min-w-[120px]">
                  शिक्षकको नाम
                </th>
                <th rowSpan={2} className="border border-black p-1 text-left font-bold min-w-[80px]">
                  पद / श्रेणी
                </th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold min-w-[65px]">
                  तलब स्केल
                </th>
                <th colSpan={3} className="border border-black p-1 text-center font-bold">
                  ग्रेड
                </th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold min-w-[60px]">
                  क. कोष थप
                </th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold min-w-[45px]">
                  बिमा थप
                </th>
                <th colSpan={3} className="border border-black p-1 text-center font-bold">
                  भत्ता
                </th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold min-w-[70px]">
                  एक महिनाको जम्मा
                </th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold min-w-[65px]">
                  दसैं भत्ता (साउन)
                </th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold min-w-[65px]">
                  पोशाक भत्ता (चैत)
                </th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold min-w-[75px]">
                  त्रैमासिक जम्मा
                </th>
                <th colSpan={5} className="border border-black p-1 text-center font-bold">
                  कट्टी रकम
                </th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold min-w-[70px]">
                  त्रैमासिक पाउने रकम
                </th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold min-w-[55px]">
                  त्रैमासिक १% कर
                </th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold min-w-[70px]">
                  एक महिनाको खुद पाउने
                </th>
                <th rowSpan={2} className="border border-black p-1 text-right font-bold min-w-[75px]">
                  त्रैमासिक खुद पाउने रकम
                </th>
                <th rowSpan={2} className="border border-black p-1 text-center font-bold min-w-[75px]">
                  रकम बुझिलिनेको दस्तखत
                </th>
              </tr>

              <tr className="bg-stone-100 text-stone-900 border-b border-black text-[9px]">
                <th className="border border-black p-0.5 text-center font-semibold">संख्या</th>
                <th className="border border-black p-0.5 text-right font-semibold">दर</th>
                <th className="border border-black p-0.5 text-right font-semibold">रकम</th>
                <th className="border border-black p-0.5 text-right font-semibold">प्र.अ.</th>
                <th className="border border-black p-0.5 text-right font-semibold">महँगी</th>
                <th className="border border-black p-0.5 text-right font-semibold">अन्य</th>
                <th className="border border-black p-0.5 text-right font-semibold">क. कोष</th>
                <th className="border border-black p-0.5 text-right font-semibold">बिमा</th>
                <th className="border border-black p-0.5 text-right font-semibold">सा.क. कोष</th>
                <th className="border border-black p-0.5 text-right font-semibold">१ महिनाको</th>
                <th className="border border-black p-0.5 text-right font-semibold">त्रैमासिक</th>
              </tr>
            </thead>

            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="border-b border-black">
                  <td className="border border-black p-1 text-center">{num(t.sn)}</td>
                  <td className="border border-black p-1 font-semibold whitespace-nowrap">{t.name}</td>
                  <td className="border border-black p-1 whitespace-nowrap">{t.designation}</td>
                  <td className="border border-black p-1 text-right">{format(t.basicSalary)}</td>
                  <td className="border border-black p-0.5 text-center">{t.gradeCount > 0 ? num(t.gradeCount) : ''}</td>
                  <td className="border border-black p-0.5 text-right">{t.gradeRate > 0 ? format(t.gradeRate) : ''}</td>
                  <td className="border border-black p-0.5 text-right">{t.gradeAmount > 0 ? format(t.gradeAmount) : ''}</td>
                  <td className="border border-black p-1 text-right">{t.koshThap > 0 ? format(t.koshThap) : ''}</td>
                  <td className="border border-black p-1 text-right">{t.bimaThap > 0 ? format(t.bimaThap) : ''}</td>
                  <td className="border border-black p-0.5 text-right">{t.praABhatta > 0 ? format(t.praABhatta) : ''}</td>
                  <td className="border border-black p-0.5 text-right">{t.mahangiBhatta > 0 ? format(t.mahangiBhatta) : ''}</td>
                  <td className="border border-black p-0.5 text-right">{t.anyaBhatta > 0 ? format(t.anyaBhatta) : ''}</td>
                  <td className="border border-black p-1 text-right font-semibold">{format(t.monthlyGross)}</td>
                  <td className="border border-black p-1 text-right">{t.dashainBhatta && t.dashainBhatta > 0 ? format(t.dashainBhatta) : ''}</td>
                  <td className="border border-black p-1 text-right">{t.poshakBhatta && t.poshakBhatta > 0 ? format(t.poshakBhatta) : ''}</td>
                  <td className="border border-black p-1 text-right font-bold">{format(t.periodGross)}</td>
                  <td className="border border-black p-0.5 text-right">{t.koshKatti > 0 ? format(t.koshKatti) : ''}</td>
                  <td className="border border-black p-0.5 text-right">{t.bimaKatti > 0 ? format(t.bimaKatti) : ''}</td>
                  <td className="border border-black p-0.5 text-right">{t.citKatti > 0 ? format(t.citKatti) : ''}</td>
                  <td className="border border-black p-0.5 text-right">{format(t.monthlyKatti)}</td>
                  <td className="border border-black p-0.5 text-right font-semibold">{format(t.periodKatti)}</td>
                  <td className="border border-black p-1 text-right font-semibold">{format(t.periodPayableGross)}</td>
                  <td className="border border-black p-1 text-right">{format(t.tax1Percent)}</td>
                  <td className="border border-black p-1 text-right font-semibold">{format(t.monthlyNet)}</td>
                  <td className="border border-black p-1 text-right font-bold">{format(t.periodNet)}</td>
                  <td className="border border-black p-1 text-center text-stone-400">
                    {t.signature ? 'प्राप्त' : '................'}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="border-t-2 border-black font-extrabold bg-stone-100">
                <td colSpan={3} className="border border-black p-1 text-center font-bold">
                  अन्तिम जम्मा
                </td>
                <td className="border border-black p-1 text-right">{format(totals.basicSalary)}</td>
                <td className="border border-black p-0.5 text-center">{num(totals.gradeCount)}</td>
                <td className="border border-black p-0.5 text-right">-</td>
                <td className="border border-black p-0.5 text-right">{format(totals.gradeAmount)}</td>
                <td className="border border-black p-1 text-right">{format(totals.koshThap)}</td>
                <td className="border border-black p-1 text-right">{format(totals.bimaThap)}</td>
                <td className="border border-black p-0.5 text-right">{format(totals.praABhatta)}</td>
                <td className="border border-black p-0.5 text-right">{format(totals.mahangiBhatta)}</td>
                <td className="border border-black p-0.5 text-right">{format(totals.anyaBhatta)}</td>
                <td className="border border-black p-1 text-right font-bold">{format(totals.monthlyGross)}</td>
                <td className="border border-black p-1 text-right font-extrabold">{format(totals.dashainBhatta)}</td>
                <td className="border border-black p-1 text-right font-extrabold">{format(totals.poshakBhatta)}</td>
                <td className="border border-black p-1 text-right font-extrabold">{format(totals.periodGross)}</td>
                <td className="border border-black p-0.5 text-right">{format(totals.koshKatti)}</td>
                <td className="border border-black p-0.5 text-right">{format(totals.bimaKatti)}</td>
                <td className="border border-black p-0.5 text-right">{format(totals.citKatti)}</td>
                <td className="border border-black p-0.5 text-right">{format(totals.monthlyKatti)}</td>
                <td className="border border-black p-0.5 text-right font-bold">{format(totals.periodKatti)}</td>
                <td className="border border-black p-1 text-right font-semibold">{format(totals.periodPayableGross)}</td>
                <td className="border border-black p-1 text-right">{format(totals.tax1Percent)}</td>
                <td className="border border-black p-1 text-right font-semibold">{format(totals.monthlyNet)}</td>
                <td className="border border-black p-1 text-right font-extrabold">{format(totals.periodNet)}</td>
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
              कुल शिक्षक/कर्मचारी संख्या: <b>{num(teachers.length)} जना</b> | भुक्तानी अवधि: <b>{num(monthsCount)} महिना</b>
            </div>
          </div>
          <p className="text-[11px] text-stone-600 mt-1">
            प्रमाणित गरिन्छ कि माथि लेखिए बमोजिमको तलबी भर्पाई विवरण अनुसार सम्पूर्ण शिक्षक तथा कर्मचारीहरूको तलब, ग्रेड, भत्ता तथा नियमानुसारको कट्टी रकम कट्टा गरी खुद भुक्तानी रकम निकासा गर्न उपयुक्त छ।
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
