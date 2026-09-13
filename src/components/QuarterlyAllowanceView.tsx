import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Sparkles, 
  RotateCcw, 
  Check, 
  Gift, 
  Shirt, 
  Award, 
  Coins, 
  ArrowLeft, 
  Zap,
  Copy,
  ChevronDown,
  ChevronUp,
  Layers,
  FileText,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { TeacherRecord } from '../types';
import { formatNepaliCurrency, toNepaliNumber } from '../utils/nepaliNumber';
import { getQuarterValues } from '../utils/calculations';

interface QuarterlyAllowanceViewProps {
  teachers: TeacherRecord[];
  fiscalYear: string;
  selectedQuarter: string;
  useNepaliDigits: boolean;
  onUpdateAllowance: (
    teacherId: string, 
    field: 'dashainBhatta' | 'poshakBhatta' | 'protsahanBhatta' | 'mahangiBhatta' | 'praABhatta' | 'anyaBhatta' | 'citKatti', 
    value: number,
    quarterKey?: 'first' | 'second' | 'third' | 'fourth'
  ) => void;
  onBulkUpdateAllowances: (updates: Array<{ teacherId: string; fields: Partial<TeacherRecord> }>) => void;
  onSelectQuarter: (quarter: string) => void;
  onBackToDashboard: () => void;
}

