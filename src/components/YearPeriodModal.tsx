import React, { useState } from 'react';
import { X, Calendar, Plus, Copy, Check, Trash2, Info } from 'lucide-react';
import { FiscalYearPayroll, TeacherRecord } from '../types';
import { calculateTeacherPayroll } from '../utils/calculations';

interface YearPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableYears: FiscalYearPayroll[];
  currentYear: FiscalYearPayroll;
  onSelectYear: (year: string) => void;
  onSaveNewYear: (newYear: FiscalYearPayroll) => void;
  onDeleteYear: (year: string) => void;
  onUpdatePeriodTitle: (title: string, notes?: string) => void;
}

export const YearPeriodModal: React.FC<YearPeriodModalProps> = ({
  isOpen,
  onClose,
  availableYears,
  currentYear,
  onSelectYear,
  onSaveNewYear,
  onDeleteYear,
  onUpdatePeriodTitle
}) => {
  const [newFiscalYear, setNewFiscalYear] = useState('२०८३/८४');
  const [newPeriodTitle, setNewPeriodTitle] = useState('२०८३ साल वैशाखदेखि २०८४ असार सम्मको तलबी भर्पाई');
  const [newMonthsCount, setNewMonthsCount] = useState(3);
  const [incrementGrades, setIncrementGrades] = useState(true);

  const [editTitle, setEditTitle] = useState(currentYear.periodTitle);
  const [editNotes, setEditNotes] = useState(currentYear.notes || '');

  if (!isOpen) return null;

  const handleCreateYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFiscalYear.trim()) {
      alert('कृपया आर्थिक वर्ष लेख्नुहोस् (उदा. २०८३/८४)');
      return;
    }

    if (availableYears.some(y => y.fiscalYear === newFiscalYear.trim())) {
      alert(`आर्थिक वर्ष ${newFiscalYear} पहिले नै दर्ता छ!`);
      return;
    }

    // Clone teachers from current year
    const clonedTeachers: TeacherRecord[] = currentYear.teachers.map(t => {
      const newGradeCount = (incrementGrades && t.category === 'permanent') 
        ? t.gradeCount + 1 
        : t.gradeCount;
      
      const gradeRate = t.gradeRate || (newGradeCount > 0 ? Math.round(t.basicSalary / 30) : 0);
      const gradeAmount = newGradeCount * gradeRate;

      return calculateTeacherPayroll({
        ...t,
        id: `t-${Date.now()}-${t.sn}`,
        gradeCount: newGradeCount,
        gradeRate,
        gradeAmount,
        koshThap: t.category === 'permanent' ? Math.round((t.basicSalary + gradeAmount) * 0.10 * 100) / 100 : 0,
        koshKatti: t.category === 'permanent' ? Math.round((t.basicSalary + gradeAmount) * 0.20 * 100) / 100 : 0,
      }, newMonthsCount, true);
    });

    const newEntry: FiscalYearPayroll = {
      fiscalYear: newFiscalYear.trim(),
      periodTitle: newPeriodTitle.trim(),
      monthsCount: newMonthsCount,
      teachers: clonedTeachers,
      notes: `${currentYear.fiscalYear} बाट ${incrementGrades ? '१ ग्रेड थपेर' : ''} सारिएको नयाँ भर्पाई`
    };

    onSaveNewYear(newEntry);
    onSelectYear(newEntry.fiscalYear);
    onClose();
  };

  const handleUpdateTitle = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePeriodTitle(editTitle, editNotes);
    alert('विवरण सुरक्षित भयो!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-stone-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                आर्थिक वर्ष तथा अवधि व्यवस्थापन
              </h2>
              <p className="text-xs text-stone-500">
                विभिन्न साल अनुसार तलबी भर्पाई बनाउने र हेर्ने सुविधा
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

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Active Year Switcher */}
          <div>
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              उपलब्ध आर्थिक वर्षहरू ({availableYears.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableYears.map(yr => {
                const isSelected = yr.fiscalYear === currentYear.fiscalYear;
                return (
                  <div
                    key={yr.fiscalYear}
                    onClick={() => onSelectYear(yr.fiscalYear)}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-2xs'
                        : 'bg-white border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900">
                          आ.व. {yr.fiscalYear}
                        </span>
                        {isSelected && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-blue-600 text-white rounded font-medium">
                            हाल चालु
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                        {yr.periodTitle}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {yr.teachers.length} शिक्षक/कर्मचारी • {yr.monthsCount} महिना
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {availableYears.length > 1 && !isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`के तपाईं आ.व. ${yr.fiscalYear} हटाउन चाहनुहुन्छ?`)) {
                              onDeleteYear(yr.fiscalYear);
                            }
                          }}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded"
                          title="वर्ष हटाउनुहोस्"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Current Year Title Edit */}
          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              हालको वर्ष (आ.व. {currentYear.fiscalYear}) को शीर्षक सम्पादन
            </h3>
            <form onSubmit={handleUpdateTitle} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  भर्पाई शीर्षक (Print & Header Title)
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  कैफियत / टिप्पणी (Remarks)
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="उदा. पहिलो चौमासिक निकासा"
                  className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-bold text-stone-800 bg-stone-200 hover:bg-stone-300 rounded"
              >
                शीर्षक परिवर्तन सुरक्षित गर्नुहोस्
              </button>
            </form>
          </div>

          {/* Section 3: Create New Fiscal Year (Clone with +1 Grade) */}
          <div className="border-t border-stone-200 pt-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Plus className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                नयाँ आर्थिक वर्ष थप्नुहोस् (Add New Year / Duplicate)
              </h3>
            </div>

            <form onSubmit={handleCreateYear} className="space-y-3 bg-emerald-50/40 p-4 rounded-lg border border-emerald-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    नयाँ आर्थिक वर्ष
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. २०८३/८४"
                    value={newFiscalYear}
                    onChange={(e) => setNewFiscalYear(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    भुक्तानी अवधि (महिना)
                  </label>
                  <select
                    value={newMonthsCount}
                    onChange={(e) => setNewMonthsCount(parseInt(e.target.value) || 3)}
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded font-medium"
                  >
                    <option value={1}>१ महिना (मासिक)</option>
                    <option value={3}>३ महिना (त्रैमासिक)</option>
                    <option value={4}>४ महिना (चौमासिक)</option>
                    <option value={12}>१२ महिना (वार्षिक)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    भर्पाई शीर्षक
                  </label>
                  <input
                    type="text"
                    value={newPeriodTitle}
                    onChange={(e) => setNewPeriodTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded"
                    required
                  />
                </div>
              </div>

              {/* Automatic +1 Grade Increment Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-increment-grade"
                  checked={incrementGrades}
                  onChange={(e) => setIncrementGrades(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="chk-increment-grade" className="text-xs text-stone-700">
                  <span className="font-bold text-stone-900">
                    सबै स्थायी शिक्षकहरूको १ ग्रेड थपेर नयाँ वर्ष बनाउने (Automatic +1 Grade Increment)
                  </span>
                  <p className="text-[11px] text-stone-500">
                    नयाँ वर्षमा स्थायी शिक्षकको स्वतः १ ग्रेड बढ्ने सरकारी नियम अनुसार गणना गरिन्छ।
                  </p>
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>नयाँ आर्थिक वर्ष सिर्जना गर्नुहोस्</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
