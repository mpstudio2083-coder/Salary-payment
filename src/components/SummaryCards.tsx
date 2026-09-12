import React from 'react';
import { Users, Banknote, ShieldAlert, Receipt, CheckCircle2, Coins } from 'lucide-react';
import { TeacherRecord } from '../types';
import { formatNepaliCurrency, toNepaliNumber, numberToNepaliWords } from '../utils/nepaliNumber';
import { calculateGrandTotals } from '../utils/calculations';

interface SummaryCardsProps {
  teachers: TeacherRecord[];
  monthsCount: number;
  useNepaliDigits: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  teachers,
  monthsCount,
  useNepaliDigits
}) => {
  const activeTeachers = teachers.filter((t) => !t.isHidden);
  const totals = calculateGrandTotals(activeTeachers);
  const netInWords = numberToNepaliWords(totals.periodNet);

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 pt-4 pb-2">
      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Staff */}
        <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">सक्रिय शिक्षक/कर्मचारी</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-lg font-bold text-stone-900 mt-1">
            {useNepaliDigits ? toNepaliNumber(activeTeachers.length) : activeTeachers.length} जना
            {teachers.length !== activeTeachers.length && (
              <span className="text-[10px] text-amber-700 ml-1 font-normal block sm:inline">
                ({useNepaliDigits ? toNepaliNumber(teachers.length - activeTeachers.length) : teachers.length - activeTeachers.length} लुकाइएको)
              </span>
            )}
          </p>
          <span className="text-[11px] text-stone-500">
            मा.वि., नि.मा.वि., प्रा.वि. र कर्मचारी
          </span>
        </div>

        {/* Monthly Gross */}
        <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">१ महिनाको कुल जम्मा</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-stone-900 mt-1">
            रू {formatNepaliCurrency(totals.monthlyGross, { nepaliDigits: useNepaliDigits })}
          </p>
          <span className="text-[11px] text-stone-500">
            तलब + ग्रेड + कोष + भत्ता
          </span>
        </div>

        {/* Period Gross */}
        <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">
              {useNepaliDigits ? toNepaliNumber(monthsCount) : monthsCount} महिनाको कुल जम्मा
            </span>
            <Banknote className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-lg font-bold text-indigo-950 mt-1">
            रू {formatNepaliCurrency(totals.periodGross, { nepaliDigits: useNepaliDigits })}
          </p>
          <span className="text-[11px] text-stone-500">
            सरकारी निकासा कुल रकम
          </span>
        </div>

        {/* Period Deductions */}
        <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">कुल कट्टी रकम</span>
            <Receipt className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-lg font-bold text-rose-800 mt-1">
            रू {formatNepaliCurrency(totals.periodKatti, { nepaliDigits: useNepaliDigits })}
          </p>
          <span className="text-[11px] text-stone-500">
            क. कोष, बिमा र नागरिक लगानी कोष
          </span>
        </div>

        {/* 1% Tax */}
        <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">१% सामाजिक सुरक्षा कर</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-lg font-bold text-amber-900 mt-1">
            रू {formatNepaliCurrency(totals.tax1Percent, { nepaliDigits: useNepaliDigits })}
          </p>
          <span className="text-[11px] text-stone-500">
            आन्तरिक राजस्व कर कट्टी
          </span>
        </div>

        {/* Net Payable - Small & Attractive */}
        <div className="bg-gradient-to-b from-emerald-50 via-emerald-50/90 to-teal-50/70 p-2.5 rounded-lg border border-emerald-400 shadow-2xs relative flex flex-col justify-between hover:border-emerald-500 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-950">कुल खुद पाउने रकम</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-full border border-emerald-300/80">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              <span>खुद</span>
            </span>
          </div>
          <p className="text-base sm:text-[17px] font-black text-emerald-950 mt-1 tracking-tight font-mono">
            रू {formatNepaliCurrency(totals.periodNet, { nepaliDigits: useNepaliDigits })}
          </p>
          <span className="text-[10px] text-emerald-800 font-medium flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
            बैंक खातामा जाने खुद रकम
          </span>
        </div>
      </div>

      {/* Words Banner */}
      <div className="mt-2.5 bg-stone-50 border border-stone-200 rounded px-3.5 py-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-800">अक्षरूपी (खुद भुक्तानी):</span>
          <span className="text-stone-700 font-medium italic">{netInWords}</span>
        </div>
        <div className="text-stone-500 text-[11px]">
          (मासिक खुद जम्मा: रू {formatNepaliCurrency(totals.monthlyNet, { nepaliDigits: useNepaliDigits })})
        </div>
      </div>
    </div>
  );
};