export const QuarterlyAllowanceView: React.FC<QuarterlyAllowanceViewProps> = ({
  teachers,
  fiscalYear,
  selectedQuarter,
  useNepaliDigits,
  onUpdateAllowance,
  onBulkUpdateAllowances,
  onSelectQuarter,
  onBackToDashboard
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'single' | 'matrix'>('single');
  const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('विवरण सफलतापूर्वक अद्यावधिक भयो!');

  const format = (val: number | undefined | null) =>
    formatNepaliCurrency(val, { nepaliDigits: useNepaliDigits });

  const num = (val: number | string | undefined | null) =>
    useNepaliDigits ? toNepaliNumber(val) : (val !== undefined && val !== null ? val.toString() : '0');

  const activeTeachers = teachers.filter((t) => !t.isHidden);
  const filteredTeachers = activeTeachers.filter((t) => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Derive current quarter key
  const currentQKey: 'first' | 'second' | 'third' | 'fourth' = 
    selectedQuarter === 'second' ? 'second' :
    selectedQuarter === 'third' ? 'third' :
    (selectedQuarter === 'fourth' || selectedQuarter === 'three_months') ? 'fourth' : 'first';

  const is2082 = fiscalYear.includes('२०८२') || fiscalYear.includes('2082');

  const triggerSuccessToast = (msg?: string) => {
    if (msg) setToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2600);
  };

  // Compute stats for the currently selected quarter
  const quarterStats = activeTeachers.reduce(
    (acc, t) => {
      const qVals = getQuarterValues(t, currentQKey);
      acc.dashain += qVals.dashainBhatta;
      acc.poshak += qVals.poshakBhatta;
      acc.protsahan += qVals.protsahanBhatta;
      acc.mahangi += qVals.mahangiBhatta;
      acc.praA += qVals.praABhatta;
      acc.anya += qVals.anyaBhatta;
      acc.cit += qVals.citKatti;
      acc.totalAllowances += (qVals.dashainBhatta + qVals.poshakBhatta + qVals.protsahanBhatta + qVals.mahangiBhatta + qVals.praABhatta + qVals.anyaBhatta);
      return acc;
    },
    { dashain: 0, poshak: 0, protsahan: 0, mahangi: 0, praA: 0, anya: 0, cit: 0, totalAllowances: 0 }
  );

  // Bulk action: Copy Quarter 1 details to Quarter 2, 3, 4 for all teachers
  const handleCopyQ1ToAllQuarters = () => {
    if (!window.confirm('के तपाईं पहिलो त्रैमासिक (साउन-असोज) का भत्ता र सा.क. कोष सबै त्रैमासिक (दोस्रो, तेस्रो र चौथो) मा प्रतिलिपि गर्न चाहनुहुन्छ? (वैशाख-असारमा फरक भएको रकम पछि परिवर्तन गर्न सक्नुहुन्छ)')) {
      return;
    }

    const updates = activeTeachers.map((t) => {
      const q1 = getQuarterValues(t, 'first');
      const newQuarterlyDetails = {
        first: { ...q1 },
        second: { ...q1 },
        third: { ...q1 },
        fourth: { ...q1 }
      };

      return {
        teacherId: t.id,
        fields: {
          quarterlyDetails: newQuarterlyDetails
        }
      };
    });

    onBulkUpdateAllowances(updates);
    triggerSuccessToast('पहिलो त्रैमासिकको विवरण सबै त्रैमासिकमा प्रतिलिपि गरियो!');
  };

  // Copy single teacher's Q1 to all their quarters
  const handleCopyTeacherQ1ToAll = (teacher: TeacherRecord) => {
    const q1 = getQuarterValues(teacher, 'first');
    const newQuarterlyDetails = {
      first: { ...q1 },
      second: { ...q1 },
      third: { ...q1 },
      fourth: { ...q1 }
    };

    onBulkUpdateAllowances([{
      teacherId: teacher.id,
      fields: {
        quarterlyDetails: newQuarterlyDetails
      }
    }]);

    triggerSuccessToast(`${teacher.name} को पहिलो त्रैमासिकको विवरण सबै त्रैमासिकमा प्रतिलिपि भयो!`);
  };

  // Bulk action: Auto fill Dashain allowance for permanent/relief (1 month basic + grade) in Quarter 1
  const handleAutoFillDashain = () => {
    const updates = activeTeachers.map((t) => {
      const isEligible = t.category === 'permanent' || t.designation.includes('वि.') || t.designation.includes('राहत');
      const amount = isEligible ? (t.basicSalary || 0) + (t.gradeAmount || 0) : 0;
      
      const qd = { ...(t.quarterlyDetails || {}) };
      qd[currentQKey] = {
        ...(qd[currentQKey] || {}),
        dashainBhatta: amount
      };

      return {
        teacherId: t.id,
        fields: { 
          dashainBhatta: currentQKey === 'first' ? amount : t.dashainBhatta,
          quarterlyDetails: qd 
        }
      };
    });
    onBulkUpdateAllowances(updates);
    triggerSuccessToast('दसैं भत्ता रकम अद्यावधिक भयो!');
  };

  // Bulk action: Auto fill Poshak allowance (रू 10,000 for all eligible)
  const handleAutoFillPoshak = () => {
    const updates = activeTeachers.map((t) => {
      const isEligible = t.category === 'permanent' || t.designation.includes('वि.');
      const amount = isEligible ? 10000 : 0;

      const qd = { ...(t.quarterlyDetails || {}) };
      qd[currentQKey] = {
        ...(qd[currentQKey] || {}),
        poshakBhatta: amount
      };

      return {
        teacherId: t.id,
        fields: { 
          poshakBhatta: currentQKey === 'third' ? amount : t.poshakBhatta,
          quarterlyDetails: qd 
        }
      };
    });
    onBulkUpdateAllowances(updates);
    triggerSuccessToast('पोशाक भत्ता रकम अद्यावधिक भयो!');
  };

  // Bulk action: Auto fill Protsahan (10% of basic)
  const handleAutoFillProtsahan = () => {
    if (is2082) {
      alert('२०८२/८३ सालमा कुनै पनि शिक्षकको प्रोत्साहन भत्ता प्रविष्टि नगरिने व्यवस्था गरिएको छ।');
      return;
    }
    const updates = activeTeachers.map((t) => {
      const isPerm = t.category === 'permanent';
      const amount = isPerm ? Math.round((t.basicSalary || 0) * 0.10 * 100) / 100 : 0;

      const qd = { ...(t.quarterlyDetails || {}) };
      qd[currentQKey] = {
        ...(qd[currentQKey] || {}),
        protsahanBhatta: amount
      };

      return {
        teacherId: t.id,
        fields: { 
          protsahanBhatta: amount,
          quarterlyDetails: qd
        }
      };
    });
    onBulkUpdateAllowances(updates);
    triggerSuccessToast('स्थायी शिक्षकहरूको १०% प्रोत्साहन भत्ता अद्यावधिक भयो!');
  };

  // Bulk action: Auto fill Mahangi (रू 5,000 for permanent/relief)
  const handleAutoFillMahangi = () => {
    const updates = activeTeachers.map((t) => {
      const isPermanent = t.category === 'permanent' || t.designation.includes('वि.');
      const amount = isPermanent ? 5000 : 0;

      const qd = { ...(t.quarterlyDetails || {}) };
      qd[currentQKey] = {
        ...(qd[currentQKey] || {}),
        mahangiBhatta: amount
      };

      return {
        teacherId: t.id,
        fields: { 
          mahangiBhatta: amount,
          quarterlyDetails: qd
        }
      };
    });
    onBulkUpdateAllowances(updates);
    triggerSuccessToast('महङ्गी भत्ता (रू ५,०००) अद्यावधिक भयो!');
  };

  // Bulk action: Reset all seasonal allowances to 0
  const handleResetSeasonal = () => {
    if (!window.confirm('के तपाईं यस त्रैमासिकमा सबै शिक्षकहरूको दसैं र पोशाक भत्ता ० बनाउन चाहनुहुन्छ?')) return;
    const updates = activeTeachers.map((t) => {
      const qd = { ...(t.quarterlyDetails || {}) };
      qd[currentQKey] = {
        ...(qd[currentQKey] || {}),
        dashainBhatta: 0,
        poshakBhatta: 0
      };

      return {
        teacherId: t.id,
        fields: { 
          dashainBhatta: currentQKey === 'first' ? 0 : t.dashainBhatta,
          poshakBhatta: currentQKey === 'third' ? 0 : t.poshakBhatta,
          quarterlyDetails: qd 
        }
      };
    });
    onBulkUpdateAllowances(updates);
    triggerSuccessToast('मौसमी भत्ता शून्य गरियो!');
  };

  const quartersMeta = [
    { key: 'first', label: 'पहिलो (साउन-असोज)', icon: '🎁', desc: 'दसैं भत्ता सामान्यतया यहाँ पर्छ' },
    { key: 'second', label: 'दोस्रो (कात्तिक-पुस)', icon: '❄️', desc: 'दोस्रो त्रैमासिक नियमित तलब' },
    { key: 'third', label: 'तेस्रो (माघ-चैत)', icon: '👔', desc: 'पोशाक भत्ता सामान्यतया चैतमा पर्छ' },
    { key: 'fourth', label: 'चौथो (वैशाख-असार)', icon: '📈', desc: 'वैशाखदेखि ग्रेड र सा.क. कोष फरक हुन सक्छ' }
  ] as const;

  return (
    <div className="max-w-[1700px] mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce border border-emerald-500">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors mt-0.5 cursor-pointer"
            title="ड्यासबोर्डमा फर्कनुहोस्"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                त्रैमासिक भत्ता तथा सा.क. कोष प्रविष्टि प्रणाली
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                आ.व. {fiscalYear}
              </span>
              {currentQKey === 'fourth' && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 animate-pulse">
                  ⚡ वैशाख-असार फरक सा.क. कोष समायोजन सक्रिय
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              त्रैमासिक अनुसार भत्ता तथा सा. क. कोष / ना. ल. कोष व्यवस्थापन
            </h1>
            <p className="text-xs text-stone-600 mt-0.5 max-w-4xl">
              साउन-असोज, कात्तिक-पुस, माघ-चैत र वैशाख-असारमा शिक्षकहरूको फरक-फरक भत्ता वा सा.क. कोष कट्टी रकम सिधै प्रविष्टि गर्नुहोस्।
            </p>
          </div>
        </div>

        {/* View Mode & Quarter Switchers */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-stone-100 p-1 rounded-lg border border-stone-300 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'single'
                  ? 'bg-white text-stone-900 shadow-2xs font-extrabold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>चयनित त्रैमासिक मोड</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'matrix'
                  ? 'bg-white text-stone-900 shadow-2xs font-extrabold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>४ वटै त्रैमासिक तुलना (Matrix)</span>
            </button>
          </div>

          {/* Quarter Selectors */}
          <div className="flex flex-wrap items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              type="button"
              onClick={() => onSelectQuarter('first')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedQuarter === 'first'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200'
              }`}
            >
              पहिलो (साउन-असोज) 🎁
            </button>
            <button
              type="button"
              onClick={() => onSelectQuarter('second')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedQuarter === 'second'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200'
              }`}
            >
              दोस्रो (कात्तिक-पुस)
            </button>
            <button
              type="button"
              onClick={() => onSelectQuarter('third')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedQuarter === 'third'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200'
              }`}
            >
              तेस्रो (माघ-चैत) 👔
            </button>
            <button
              type="button"
              onClick={() => onSelectQuarter('fourth')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedQuarter === 'fourth' || selectedQuarter === 'three_months'
                  ? 'bg-amber-700 text-white shadow-xs ring-2 ring-amber-400'
                  : 'text-amber-900 bg-amber-50 hover:bg-amber-100 font-extrabold'
              }`}
              title="वैशाखदेखि असारसम्मको फरक सा.क. कोष र भत्ता"
            >
              चौथो (वैशाख-असार) 📈
            </button>
            <button
              type="button"
              onClick={() => onSelectQuarter('yearly')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedQuarter === 'yearly'
                  ? 'bg-stone-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200'
              }`}
            >
              वार्षिक (१२ महिना)
            </button>
          </div>
        </div>
      </div>

      {/* Allowance & Deduction Stat Cards for Current Quarter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {/* Dashain */}
        <div className="bg-white p-2.5 rounded-xl border border-purple-200 shadow-2xs">
          <div className="flex items-center gap-1 text-purple-800 mb-0.5">
            <Gift className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">दसैं भत्ता</span>
          </div>
          <p className="text-sm sm:text-base font-black text-purple-950 font-mono">
            रू {format(quarterStats.dashain)}
          </p>
          <span className="text-[10px] text-stone-500">साउनमा १ महिना स्केल</span>
        </div>

        {/* Poshak */}
        <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center gap-1 text-emerald-800 mb-0.5">
            <Shirt className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">पोशाक भत्ता</span>
          </div>
          <p className="text-sm sm:text-base font-black text-emerald-950 font-mono">
            रू {format(quarterStats.poshak)}
          </p>
          <span className="text-[10px] text-stone-500">चैतमा रू १०,०००</span>
        </div>

        {/* Protsahan */}
        <div className="bg-white p-2.5 rounded-xl border border-blue-200 shadow-2xs">
          <div className="flex items-center gap-1 text-blue-800 mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">प्रोत्साहन (१०%)</span>
          </div>
          <p className="text-sm sm:text-base font-black text-blue-950 font-mono">
            रू {format(quarterStats.protsahan)}
          </p>
          <span className="text-[10px] text-stone-500">स्थायीको मात्र</span>
        </div>

        {/* Mahangi */}
        <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
          <div className="flex items-center gap-1 text-amber-800 mb-0.5">
            <Coins className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">महङ्गी भत्ता</span>
          </div>
          <p className="text-sm sm:text-base font-black text-amber-950 font-mono">
            रू {format(quarterStats.mahangi)}
          </p>
          <span className="text-[10px] text-stone-500">मासिक रू ५,०००</span>
        </div>

        {/* Pra.A. */}
        <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center gap-1 text-stone-700 mb-0.5">
            <Award className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">प्र.अ. भत्ता</span>
          </div>
          <p className="text-sm sm:text-base font-black text-stone-900 font-mono">
            रू {format(quarterStats.praA)}
          </p>
          <span className="text-[10px] text-stone-500">मासिक सुविधा</span>
        </div>

        {/* Anya */}
        <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center gap-1 text-stone-700 mb-0.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">अन्य भत्ता</span>
          </div>
          <p className="text-sm sm:text-base font-black text-stone-900 font-mono">
            रू {format(quarterStats.anya)}
          </p>
          <span className="text-[10px] text-stone-500">स्थानीय/विशेष</span>
        </div>

        {/* CIT / Kalyan Kosh - NEW HIGHLIGHT */}
        <div className={`p-2.5 rounded-xl border shadow-2xs ${
          currentQKey === 'fourth' 
            ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400' 
            : 'bg-white border-rose-200'
        }`}>
          <div className="flex items-center gap-1 text-rose-800 mb-0.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">सा.क. / ना.ल. कोष</span>
          </div>
          <p className="text-sm sm:text-base font-black text-rose-950 font-mono">
            रू {format(quarterStats.cit)}
          </p>
          <span className="text-[10px] text-rose-700 font-semibold">
            {currentQKey === 'fourth' ? 'वैशाख-असारको कट्टी' : 'मासिक कट्टी रकम'}
          </span>
        </div>

        {/* Grand Total All Allowances */}
        <div className="bg-gradient-to-br from-indigo-700 to-blue-800 p-2.5 rounded-xl text-white shadow-2xs">
          <div className="flex items-center gap-1 text-indigo-100 mb-0.5">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">कुल भत्ता</span>
          </div>
          <p className="text-sm sm:text-base font-black text-white font-mono">
            रू {format(quarterStats.totalAllowances)}
          </p>
          <span className="text-[10px] text-indigo-200">यस त्रैमासिकको योग</span>
        </div>
      </div>

      {/* Bulk Fast Actions Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold text-stone-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            द्रुत कार्यहरू:
          </span>

          {/* Copy Q1 to all quarters button */}
          <button
            type="button"
            onClick={handleCopyQ1ToAllQuarters}
            className="px-2.5 py-1 text-xs font-extrabold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-300 transition-colors cursor-pointer flex items-center gap-1"
            title="पहिलो त्रैमासिक (साउन-असोज) को भत्ता र सा.क. कोष बाँकी सबै त्रैमासिकमा प्रतिलिपि गर्नुहोस्"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-700" />
            <span>पहिलो त्रैमासिकको विवरण सबैमा कपी</span>
          </button>

          <button
            type="button"
            onClick={handleAutoFillDashain}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 transition-colors cursor-pointer"
            title="यस त्रैमासिकमा १ महिना स्केल बराबर दसैं भत्ता स्वतः भर्ने"
          >
            🎁 दसैं भत्ता (१ महिना स्केल)
          </button>

          <button
            type="button"
            onClick={handleAutoFillPoshak}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 transition-colors cursor-pointer"
            title="यस त्रैमासिकमा पोशाक भत्ता रू १०,००० स्वतः भर्ने"
          >
            👔 पोशाक भत्ता (रू १०,०००)
          </button>

          {!is2082 && (
            <button
              type="button"
              onClick={handleAutoFillProtsahan}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 transition-colors cursor-pointer"
              title="सबै स्थायी शिक्षक/कर्मचारीको तलब स्केलको १०% प्रोत्साहन भत्ता स्वतः भर्ने"
            >
              ⭐ प्रोत्साहन भत्ता (१०%)
            </button>
          )}

          <button
            type="button"
            onClick={handleAutoFillMahangi}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors cursor-pointer"
          >
            💰 महङ्गी भत्ता (रू ५,०००)
          </button>

          <button
            type="button"
            onClick={handleResetSeasonal}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 inline mr-1" />
            मौसमी भत्ता शून्य
          </button>
        </div>

        {/* Search Box */}
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="शिक्षकको नाम वा पद खोज्नुहोस्..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-stone-50"
          />
        </div>
      </div>

      {/* VIEW 1: SINGLE QUARTER VIEW */}
      {viewMode === 'single' && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="p-3 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-stone-900">
                वर्तमान प्रविष्टि अवधि:
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-950 font-bold border border-blue-300">
                {currentQKey === 'first' && 'पहिलो त्रैमासिक (साउन - असोज)'}
                {currentQKey === 'second' && 'दोस्रो त्रैमासिक (कात्तिक - पुस)'}
                {currentQKey === 'third' && 'तेस्रो त्रैमासिक (माघ - चैत)'}
                {currentQKey === 'fourth' && 'चौथो त्रैमासिक (वैशाख - असार)'}
              </span>
              <span className="text-stone-500 font-normal">
                (यस अवधिमा लागु हुने भत्ता तथा सा.क. कोष सिधै कोठामा टाइप गर्नुहोस्)
              </span>
            </div>
            <span className="text-stone-500 font-medium">
              कुल: {num(filteredTeachers.length)} जना
            </span>
          </div>

          <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
            <table className="w-full text-xs text-stone-800 border-collapse">
              <thead className="bg-stone-100 text-stone-900 font-bold border-b border-stone-300 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-2.5 text-center w-10">क्र.सं.</th>
                  <th className="px-3 py-2.5 text-left min-w-[160px]">शिक्षक/कर्मचारीको नाम</th>
                  <th className="px-2.5 py-2.5 text-left min-w-[110px]">पद / श्रेणी</th>
                  <th className="px-2.5 py-2.5 text-right min-w-[95px]">तलब स्केल</th>
                  <th className="px-2 py-2.5 text-right min-w-[100px] bg-purple-50 text-purple-950">
                    दसैं भत्ता (रू)
                  </th>
                  <th className="px-2 py-2.5 text-right min-w-[100px] bg-emerald-50 text-emerald-950">
                    पोशाक भत्ता (रू)
                  </th>
                  <th className="px-2 py-2.5 text-right min-w-[105px] bg-blue-50 text-blue-950">
                    प्रोत्साहन भत्ता (१०%)
                  </th>
                  <th className="px-2 py-2.5 text-right min-w-[95px] bg-amber-50 text-amber-950">
                    महङ्गी भत्ता (रू)
                  </th>
                  <th className="px-2 py-2.5 text-right min-w-[85px]">प्र.अ. भत्ता</th>
                  <th className="px-2 py-2.5 text-right min-w-[90px]">अन्य भत्ता</th>
                  
                  {/* CIT / Kalyan Kosh Column - NEW */}
                  <th className={`px-2 py-2.5 text-right min-w-[115px] font-extrabold ${
                    currentQKey === 'fourth' 
                      ? 'bg-rose-100 text-rose-950 ring-2 ring-rose-400' 
                      : 'bg-rose-50 text-rose-950'
                  }`}>
                    सा.क. कोष कट्टी ✏️
                    {currentQKey === 'fourth' && (
                      <span className="block text-[9px] font-normal text-rose-700">वैशाख-असार फरक</span>
                    )}
                  </th>

                  <th className="px-2.5 py-2.5 text-right min-w-[105px] bg-indigo-50 font-black text-indigo-950">
                    कुल भत्ता
                  </th>
                  <th className="px-2.5 py-2.5 text-right min-w-[105px] font-bold text-stone-900">
                    १ महिना तलब
                  </th>
                  <th className="px-2.5 py-2.5 text-right min-w-[110px] font-black text-emerald-950 bg-emerald-50/70">
                    बैंक जाने खुद
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredTeachers.map((teacher, index) => {
                  const qVals = getQuarterValues(teacher, currentQKey);
                  const totalTeacherAllowances = 
                    qVals.dashainBhatta +
                    qVals.poshakBhatta +
                    qVals.protsahanBhatta +
                    qVals.mahangiBhatta +
                    qVals.praABhatta +
                    qVals.anyaBhatta;

                  return (
                    <tr key={teacher.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-2 py-2 text-center font-mono text-stone-500">
                        {num(index + 1)}
                      </td>
                      <td className="px-3 py-2 font-bold text-stone-900">
                        {teacher.name}
                        {teacher.category === 'permanent' && (
                          <span className="ml-1.5 px-1 py-0.2 text-[9px] rounded bg-emerald-100 text-emerald-800 font-normal">
                            स्थायी
                          </span>
                        )}
                      </td>
                      <td className="px-2.5 py-2 text-stone-600 font-medium">
                        {teacher.designation}
                      </td>
                      <td className="px-2.5 py-2 text-right font-mono text-stone-700">
                        {format(teacher.basicSalary)}
                      </td>

                      {/* Dashain Bhatta Input */}
                      <td className="px-1 py-1 text-right bg-purple-50/30">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={qVals.dashainBhatta}
                          onChange={(e) => onUpdateAllowance(teacher.id, 'dashainBhatta', parseFloat(e.target.value) || 0, currentQKey)}
                          className="w-full text-right font-mono font-bold px-1.5 py-1 text-xs rounded border border-purple-300 bg-white focus:ring-1 focus:ring-purple-500 text-purple-950"
                        />
                      </td>

                      {/* Poshak Bhatta Input */}
                      <td className="px-1 py-1 text-right bg-emerald-50/30">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={qVals.poshakBhatta}
                          onChange={(e) => onUpdateAllowance(teacher.id, 'poshakBhatta', parseFloat(e.target.value) || 0, currentQKey)}
                          className="w-full text-right font-mono font-bold px-1.5 py-1 text-xs rounded border border-emerald-300 bg-white focus:ring-1 focus:ring-emerald-500 text-emerald-950"
                        />
                      </td>

                      {/* Protsahan Bhatta Input - स्थायीको मात्र (२०८२/८३ मा प्रविष्टि नगरिने) */}
                      <td className="px-1 py-1 text-right bg-blue-50/30">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          disabled={is2082 || teacher.category !== 'permanent'}
                          value={is2082 ? 0 : (teacher.category === 'permanent' ? qVals.protsahanBhatta : 0)}
                          onChange={(e) => {
                            if (is2082) return;
                            onUpdateAllowance(teacher.id, 'protsahanBhatta', parseFloat(e.target.value) || 0, currentQKey);
                          }}
                          className={`w-full text-right font-mono font-bold px-1.5 py-1 text-xs rounded border ${
                            !is2082 && teacher.category === 'permanent'
                              ? 'border-blue-300 bg-white focus:ring-1 focus:ring-blue-500 text-blue-950'
                              : 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed'
                          }`}
                          title={is2082 ? '२०८२/८३ सालमा कुनै पनि शिक्षकको प्रोत्साहन भत्ता प्रविष्टि नगरिने व्यवस्था' : (teacher.category === 'permanent' ? 'स्केलको १०% प्रोत्साहन भत्ता' : 'नियम: स्थायी शिक्षक/कर्मचारीलाई मात्र लागु हुने')}
                        />
                      </td>

                      {/* Mahangi Bhatta Input */}
                      <td className="px-1 py-1 text-right bg-amber-50/30">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={qVals.mahangiBhatta}
                          onChange={(e) => onUpdateAllowance(teacher.id, 'mahangiBhatta', parseFloat(e.target.value) || 0, currentQKey)}
                          className="w-full text-right font-mono font-semibold px-1.5 py-1 text-xs rounded border border-amber-300 bg-white focus:ring-1 focus:ring-amber-500 text-amber-950"
                        />
                      </td>

                      {/* Pra.A. Bhatta Input */}
                      <td className="px-1 py-1 text-right">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={qVals.praABhatta}
                          onChange={(e) => onUpdateAllowance(teacher.id, 'praABhatta', parseFloat(e.target.value) || 0, currentQKey)}
                          className="w-full text-right font-mono px-1.5 py-1 text-xs rounded border border-stone-300 bg-white focus:ring-1 focus:ring-stone-500 text-stone-900"
                        />
                      </td>

                      {/* Anya Bhatta Input */}
                      <td className="px-1 py-1 text-right">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={qVals.anyaBhatta}
                          onChange={(e) => onUpdateAllowance(teacher.id, 'anyaBhatta', parseFloat(e.target.value) || 0, currentQKey)}
                          className="w-full text-right font-mono px-1.5 py-1 text-xs rounded border border-stone-300 bg-white focus:ring-1 focus:ring-stone-500 text-stone-900"
                        />
                      </td>

                      {/* CIT / Kalyan Kosh Input - NEW */}
                      <td className={`px-1 py-1 text-right ${
                        currentQKey === 'fourth' ? 'bg-rose-100/60' : 'bg-rose-50/30'
                      }`}>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={qVals.citKatti}
                          onChange={(e) => onUpdateAllowance(teacher.id, 'citKatti', parseFloat(e.target.value) || 0, currentQKey)}
                          className={`w-full text-right font-mono font-bold px-1.5 py-1 text-xs rounded border ${
                            currentQKey === 'fourth'
                              ? 'border-rose-400 bg-white text-rose-950 focus:ring-2 focus:ring-rose-500 font-black'
                              : 'border-rose-300 bg-white text-rose-900 focus:ring-1 focus:ring-rose-400'
                          }`}
                          title={`यस त्रैमासिक (${currentQKey}) को सा. क. कोष / ना. ल. कोष कट्टी रकम`}
                        />
                      </td>

                      {/* Total Allowances */}
                      <td className="px-2.5 py-2 text-right font-mono font-black text-indigo-950 bg-indigo-50/40">
                        {format(totalTeacherAllowances)}
                      </td>

                      {/* Monthly Gross */}
                      <td className="px-2.5 py-2 text-right font-mono font-bold text-stone-900">
                        {format(teacher.monthlyGross)}
                      </td>

                      {/* Net Payable */}
                      <td className="px-2.5 py-2 text-right font-mono font-black text-emerald-950 bg-emerald-50/40">
                        {format(teacher.netPayable)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-stone-100 font-bold border-t-2 border-stone-400 font-mono">
                <tr>
                  <td colSpan={4} className="px-3 py-2.5 font-sans font-black text-stone-900 text-right">
                    कुल जम्मा ({currentQKey}):
                  </td>
                  <td className="px-2 py-2.5 text-right text-purple-950 font-black">
                    रू {format(quarterStats.dashain)}
                  </td>
                  <td className="px-2 py-2.5 text-right text-emerald-950 font-black">
                    रू {format(quarterStats.poshak)}
                  </td>
                  <td className="px-2 py-2.5 text-right text-blue-950 font-black">
                    रू {format(quarterStats.protsahan)}
                  </td>
                  <td className="px-2 py-2.5 text-right text-amber-950 font-black">
                    रू {format(quarterStats.mahangi)}
                  </td>
                  <td className="px-2 py-2.5 text-right text-stone-900 font-black">
                    रू {format(quarterStats.praA)}
                  </td>
                  <td className="px-2 py-2.5 text-right text-stone-900 font-black">
                    रू {format(quarterStats.anya)}
                  </td>
                  <td className="px-2 py-2.5 text-right text-rose-950 font-black bg-rose-100">
                    रू {format(quarterStats.cit)}
                  </td>
                  <td className="px-2 py-2.5 text-right text-indigo-950 font-black bg-indigo-100">
                    रू {format(quarterStats.totalAllowances)}
                  </td>
                  <td className="px-2 py-2.5 text-right text-stone-900 font-black">
                    रू {format(activeTeachers.reduce((s, t) => s + (t.monthlyGross || 0), 0))}
                  </td>
                  <td className="px-2 py-2.5 text-right text-emerald-950 font-black bg-emerald-100">
                    रू {format(activeTeachers.reduce((s, t) => s + (t.netPayable || 0), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: ALL 4 QUARTERS COMPARISON & EDIT MATRIX */}
      {viewMode === 'matrix' && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-blue-950 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-700" />
                चारै त्रैमासिक तुलना तथा विस्तृत प्रविष्टि तालिका (All 4 Quarters Matrix)
              </h3>
              <p className="text-xs text-blue-800/80 mt-0.5">
                कुनै शिक्षकको साउन-असोजमा एउटा भत्ता/कट्टी, कात्तिक-पुसमा अर्को, माघ-चैतमा अर्को र वैशाख-असारमा फरक सा.क. कोष वा भत्ता भए यहाँ सिधै तुलना गरी भर्नुहोस्।
              </p>
            </div>
            <span className="text-xs font-bold text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-blue-200">
              कुल: {num(filteredTeachers.length)} जना शिक्षक/कर्मचारी
            </span>
          </div>

          <div className="divide-y divide-stone-200 max-h-[750px] overflow-y-auto">
            {filteredTeachers.map((teacher, idx) => {
              const isExpanded = expandedTeacherId === teacher.id;
              const q1 = getQuarterValues(teacher, 'first');
              const q2 = getQuarterValues(teacher, 'second');
              const q3 = getQuarterValues(teacher, 'third');
              const q4 = getQuarterValues(teacher, 'fourth');

              const hasDifference = 
                q1.citKatti !== q4.citKatti ||
                q1.mahangiBhatta !== q4.mahangiBhatta ||
                q1.praABhatta !== q4.praABhatta ||
                q1.anyaBhatta !== q4.anyaBhatta;

              return (
                <div key={teacher.id} className="p-3 hover:bg-stone-50/60 transition-colors">
                  {/* Summary row per teacher */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-xs font-mono font-bold text-stone-400">
                        {num(idx + 1)}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-stone-900 text-sm">{teacher.name}</span>
                          <span className="text-xs text-stone-500 font-medium">({teacher.designation})</span>
                          {teacher.category === 'permanent' && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              स्थायी
                            </span>
                          )}
                          {hasDifference && (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold">
                              त्रैमासिक भिन्नता छ
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 mt-1">
                          <span>सुरु तलब: <b className="font-mono text-stone-800">{format(teacher.basicSalary)}</b></span>
                          <span>
                            सा.क. कोष: Q1-Q3 <b className="font-mono text-stone-900">रू {format(q1.citKatti)}</b>
                            {' ➔ '}
                            Q4 (वैशाख-असार) <b className={`font-mono ${q1.citKatti !== q4.citKatti ? 'text-rose-700 font-black' : 'text-stone-900'}`}>
                              रू {format(q4.citKatti)}
                            </b>
                          </span>
                          <span>
                            दसैं: <b className="font-mono text-purple-900">रू {format(q1.dashainBhatta)}</b>
                          </span>
                          <span>
                            पोशाक: <b className="font-mono text-emerald-900">रू {format(q3.poshakBhatta)}</b>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end lg:self-center">
                      <button
                        type="button"
                        onClick={() => handleCopyTeacherQ1ToAll(teacher)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 cursor-pointer flex items-center gap-1"
                        title="यो शिक्षकको पहिलो त्रैमासिकको विवरण बाँकी ३ वटैमा कपी गर्नुहोस्"
                      >
                        <Copy className="w-3 h-3 text-blue-700" />
                        <span>Q1 सबैमा कपी</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedTeacherId(isExpanded ? null : teacher.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isExpanded 
                            ? 'bg-stone-800 text-white border-stone-800' 
                            : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                        }`}
                      >
                        <span>{isExpanded ? 'विवरण बन्द गर्नुहोस्' : '४ वटै त्रैमासिक सम्पादन गर्नुहोस्'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded 4 Quarters Sub-table */}
                  {isExpanded && (
                    <div className="mt-3.5 pt-3 border-t border-stone-200 overflow-x-auto bg-stone-50/80 p-3 rounded-xl border border-stone-300">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-stone-200 text-stone-900 font-bold border-b border-stone-300">
                            <th className="px-2.5 py-2 text-left">त्रैमासिक अवधि</th>
                            <th className="px-2 py-2 text-right bg-purple-100 text-purple-950">दसैं भत्ता</th>
                            <th className="px-2 py-2 text-right bg-emerald-100 text-emerald-950">पोशाक भत्ता</th>
                            <th className="px-2 py-2 text-right bg-blue-100 text-blue-950">प्रोत्साहन (१०%)</th>
                            <th className="px-2 py-2 text-right bg-amber-100 text-amber-950">महङ्गी भत्ता</th>
                            <th className="px-2 py-2 text-right">प्र.अ. भत्ता</th>
                            <th className="px-2 py-2 text-right">अन्य भत्ता</th>
                            <th className="px-2 py-2 text-right bg-rose-100 text-rose-950 font-extrabold">
                              सा. क. कोष / ना. ल. कोष ✏️
                            </th>
                            <th className="px-2 py-2 text-right bg-indigo-100 text-indigo-950 font-black">कुल भत्ता</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {quartersMeta.map((q) => {
                            const qData = getQuarterValues(teacher, q.key);
                            const qTotalAllowances = 
                              qData.dashainBhatta +
                              qData.poshakBhatta +
                              qData.protsahanBhatta +
                              qData.mahangiBhatta +
                              qData.praABhatta +
                              qData.anyaBhatta;

                            return (
                              <tr key={q.key} className={q.key === 'fourth' ? 'bg-amber-50/60 font-semibold' : 'bg-white'}>
                                <td className="px-2.5 py-2 font-bold text-stone-900 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <span>{q.icon}</span>
                                    <span>{q.label}</span>
                                    {q.key === 'fourth' && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 text-[10px] font-bold">
                                        वैशाख-असार
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Dashain */}
                                <td className="px-1.5 py-1 text-right bg-purple-50/40">
                                  <input
                                    type="number"
                                    min="0"
                                    value={qData.dashainBhatta}
                                    onChange={(e) => onUpdateAllowance(teacher.id, 'dashainBhatta', parseFloat(e.target.value) || 0, q.key)}
                                    className="w-20 text-right font-mono font-bold px-1.5 py-0.5 text-xs rounded border border-purple-300 bg-white focus:ring-1 focus:ring-purple-500"
                                  />
                                </td>

                                {/* Poshak */}
                                <td className="px-1.5 py-1 text-right bg-emerald-50/40">
                                  <input
                                    type="number"
                                    min="0"
                                    value={qData.poshakBhatta}
                                    onChange={(e) => onUpdateAllowance(teacher.id, 'poshakBhatta', parseFloat(e.target.value) || 0, q.key)}
                                    className="w-20 text-right font-mono font-bold px-1.5 py-0.5 text-xs rounded border border-emerald-300 bg-white focus:ring-1 focus:ring-emerald-500"
                                  />
                                </td>

                                {/* Protsahan */}
                                <td className="px-1.5 py-1 text-right bg-blue-50/40">
                                  <input
                                    type="number"
                                    min="0"
                                    disabled={is2082 || teacher.category !== 'permanent'}
                                    value={is2082 ? 0 : (teacher.category === 'permanent' ? qData.protsahanBhatta : 0)}
                                    onChange={(e) => {
                                      if (is2082) return;
                                      onUpdateAllowance(teacher.id, 'protsahanBhatta', parseFloat(e.target.value) || 0, q.key);
                                    }}
                                    className={`w-20 text-right font-mono font-bold px-1.5 py-0.5 text-xs rounded border ${
                                      !is2082 && teacher.category === 'permanent'
                                        ? 'border-blue-300 bg-white focus:ring-1 focus:ring-blue-500'
                                        : 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed'
                                    }`}
                                    title={is2082 ? '२०८२/८३ सालमा कुनै पनि शिक्षकको प्रोत्साहन भत्ता प्रविष्टि नगरिने व्यवस्था' : ''}
                                  />
                                </td>

                                {/* Mahangi */}
                                <td className="px-1.5 py-1 text-right bg-amber-50/40">
                                  <input
                                    type="number"
                                    min="0"
                                    value={qData.mahangiBhatta}
                                    onChange={(e) => onUpdateAllowance(teacher.id, 'mahangiBhatta', parseFloat(e.target.value) || 0, q.key)}
                                    className="w-20 text-right font-mono font-semibold px-1.5 py-0.5 text-xs rounded border border-amber-300 bg-white focus:ring-1 focus:ring-amber-500"
                                  />
                                </td>

                                {/* PraA */}
                                <td className="px-1.5 py-1 text-right">
                                  <input
                                    type="number"
                                    min="0"
                                    value={qData.praABhatta}
                                    onChange={(e) => onUpdateAllowance(teacher.id, 'praABhatta', parseFloat(e.target.value) || 0, q.key)}
                                    className="w-18 text-right font-mono px-1.5 py-0.5 text-xs rounded border border-stone-300 bg-white focus:ring-1 focus:ring-stone-500"
                                  />
                                </td>

                                {/* Anya */}
                                <td className="px-1.5 py-1 text-right">
                                  <input
                                    type="number"
                                    min="0"
                                    value={qData.anyaBhatta}
                                    onChange={(e) => onUpdateAllowance(teacher.id, 'anyaBhatta', parseFloat(e.target.value) || 0, q.key)}
                                    className="w-18 text-right font-mono px-1.5 py-0.5 text-xs rounded border border-stone-300 bg-white focus:ring-1 focus:ring-stone-500"
                                  />
                                </td>

                                {/* CIT Katti - NEW HIGHLIGHT */}
                                <td className={`px-1.5 py-1 text-right ${
                                  q.key === 'fourth' ? 'bg-rose-100/70' : 'bg-rose-50/40'
                                }`}>
                                  <input
                                    type="number"
                                    min="0"
                                    value={qData.citKatti}
                                    onChange={(e) => onUpdateAllowance(teacher.id, 'citKatti', parseFloat(e.target.value) || 0, q.key)}
                                    className={`w-24 text-right font-mono font-black px-1.5 py-0.5 text-xs rounded border ${
                                      q.key === 'fourth'
                                        ? 'border-rose-400 bg-white text-rose-950 ring-1 ring-rose-400 font-extrabold'
                                        : 'border-rose-300 bg-white text-rose-900 focus:ring-1 focus:ring-rose-500'
                                    }`}
                                    title={`${q.label} को सा. क. कोष कट्टी रकम`}
                                  />
                                </td>

                                {/* Total Allowances for this Quarter */}
                                <td className="px-2.5 py-1 text-right font-mono font-black text-indigo-950 bg-indigo-50/50">
                                  {format(qTotalAllowances)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
