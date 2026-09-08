import React, { useState } from 'react';
import { Edit2, Trash2, Check, Search, Filter, Gift, Shirt, Calendar, Info } from 'lucide-react';
import { TeacherRecord, SchoolInfo } from '../types';
import { formatNepaliCurrency, toNepaliNumber } from '../utils/nepaliNumber';
import { calculateGrandTotals } from '../utils/calculations';

interface PayrollTableProps {
  teachers: TeacherRecord[];
  monthsCount: number;
  useNepaliDigits: boolean;
  schoolInfo: SchoolInfo;
  periodTitle: string;
  fiscalYear?: string;
  includeDashain?: boolean;
  includePoshak?: boolean;
  selectedQuarter?: string;
  onToggleDashain?: () => void;
  onTogglePoshak?: () => void;
  onSelectQuarter?: (quarter: 'first' | 'second' | 'third' | 'fourth' | 'yearly') => void;
  onEditTeacher: (teacher: TeacherRecord) => void;
  onDeleteTeacher: (id: string) => void;
}

export const PayrollTable: React.FC<PayrollTableProps> = ({
  teachers,
  monthsCount,
  useNepaliDigits,
  schoolInfo,
  periodTitle,
  fiscalYear,
  includeDashain = true,
  includePoshak = true,
  selectedQuarter = 'first',
  onToggleDashain,
  onTogglePoshak,
  onSelectQuarter,
  onEditTeacher,
  onDeleteTeacher
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('ALL');

  // Filter teachers
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sn.toString().includes(searchQuery);
    
    if (!matchesSearch) return false;

    if (filterDesignation === 'ALL') return true;
    if (filterDesignation === 'MAVI') return t.designation.includes('मा.वि.');
    if (filterDesignation === 'NIMAVI') return t.designation.includes('नि.मा.वि.');
    if (filterDesignation === 'PRAVI') return t.designation.includes('प्रा.वि.');
    if (filterDesignation === 'STAFF') return !t.designation.includes('वि.');
    return true;
  });

  const totals = calculateGrandTotals(teachers);

  const format = (val: number | undefined | null) => 
    formatNepaliCurrency(val, { nepaliDigits: useNepaliDigits });

  const num = (val: number | string | undefined | null) => 
    useNepaliDigits ? toNepaliNumber(val) : (val !== undefined && val !== null ? val.toString() : '0');

  return (
    <div className="max-w-[1750px] mx-auto px-4 sm:px-6 pb-12">
      {/* Search, Filter & Allowance Quarter Bar */}
      <div className="bg-white p-3.5 rounded-t-lg border border-stone-300 border-b-0 flex flex-col gap-3">
        {/* Row 1: Quarter & Allowance Toggles */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pb-2.5 border-b border-stone-200">
          {/* Quick Quarter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-stone-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-700" />
              <span>त्रैमासिक अवधि:</span>
            </span>
            {onSelectQuarter && (
              <div className="inline-flex rounded-lg border border-stone-300 p-0.5 bg-stone-50">
                <button
                  onClick={() => onSelectQuarter('first')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded ${
                    selectedQuarter === 'first' 
                      ? 'bg-blue-700 text-white shadow-2xs' 
                      : 'text-stone-700 hover:bg-stone-200'
                  }`}
                  title="साउन - असोज: साउन महिनामा दसैं भत्ता भुक्तानी गरिन्छ"
                >
                  प्रथम (साउन - असोज) 🎁
                </button>
                <button
                  onClick={() => onSelectQuarter('second')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded ${
                    selectedQuarter === 'second' 
                      ? 'bg-blue-700 text-white shadow-2xs' 
                      : 'text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  दोस्रो (कात्तिक - पुस)
                </button>
                <button
                  onClick={() => onSelectQuarter('third')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded ${
                    selectedQuarter === 'third' 
                      ? 'bg-blue-700 text-white shadow-2xs' 
                      : 'text-stone-700 hover:bg-stone-200'
                  }`}
                  title="माघ - चैत: चैत महिनामा पोशाक भत्ता भुक्तानी गरिन्छ"
                >
                  तेस्रो (माघ - चैत) 👔
                </button>
                <button
                  onClick={() => onSelectQuarter('fourth')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded ${
                    selectedQuarter === 'fourth' 
                      ? 'bg-blue-700 text-white shadow-2xs' 
                      : 'text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  चौथो (वैशाख - असार)
                </button>
                <button
                  onClick={() => onSelectQuarter('yearly')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded ${
                    selectedQuarter === 'yearly' 
                      ? 'bg-blue-700 text-white shadow-2xs' 
                      : 'text-stone-700 hover:bg-stone-200'
                  }`}
                  title="वार्षिक १२ महिनाको पूर्ण हिसाब"
                >
                  वार्षिक (१२ महिना)
                </button>
              </div>
            )}
          </div>

          {/* Dashain & Poshak Direct Toggle Switches */}
          <div className="flex items-center gap-2">
            {onToggleDashain && (
              <button
                onClick={onToggleDashain}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
                  includeDashain
                    ? 'bg-amber-100 text-amber-900 border-amber-400 hover:bg-amber-200'
                    : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200 opacity-60'
                }`}
                title="साउन महिनामा दसैं भत्ता त्रैमासिक जम्मामा जोड्ने वा नजोड्ने"
              >
                <Gift className={`w-3.5 h-3.5 ${includeDashain ? 'text-amber-700' : 'text-stone-500'}`} />
                <span>साउन दसैं भत्ता:</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${includeDashain ? 'bg-amber-600 text-white' : 'bg-stone-300 text-stone-700'}`}>
                  {includeDashain ? 'जोडिएको ✓' : 'बन्द'}
                </span>
              </button>
            )}

            {onTogglePoshak && (
              <button
                onClick={onTogglePoshak}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
                  includePoshak
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-400 hover:bg-emerald-200'
                    : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200 opacity-60'
                }`}
                title="चैत महिनामा पोशाक भत्ता त्रैमासिक जम्मामा जोड्ने वा नजोड्ने"
              >
                <Shirt className={`w-3.5 h-3.5 ${includePoshak ? 'text-emerald-700' : 'text-stone-500'}`} />
                <span>चैत पोशाक भत्ता:</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${includePoshak ? 'bg-emerald-600 text-white' : 'bg-stone-300 text-stone-700'}`}>
                  {includePoshak ? 'जोडिएको ✓' : 'बन्द'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Search, Level Filter & Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="शिक्षकको नाम वा पद खोज्नुहोस्..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-56 sm:w-64"
              />
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-stone-500 font-medium">तह:</span>
              <select
                value={filterDesignation}
                onChange={(e) => setFilterDesignation(e.target.value)}
                className="text-xs bg-white border border-stone-300 rounded px-2 py-1 text-stone-700 font-medium focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">सबै तह ({teachers.length})</option>
                <option value="MAVI">मा.वि. शिक्षक</option>
                <option value="NIMAVI">नि.मा.वि. शिक्षक</option>
                <option value="PRAVI">प्रा.वि. शिक्षक</option>
                <option value="STAFF">कर्मचारी तथा अन्य</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-stone-600 flex items-center gap-2">
            <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
              देखाइएको: <b>{num(filteredTeachers.length)}</b> / <b>{num(teachers.length)}</b> जना
            </span>
            <span className="hidden lg:inline text-stone-500">
              (त्रैमासिक जम्मा = मासिक जम्मा × महिना + दसैं भत्ता + पोशाक भत्ता)
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-stone-300 shadow-sm overflow-hidden rounded-b-lg">
        <div className="overflow-x-auto relative max-h-[75vh]">
          <table className="w-full text-[11px] text-stone-800 border-collapse border border-stone-400 select-text">
            {/* Table Header */}
            <thead className="bg-stone-100 text-stone-900 sticky top-0 z-20 shadow-xs select-none">
              {/* Row 1 Headers */}
              <tr className="border-b border-stone-400">
                <th rowSpan={2} className="border border-stone-300 px-2 py-2 text-center font-bold sticky left-0 bg-stone-100 z-30 min-w-[38px]">
                  क्र. सं.
                </th>
                <th rowSpan={2} className="border border-stone-300 px-3 py-2 text-left font-bold sticky left-[38px] bg-stone-100 z-30 min-w-[130px] whitespace-nowrap">
                  शिक्षकको नाम
                </th>
                <th rowSpan={2} className="border border-stone-300 px-2.5 py-2 text-left font-bold min-w-[95px] whitespace-nowrap">
                  पद / श्रेणी
                </th>
                <th rowSpan={2} className="border border-stone-300 px-2 py-2 text-right font-bold min-w-[78px] whitespace-nowrap">
                  तलब स्केल
                </th>

                {/* Grade Section */}
                <th colSpan={3} className="border border-stone-300 px-2 py-1.5 text-center font-bold bg-blue-50/70">
                  ग्रेड
                </th>

                {/* Kosh Thap & Bima Thap */}
                <th rowSpan={2} className="border border-stone-300 px-2 py-2 text-right font-bold min-w-[75px] bg-emerald-50/40 whitespace-nowrap">
                  क. कोष थप
                </th>
                <th rowSpan={2} className="border border-stone-300 px-2 py-2 text-right font-bold min-w-[55px] bg-emerald-50/40 whitespace-nowrap">
                  बिमा थप
                </th>

                {/* Allowances */}
                <th colSpan={3} className="border border-stone-300 px-2 py-1.5 text-center font-bold bg-amber-50/70">
                  भत्ता
                </th>

                {/* Monthly Gross */}
                <th rowSpan={2} className="border border-stone-300 px-2.5 py-2 text-right font-bold bg-indigo-50/80 min-w-[85px] whitespace-nowrap">
                  एक महिनाको जम्मा
                </th>

                {/* NEW COLUMNS: Dashain (Shrawan) and Poshak (Chaitra) BEFORE Period Gross */}
                <th rowSpan={2} className="border border-stone-300 px-2 py-2 text-right font-extrabold bg-amber-100/90 text-amber-950 min-w-[80px] whitespace-nowrap" title="साउन महिनामा भुक्तानी हुने दसैं भत्ता">
                  दसैं भत्ता (साउन)
                </th>
                <th rowSpan={2} className="border border-stone-300 px-2 py-2 text-right font-extrabold bg-emerald-100/90 text-emerald-950 min-w-[80px] whitespace-nowrap" title="चैत महिनामा भुक्तानी हुने पोशाक भत्ता">
                  पोशाक भत्ता (चैत)
                </th>

                {/* Period Gross (Total including Dashain and Poshak) */}
                <th rowSpan={2} className="border border-stone-300 px-2.5 py-2 text-right font-black bg-indigo-100/90 text-indigo-950 min-w-[98px] whitespace-nowrap" title="त्रैमासिक जम्मा = (मासिक जम्मा × महिना) + दसैं भत्ता + पोशाक भत्ता">
                  त्रैमासिक जम्मा
                </th>

                {/* Deductions */}
                <th colSpan={5} className="border border-stone-300 px-2 py-1.5 text-center font-bold bg-rose-50/70">
                  कट्टी रकम
                </th>

                {/* Payable Gross */}
                <th rowSpan={2} className="border border-stone-300 px-2.5 py-2 text-right font-bold min-w-[85px] whitespace-nowrap" title="त्रैमासिक जम्मा - त्रैमासिक कट्टी">
                  त्रैमासिक पाउने रकम
                </th>

                {/* 1% Tax */}
                <th rowSpan={2} className="border border-stone-300 px-2 py-2 text-right font-bold bg-amber-50/70 min-w-[65px] whitespace-nowrap">
                  त्रैमासिक १% कर
                </th>

                {/* Net Pay */}
                <th rowSpan={2} className="border border-stone-300 px-2.5 py-2 text-right font-bold bg-emerald-50/90 min-w-[85px] whitespace-nowrap">
                  एक महिनाको खुद
                </th>
                <th rowSpan={2} className="border border-stone-300 px-3 py-2 text-right font-extrabold bg-emerald-100/90 text-emerald-950 min-w-[100px] whitespace-nowrap">
                  त्रैमासिक खुद रकम
                </th>

                {/* Signature */}
                <th rowSpan={2} className="border border-stone-300 px-3 py-2 text-center font-bold min-w-[90px] whitespace-nowrap">
                  रकम बुझिलिनेको दस्तखत
                </th>

                {/* Actions */}
                <th rowSpan={2} className="border border-stone-300 px-2 py-2 text-center font-bold min-w-[65px] whitespace-nowrap">
                  कार्य
                </th>
              </tr>

              {/* Row 2 Sub-Headers */}
              <tr className="border-b border-stone-400 text-[10px]">
                {/* Grade sub-columns */}
                <th className="border border-stone-300 px-1 py-1 text-center font-semibold bg-blue-50/70 min-w-[34px]">
                  संख्या
                </th>
                <th className="border border-stone-300 px-1.5 py-1 text-right font-semibold bg-blue-50/70 min-w-[55px]">
                  ग्रेड दर
                </th>
                <th className="border border-stone-300 px-2 py-1 text-right font-semibold bg-blue-50/70 min-w-[65px]">
                  ग्रेड रकम
                </th>

                {/* Allowance sub-columns */}
                <th className="border border-stone-300 px-1.5 py-1 text-right font-semibold bg-amber-50/70 min-w-[50px]">
                  प्र.अ.
                </th>
                <th className="border border-stone-300 px-1.5 py-1 text-right font-semibold bg-amber-50/70 min-w-[55px]">
                  महँगी
                </th>
                <th className="border border-stone-300 px-1.5 py-1 text-right font-semibold bg-amber-50/70 min-w-[50px]">
                  अन्य
                </th>

                {/* Deduction sub-columns */}
                <th className="border border-stone-300 px-2 py-1 text-right font-semibold bg-rose-50/70 min-w-[75px]">
                  क. कोष
                </th>
                <th className="border border-stone-300 px-1.5 py-1 text-right font-semibold bg-rose-50/70 min-w-[50px]">
                  बिमा
                </th>
                <th className="border border-stone-300 px-1.5 py-1 text-right font-semibold bg-rose-50/70 min-w-[65px]">
                  सा. क. कोष
                </th>
                <th className="border border-stone-300 px-2 py-1 text-right font-semibold bg-rose-100/60 min-w-[80px]">
                  १ महिनाको
                </th>
                <th className="border border-stone-300 px-2 py-1 text-right font-semibold bg-rose-100/80 min-w-[88px]">
                  त्रैमासिक
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredTeachers.map((teacher, index) => {
                const isEven = index % 2 === 0;
                return (
                  <tr
                    key={teacher.id}
                    className={`border-b border-stone-200 hover:bg-amber-50/50 transition-colors ${
                      isEven ? 'bg-white' : 'bg-stone-50/40'
                    }`}
                  >
                    {/* S.N. (Sticky) */}
                    <td className="border border-stone-300 px-2 py-1.5 text-center font-medium text-stone-600 sticky left-0 bg-inherit z-10">
                      {num(teacher.sn)}
                    </td>

                    {/* Name (Sticky) */}
                    <td className="border border-stone-300 px-3 py-1.5 font-bold text-stone-900 sticky left-[38px] bg-inherit z-10 whitespace-nowrap">
                      {teacher.name}
                    </td>

                    {/* Designation */}
                    <td className="border border-stone-300 px-2.5 py-1.5 text-stone-700 whitespace-nowrap">
                      {teacher.designation}
                    </td>

                    {/* Basic Salary */}
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-mono">
                      {format(teacher.basicSalary)}
                    </td>

                    {/* Grade Count */}
                    <td className="border border-stone-300 px-1 py-1.5 text-center bg-blue-50/20 font-mono">
                      {teacher.gradeCount > 0 ? num(teacher.gradeCount) : '-'}
                    </td>

                    {/* Grade Rate */}
                    <td className="border border-stone-300 px-1.5 py-1.5 text-right font-mono bg-blue-50/20">
                      {teacher.gradeRate > 0 ? format(teacher.gradeRate) : '-'}
                    </td>

                    {/* Grade Amount */}
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-semibold font-mono bg-blue-50/30">
                      {teacher.gradeAmount > 0 ? format(teacher.gradeAmount) : '-'}
                    </td>

                    {/* Kosh Thap */}
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-mono bg-emerald-50/20">
                      {teacher.koshThap > 0 ? format(teacher.koshThap) : '-'}
                    </td>

                    {/* Bima Thap */}
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-mono bg-emerald-50/20">
                      {teacher.bimaThap > 0 ? format(teacher.bimaThap) : '-'}
                    </td>

                    {/* PraA Bhatta */}
                    <td className="border border-stone-300 px-1.5 py-1.5 text-right font-mono bg-amber-50/20">
                      {teacher.praABhatta > 0 ? format(teacher.praABhatta) : '-'}
                    </td>

                    {/* Mahangi Bhatta */}
                    <td className="border border-stone-300 px-1.5 py-1.5 text-right font-mono bg-amber-50/20">
                      {teacher.mahangiBhatta > 0 ? format(teacher.mahangiBhatta) : '-'}
                    </td>

                    {/* Anya Bhatta */}
                    <td className="border border-stone-300 px-1.5 py-1.5 text-right font-mono bg-amber-50/20">
                      {teacher.anyaBhatta > 0 ? format(teacher.anyaBhatta) : '-'}
                    </td>

                    {/* Monthly Gross */}
                    <td className="border border-stone-300 px-2.5 py-1.5 text-right font-bold text-indigo-900 bg-indigo-50/30 font-mono">
                      {format(teacher.monthlyGross)}
                    </td>

                    {/* NEW: Dashain Bhatta (Shrawan) */}
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-mono font-bold bg-amber-50/60 text-amber-950">
                      {teacher.dashainBhatta && teacher.dashainBhatta > 0 ? format(teacher.dashainBhatta) : '-'}
                    </td>

                    {/* NEW: Poshak Bhatta (Chaitra) */}
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-mono font-bold bg-emerald-50/60 text-emerald-950">
                      {teacher.poshakBhatta && teacher.poshakBhatta > 0 ? format(teacher.poshakBhatta) : '-'}
                    </td>

                    {/* Period Gross Total */}
                    <td className="border border-stone-300 px-2.5 py-1.5 text-right font-extrabold text-indigo-950 bg-indigo-100/60 font-mono">
                      {format(teacher.periodGross)}
                    </td>

                    {/* Kosh Katti */}
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-mono bg-rose-50/20">
                      {teacher.koshKatti > 0 ? format(teacher.koshKatti) : '-'}
                    </td>

                    {/* Bima Katti */}
                    <td className="border border-stone-300 px-1.5 py-1.5 text-right font-mono bg-rose-50/20">
                      {teacher.bimaKatti > 0 ? format(teacher.bimaKatti) : '-'}
                    </td>

                    {/* CIT Katti */}
                    <td className="border border-stone-300 px-1.5 py-1.5 text-right font-mono bg-rose-50/20">
                      {teacher.citKatti > 0 ? format(teacher.citKatti) : '-'}
                    </td>

                    {/* Monthly Katti Total */}
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-semibold text-rose-900 bg-rose-100/30 font-mono">
                      {format(teacher.monthlyKatti)}
                    </td>

                    {/* Period Katti Total */}
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-bold text-rose-950 bg-rose-100/50 font-mono">
                      {format(teacher.periodKatti)}
                    </td>

                    {/* Period Gross Payable */}
                    <td className="border border-stone-300 px-2.5 py-1.5 text-right font-bold text-stone-900 font-mono">
                      {format(teacher.periodPayableGross)}
                    </td>

                    {/* 1% Tax */}
                    <td className="border border-stone-300 px-2 py-1.5 text-right font-mono text-amber-900 bg-amber-50/40">
                      {format(teacher.tax1Percent)}
                    </td>

                    {/* Monthly Net */}
                    <td className="border border-stone-300 px-2.5 py-1.5 text-right font-bold text-emerald-900 bg-emerald-50/40 font-mono">
                      {format(teacher.monthlyNet)}
                    </td>

                    {/* Period Net */}
                    <td className="border border-stone-300 px-3 py-1.5 text-right font-extrabold text-emerald-950 bg-emerald-100/60 font-mono">
                      {format(teacher.periodNet)}
                    </td>

                    {/* Signature */}
                    <td className="border border-stone-300 px-3 py-1.5 text-center text-stone-400 italic">
                      {teacher.signature ? (
                        <span className="text-emerald-700 font-semibold flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" /> प्राप्त
                        </span>
                      ) : (
                        <span className="text-stone-300 text-[10px]">....................</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="border border-stone-300 px-2 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditTeacher(teacher)}
                          title="सम्पादन गर्नुहोस्"
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTeacher(teacher.id)}
                          title="हटाउनुहोस्"
                          className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer: Grand Totals (अन्तिम जम्मा) */}
            <tfoot className="bg-amber-100/90 text-stone-900 font-extrabold sticky bottom-0 z-20 shadow-md border-t-2 border-stone-500">
              <tr>
                <td colSpan={3} className="border border-stone-400 px-3 py-2 text-center text-xs tracking-wider sticky left-0 bg-amber-100 z-30">
                  अन्तिम जम्मा (कुल)
                </td>
                <td className="border border-stone-400 px-2 py-2 text-right font-mono">
                  {format(totals.basicSalary)}
                </td>
                <td className="border border-stone-400 px-1 py-2 text-center font-mono">
                  {num(totals.gradeCount)}
                </td>
                <td className="border border-stone-400 px-1.5 py-2 text-right font-mono">
                  -
                </td>
                <td className="border border-stone-400 px-2 py-2 text-right font-mono">
                  {format(totals.gradeAmount)}
                </td>
                <td className="border border-stone-400 px-2 py-2 text-right font-mono">
                  {format(totals.koshThap)}
                </td>
                <td className="border border-stone-400 px-2 py-2 text-right font-mono">
                  {format(totals.bimaThap)}
                </td>
                <td className="border border-stone-400 px-1.5 py-2 text-right font-mono">
                  {format(totals.praABhatta)}
                </td>
                <td className="border border-stone-400 px-1.5 py-2 text-right font-mono">
                  {format(totals.mahangiBhatta)}
                </td>
                <td className="border border-stone-400 px-1.5 py-2 text-right font-mono">
                  {format(totals.anyaBhatta)}
                </td>
                <td className="border border-stone-400 px-2.5 py-2 text-right font-mono bg-amber-200/70">
                  {format(totals.monthlyGross)}
                </td>

                {/* Grand Total of Dashain Bhatta */}
                <td className="border border-stone-400 px-2 py-2 text-right font-mono bg-amber-200/90 text-amber-950 font-black">
                  {format(totals.dashainBhatta)}
                </td>

                {/* Grand Total of Poshak Bhatta */}
                <td className="border border-stone-400 px-2 py-2 text-right font-mono bg-emerald-200/90 text-emerald-950 font-black">
                  {format(totals.poshakBhatta)}
                </td>

                {/* Grand Total of Period Gross (Total) */}
                <td className="border border-stone-400 px-2.5 py-2 text-right font-mono bg-amber-200/90 text-indigo-950 font-black">
                  {format(totals.periodGross)}
                </td>

                <td className="border border-stone-400 px-2 py-2 text-right font-mono">
                  {format(totals.koshKatti)}
                </td>
                <td className="border border-stone-400 px-1.5 py-2 text-right font-mono">
                  {format(totals.bimaKatti)}
                </td>
                <td className="border border-stone-400 px-1.5 py-2 text-right font-mono">
                  {format(totals.citKatti)}
                </td>
                <td className="border border-stone-400 px-2 py-2 text-right font-mono">
                  {format(totals.monthlyKatti)}
                </td>
                <td className="border border-stone-400 px-2 py-2 text-right font-mono bg-rose-200/70">
                  {format(totals.periodKatti)}
                </td>
                <td className="border border-stone-400 px-2.5 py-2 text-right font-mono font-black">
                  {format(totals.periodPayableGross)}
                </td>
                <td className="border border-stone-400 px-2 py-2 text-right font-mono bg-amber-200/80">
                  {format(totals.tax1Percent)}
                </td>
                <td className="border border-stone-400 px-2.5 py-2 text-right font-mono bg-emerald-200/70">
                  {format(totals.monthlyNet)}
                </td>
                <td className="border border-stone-400 px-3 py-2 text-right font-mono bg-emerald-300 text-emerald-950 font-black">
                  {format(totals.periodNet)}
                </td>
                <td colSpan={2} className="border border-stone-400 px-2 py-2 text-center text-[10px]">
                  प्रमाणित भएको
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Official Signatures Section (प्रमाणीकरण तथा दस्तखत) */}
      <div className="mt-8 bg-white border border-stone-300 rounded-lg p-6 shadow-2xs">
        <div className="text-center border-b border-stone-200 pb-3 mb-6">
          <p className="text-xs font-bold text-stone-700 tracking-wide uppercase">
            {schoolInfo.schoolName}, {schoolInfo.address}
          </p>
          <p className="text-sm font-extrabold text-stone-900 mt-0.5">
            {periodTitle} को आधिकारिक प्रमाणीकरण
          </p>
          <p className="text-xs text-stone-600 mt-1">
            माथि उल्लिखित विवरण बमोजिम शिक्षक तथा कर्मचारीहरूको तलब, भत्ता, कट्टी तथा खुद भुक्तानी रकम ठीक दुरुस्त छ।
          </p>
        </div>

        {/* 3 Signature Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          {/* Prepared By (Accountant) */}
          <div className="text-center flex flex-col items-center">
            <div className="w-48 border-b-2 border-stone-400 pb-1 mb-2">
              <span className="text-xs font-bold text-stone-800 font-mono">
                {schoolInfo.accountantName || 'कृष्ण प्रसाद रिजाल'}
              </span>
            </div>
            <p className="text-xs font-bold text-stone-900">तयार गर्ने (लेखापाल)</p>
            <p className="text-[11px] text-stone-500">दस्तखत र मिति</p>
          </div>

          {/* Checked By (SMC Chair / Inspector) */}
          <div className="text-center flex flex-col items-center">
            <div className="w-48 border-b-2 border-stone-400 pb-1 mb-2">
              <span className="text-xs text-stone-400 italic">दस्तखत</span>
            </div>
            <p className="text-xs font-bold text-stone-900">रुजु गर्ने (संयोजक / वि.व्य.स.)</p>
            <p className="text-[11px] text-stone-500">दस्तखत र मिति</p>
          </div>

          {/* Approved By (Headmaster) */}
          <div className="text-center flex flex-col items-center">
            <div className="w-48 border-b-2 border-stone-400 pb-1 mb-2">
              <span className="text-xs font-bold text-stone-800 font-mono">
                {schoolInfo.headmasterName || 'सन्तलाल सोरेन'}
              </span>
            </div>
            <p className="text-xs font-bold text-stone-900">स्वीकृत गर्ने (प्रधानाध्यापक)</p>
            <p className="text-[11px] text-stone-500">दस्तखत र कार्यालय छाप</p>
          </div>
        </div>
      </div>
    </div>
  );
};
