import React, { useState, useEffect } from 'react';
import { FiscalYearPayroll, SchoolInfo, TeacherRecord, NepaliMonth } from './types';
import { initialFiscalYears, initialSchoolInfo } from './data/initialData';
import { calculateTeacherPayroll, getMaxGradeForDesignation } from './utils/calculations';
import { sanitizeFiscalYears } from './utils/sanitizeData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { PayrollTable } from './components/PayrollTable';
import { MonthlyDashboard } from './components/MonthlyDashboard';
import { MonthlyPrintView } from './components/MonthlyPrintView';
import { TeacherModal } from './components/TeacherModal';
import { YearPeriodModal } from './components/YearPeriodModal';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { PrintView } from './components/PrintView';
import { GradeSplit9_3View } from './components/GradeSplit9_3View';
import { PartialSalaryModal } from './components/PartialSalaryModal';
import { exportPayrollToCsv } from './utils/exportExcel';

const STORAGE_KEY_YEARS = 'nepal_school_payroll_years_v2';
const STORAGE_KEY_SCHOOL = 'nepal_school_payroll_info_v1';
const STORAGE_KEY_DIGITS = 'nepal_school_payroll_digits_v1';
const STORAGE_KEY_TAB = 'nepal_school_payroll_tab_v1';

export default function App() {
  // 1. Fiscal Years State (saved in localStorage)
  const [fiscalYears, setFiscalYears] = useState<FiscalYearPayroll[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_YEARS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeFiscalYears(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load years from localStorage', e);
    }
    return sanitizeFiscalYears(initialFiscalYears);
  });

  // 2. Active Fiscal Year
  const [selectedYear, setSelectedYear] = useState<string>('२०८२/८३');

  // 3. Active Tab: 'monthly' vs 'register' vs 'grade-split'
  const [activeTab, setActiveTab] = useState<'register' | 'monthly' | 'grade-split'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TAB);
      if (saved === 'register' || saved === 'monthly' || saved === 'grade-split') return saved;
    } catch (e) {
      // default
    }
    return 'monthly'; // Open monthly dashboard directly
  });

  // 4. School Details State
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCHOOL);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load schoolInfo', e);
    }
    return initialSchoolInfo;
  });

  // 5. Formatting & Calculation preferences
  const [useNepaliDigits, setUseNepaliDigits] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DIGITS);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      // default
    }
    return true; // Default to authentic Nepali digits
  });

  const [autoCalculate, setAutoCalculate] = useState<boolean>(true);

  // 6. Modal States
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherRecord | null>(null);
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);
  const [printMonthlyMonth, setPrintMonthlyMonth] = useState<NepaliMonth | null>(null);
  const [isPartialSalaryModalOpen, setIsPartialSalaryModalOpen] = useState(false);
  const [partialSalaryTeacherId, setPartialSalaryTeacherId] = useState<string | undefined>(undefined);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Save to localStorage when states update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TAB, activeTab);
    } catch (e) {
      console.error('Failed to save tab', e);
    }
  }, [activeTab]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_YEARS, JSON.stringify(fiscalYears));
    } catch (e) {
      console.error('Failed to save years', e);
    }
  }, [fiscalYears]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCHOOL, JSON.stringify(schoolInfo));
    } catch (e) {
      console.error('Failed to save schoolInfo', e);
    }
  }, [schoolInfo]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DIGITS, JSON.stringify(useNepaliDigits));
    } catch (e) {
      console.error('Failed to save digits preference', e);
    }
  }, [useNepaliDigits]);

  // Current active payroll year record
  const currentPayroll = fiscalYears.find((y) => y.fiscalYear === selectedYear) || fiscalYears[0];

  // Handler: Change Months Count (e.g. 1 month, 3 months, 4 months, 12 months)
  const handleChangeMonthsCount = (months: number) => {
    setFiscalYears((prev) =>
      prev.map((yr) => {
        if (yr.fiscalYear === currentPayroll.fiscalYear) {
          const recalculatedTeachers = yr.teachers.map((t) =>
            calculateTeacherPayroll(t, months, autoCalculate, {
              includeDashain: yr.includeDashain ?? true,
              includePoshak: yr.includePoshak ?? true
            })
          );
          return {
            ...yr,
            monthsCount: months,
            teachers: recalculatedTeachers
          };
        }
        return yr;
      })
    );
  };

  // Handler: Toggle Dashain Allowance in Period Gross
  const handleToggleDashain = () => {
    const nextDashain = !(currentPayroll.includeDashain ?? true);
    setFiscalYears((prev) =>
      prev.map((yr) => {
        if (yr.fiscalYear === currentPayroll.fiscalYear) {
          const recalculated = yr.teachers.map((t) =>
            calculateTeacherPayroll(t, yr.monthsCount, autoCalculate, {
              includeDashain: nextDashain,
              includePoshak: yr.includePoshak ?? true
            })
          );
          return {
            ...yr,
            includeDashain: nextDashain,
            teachers: recalculated
          };
        }
        return yr;
      })
    );
  };

  // Handler: Toggle Poshak Allowance in Period Gross
  const handleTogglePoshak = () => {
    const nextPoshak = !(currentPayroll.includePoshak ?? true);
    setFiscalYears((prev) =>
      prev.map((yr) => {
        if (yr.fiscalYear === currentPayroll.fiscalYear) {
          const recalculated = yr.teachers.map((t) =>
            calculateTeacherPayroll(t, yr.monthsCount, autoCalculate, {
              includeDashain: yr.includeDashain ?? true,
              includePoshak: nextPoshak
            })
          );
          return {
            ...yr,
            includePoshak: nextPoshak,
            teachers: recalculated
          };
        }
        return yr;
      })
    );
  };

  // Handler: Select Quarter (प्रथम त्रैमासिक = साउन दसैं भत्ता सहित, तेस्रो = चैत पोशाक सहित, ९ महिना / ३ महिना)
  const handleSelectQuarter = (
    quarter: 'first' | 'second' | 'third' | 'fourth' | 'yearly' | 'nine_months' | 'three_months'
  ) => {
    let incDashain = false;
    let incPoshak = false;
    let months = 3;
    let title = currentPayroll.periodTitle;

    if (quarter === 'first') {
      incDashain = true;
      incPoshak = false;
      months = 3;
      title = 'प्रथम त्रैमासिक (साउनदेखि असोजसम्म) को तलबी भर्पाई';
    } else if (quarter === 'second') {
      incDashain = false;
      incPoshak = false;
      months = 3;
      title = 'दोस्रो त्रैमासिक (कात्तिकदेखि पुससम्म) को तलबी भर्पाई';
    } else if (quarter === 'third') {
      incDashain = false;
      incPoshak = true;
      months = 3;
      title = 'तेस्रो त्रैमासिक (माघदेखि चैतसम्म) को तलबी भर्पाई';
    } else if (quarter === 'fourth') {
      incDashain = false;
      incPoshak = false;
      months = 3;
      title = 'चौथो त्रैमासिक (वैशाखदेखि असारसम्म) को तलबी भर्पाई';
    } else if (quarter === 'nine_months') {
      incDashain = true;
      incPoshak = true;
      months = 9;
      title = 'साउनदेखि चैतसम्म (९ महिना) को तलबी भर्पाई';
    } else if (quarter === 'three_months') {
      incDashain = false;
      incPoshak = false;
      months = 3;
      title = 'वैशाखदेखि असारसम्म (३ महिना - नयाँ ग्रेड) को तलबी भर्पाई';
    } else if (quarter === 'yearly') {
      incDashain = true;
      incPoshak = true;
      months = 12;
      title = 'वार्षिक (१२ महिना) को तलबी भर्पाई';
    }

    setFiscalYears((prev) =>
      prev.map((yr) => {
        if (yr.fiscalYear === currentPayroll.fiscalYear) {
          const recalculated = yr.teachers.map((t) =>
            calculateTeacherPayroll(t, months, autoCalculate, {
              includeDashain: incDashain,
              includePoshak: incPoshak,
              quarter: quarter,
              useBaisakhGrade: quarter === 'three_months'
            })
          );
          return {
            ...yr,
            selectedQuarter: quarter,
            includeDashain: incDashain,
            includePoshak: incPoshak,
            monthsCount: months,
            periodTitle: title,
            teachers: recalculated
          };
        }
        return yr;
      })
    );
  };

  // Handler: Apply partial duration (months & days) to a teacher
  const handleApplyDurationToTeacher = (teacherId: string, months: number, days: number) => {
    setFiscalYears((prev) =>
      prev.map((yr) => {
        if (yr.fiscalYear === currentPayroll.fiscalYear) {
          const updatedTeachers = yr.teachers.map((t) => {
            if (t.id === teacherId) {
              const p1 = Math.min(9, months);
              const p1d = months <= 9 ? days : 0;
              const p2 = months > 9 ? Math.min(3, months - 9) : 0;
              const p2d = months > 9 ? days : 0;
              const updated = {
                ...t,
                customMonths: months,
                customDays: days,
                customDurationLabel: `${months} महिना ${days} दिन`,
                period1Months: p1,
                period1Days: p1d,
                period2Months: p2,
                period2Days: p2d
              };
              return calculateTeacherPayroll(updated, yr.monthsCount, autoCalculate, {
                includeDashain: yr.includeDashain ?? true,
                includePoshak: yr.includePoshak ?? true,
                quarter: yr.selectedQuarter as any,
                useBaisakhGrade: yr.selectedQuarter === 'three_months',
                months,
                days
              });
            }
            return t;
          });
          return {
            ...yr,
            teachers: updatedTeachers
          };
        }
        return yr;
      })
    );
  };

  // Handler: Save Teacher (Add new or Update existing)
  const handleSaveTeacher = (teacher: TeacherRecord) => {
    setFiscalYears((prev) =>
      prev.map((yr) => {
        if (yr.fiscalYear === currentPayroll.fiscalYear) {
          const calculated = calculateTeacherPayroll(teacher, yr.monthsCount, autoCalculate, {
            includeDashain: yr.includeDashain ?? true,
            includePoshak: yr.includePoshak ?? true,
            quarter: yr.selectedQuarter as any,
            useBaisakhGrade: yr.selectedQuarter === 'three_months'
          });
          const exists = yr.teachers.some((t) => t.id === calculated.id);
          let updatedTeachers: TeacherRecord[];
          if (exists) {
            updatedTeachers = yr.teachers.map((t) => (t.id === calculated.id ? calculated : t));
          } else {
            let uniqueId = calculated.id;
            if (!uniqueId || yr.teachers.some((t) => t.id === uniqueId)) {
              uniqueId = `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
            }
            updatedTeachers = [...yr.teachers, { ...calculated, id: uniqueId }];
          }
          // Sort by S.N.
          updatedTeachers.sort((a, b) => a.sn - b.sn);
          return {
            ...yr,
            teachers: updatedTeachers
          };
        }
        return yr;
      })
    );
  };

  // Handler: Delete Teacher
  const handleDeleteTeacher = (id: string) => {
    const teacher = currentPayroll.teachers.find((t) => t.id === id);
    const teacherName = teacher ? teacher.name : 'यो शिक्षक';
    if (confirm(`के तपाईं "${teacherName}" को रेकर्ड हटाउन निश्चित हुनुहुन्छ?`)) {
      setFiscalYears((prev) =>
        prev.map((yr) => {
          if (yr.fiscalYear === currentPayroll.fiscalYear) {
            const filtered = yr.teachers.filter((t) => t.id !== id);
            // Re-assign S.N. cleanly
            const reNumbered = filtered.map((t, idx) => ({ ...t, sn: idx + 1 }));
            return {
              ...yr,
              teachers: reNumbered
            };
          }
          return yr;
        })
      );
    }
  };

  // Handler: Increment +1 Grade to all teachers in active year respecting legal designation caps
  const handleIncrementAllGrades = () => {
    if (
      confirm(
        `के तपाईं आ.व. ${currentPayroll.fiscalYear} का सबै स्थायी शिक्षकहरूको १ ग्रेड थप्न (अधिकतम ग्रेड सीमा अनुसार) र तलब स्वतः हिसाब गर्न चाहनुहुन्छ?`
      )
    ) {
      setFiscalYears((prev) =>
        prev.map((yr) => {
          if (yr.fiscalYear === currentPayroll.fiscalYear) {
            const updatedTeachers = yr.teachers.map((t) => {
              if (t.category === 'permanent') {
                const maxGrade = getMaxGradeForDesignation(t.designation);
                const newGradeCount = Math.min(maxGrade, t.gradeCount + 1);
                const gradeRate = t.gradeRate || (newGradeCount > 0 ? Math.round(t.basicSalary / 30) : 0);
                const gradeAmount = newGradeCount * gradeRate;
                return calculateTeacherPayroll(
                  {
                    ...t,
                    gradeCount: newGradeCount,
                    gradeRate,
                    gradeAmount
                  },
                  yr.monthsCount,
                  true
                );
              }
              return t;
            });
            return {
              ...yr,
              teachers: updatedTeachers
            };
          }
          return yr;
        })
      );
    }
  };

  // Handler: Toggle Hide/Show Teacher (आवश्यकता अनुसार शिक्षक hide / show)
  const handleToggleHideTeacher = (id: string) => {
    setFiscalYears((prev) =>
      prev.map((yr) => {
        if (yr.fiscalYear === currentPayroll.fiscalYear) {
          const updatedTeachers = yr.teachers.map((t) =>
            t.id === id ? { ...t, isHidden: !t.isHidden } : t
          );
          return {
            ...yr,
            teachers: updatedTeachers
          };
        }
        return yr;
      })
    );
  };

  // Handler: Save New Year
  const handleSaveNewYear = (newYear: FiscalYearPayroll) => {
    setFiscalYears((prev) => [newYear, ...prev]);
    setSelectedYear(newYear.fiscalYear);
  };

  // Handler: Delete Year
  const handleDeleteYear = (year: string) => {
    if (fiscalYears.length <= 1) {
      alert('कम्तिमा एउटा आर्थिक वर्ष हुनुपर्दछ!');
      return;
    }
    setFiscalYears((prev) => prev.filter((y) => y.fiscalYear !== year));
    if (selectedYear === year) {
      const remaining = fiscalYears.filter((y) => y.fiscalYear !== year);
      setSelectedYear(remaining[0].fiscalYear);
    }
  };

  // Handler: Update Period Title
  const handleUpdatePeriodTitle = (title: string, notes?: string) => {
    setFiscalYears((prev) =>
      prev.map((yr) => {
        if (yr.fiscalYear === currentPayroll.fiscalYear) {
          return {
            ...yr,
            periodTitle: title,
            notes: notes !== undefined ? notes : yr.notes
          };
        }
        return yr;
      })
    );
  };

  // Handler: Reset to photo defaults
  const handleResetData = () => {
    if (
      confirm(
        'के तपाईं फोटो अनुसारको मूल डाटामा रिसेट गर्न चाहनुहुन्छ? यसले तपाईंका पछिल्ला परिवर्तनहरू मेटाउनेछ।'
      )
    ) {
      setFiscalYears(initialFiscalYears);
      setSelectedYear('२०८२/८३');
      setSchoolInfo(initialSchoolInfo);
      localStorage.removeItem(STORAGE_KEY_YEARS);
      localStorage.removeItem(STORAGE_KEY_SCHOOL);
    }
  };

  // Handler: Export CSV
  const handleExportCsv = () => {
    exportPayrollToCsv(currentPayroll, schoolInfo);
  };

  // Handler: Toggle auto calculate
  const handleToggleAutoCalc = () => {
    const next = !autoCalculate;
    setAutoCalculate(next);
    // Recalculate if toggling back to auto
    if (next) {
      setFiscalYears((prev) =>
        prev.map((yr) => {
          if (yr.fiscalYear === currentPayroll.fiscalYear) {
            return {
              ...yr,
              teachers: yr.teachers.map((t) =>
                calculateTeacherPayroll(t, yr.monthsCount, true)
              )
            };
          }
          return yr;
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-row font-sans text-stone-900">
      {/* 1. Left Sidebar (Showing all requested items on the left side) */}
      <Sidebar
        schoolInfo={schoolInfo}
        currentYear={currentPayroll}
        availableYears={fiscalYears}
        useNepaliDigits={useNepaliDigits}
        autoCalculate={autoCalculate}
        activeTab={activeTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onChangeTab={(tab) => setActiveTab(tab)}
        onSelectYear={(yr) => setSelectedYear(yr)}
        onToggleDigits={() => setUseNepaliDigits((prev) => !prev)}
        onToggleAutoCalc={handleToggleAutoCalc}
        onOpenTeacherModal={() => {
          setEditingTeacher(null);
          setIsTeacherModalOpen(true);
        }}
        onOpenYearModal={() => setIsYearModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onPrint={() => setIsPrintViewOpen(true)}
        onExportCsv={handleExportCsv}
        onResetData={handleResetData}
        onIncrementAllGrades={handleIncrementAllGrades}
        onChangeMonthsCount={handleChangeMonthsCount}
      />

      {/* 2. Main Content Container on the right */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header Bar */}
        <Header
          schoolInfo={schoolInfo}
          currentYear={currentPayroll}
          availableYears={fiscalYears}
          useNepaliDigits={useNepaliDigits}
          autoCalculate={autoCalculate}
          activeTab={activeTab}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          onChangeTab={(tab) => setActiveTab(tab)}
          onSelectYear={(yr) => setSelectedYear(yr)}
          onToggleDigits={() => setUseNepaliDigits((prev) => !prev)}
          onToggleAutoCalc={handleToggleAutoCalc}
          onOpenTeacherModal={() => {
            setEditingTeacher(null);
            setIsTeacherModalOpen(true);
          }}
          onOpenYearModal={() => setIsYearModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onPrint={() => setIsPrintViewOpen(true)}
          onExportCsv={handleExportCsv}
          onResetData={handleResetData}
          onIncrementAllGrades={handleIncrementAllGrades}
          onChangeMonthsCount={handleChangeMonthsCount}
          onOpenPartialSalaryModal={() => {
            setPartialSalaryTeacherId(undefined);
            setIsPartialSalaryModalOpen(true);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1">
        {activeTab === 'monthly' ? (
          /* Dedicated Monthly Dashboard with Dashain (Shrawan) & Poshak (Chaitra) */
          <div className="pt-3">
            <MonthlyDashboard
              teachers={currentPayroll.teachers}
              schoolInfo={schoolInfo}
              fiscalYear={currentPayroll.fiscalYear}
              useNepaliDigits={useNepaliDigits}
              onPrintMonthly={(month) => setPrintMonthlyMonth(month)}
            />
          </div>
        ) : activeTab === 'grade-split' ? (
          /* 9 Months (Old Grade) + 3 Months (New Grade from Baisakh 1) Split View */
          <div className="pt-3">
            <GradeSplit9_3View
              currentFiscalYear={currentPayroll}
              teachers={currentPayroll.teachers}
              schoolInfo={schoolInfo}
              fiscalYear={currentPayroll.fiscalYear}
              useNepaliDigits={useNepaliDigits}
              onUpdateTeacher={handleSaveTeacher}
              onClose={() => setActiveTab('register')}
            />
          </div>
        ) : (
          /* Photo Register View (Quarterly / Configurable Period) */
          <>
            {/* Quick Notification / Photo Banner */}
            <div className="max-w-[1700px] mx-auto px-4 sm:px-6 pt-3">
              <div className="bg-blue-50/80 border border-blue-200 text-blue-900 px-4 py-2 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                    फोटो प्रमाणित डाटा
                  </span>
                  <span className="font-medium">
                    तपाईंको फोटो अनुसार श्री मंगल सिंह मा.वि. को १९ जना शिक्षक/कर्मचारीको तलब स्केल, ग्रेड, कोष, भत्ता तथा कट्टी रकम समावेश गरिएको रजिस्टर।
                  </span>
                </div>
                <div className="flex items-center gap-2 font-medium text-stone-600 shrink-0">
                  <span>हालको अवधि: <b>{currentPayroll.monthsCount} महिना</b></span>
                  <span>•</span>
                  <span>आ.व.: <b className="text-blue-700">{currentPayroll.fiscalYear}</b></span>
                </div>
              </div>
            </div>

            {/* Summary Metric Cards */}
            <SummaryCards
              teachers={currentPayroll.teachers}
              monthsCount={currentPayroll.monthsCount}
              useNepaliDigits={useNepaliDigits}
            />

            {/* The Master Payroll Sheet Table */}
            <PayrollTable
              teachers={currentPayroll.teachers}
              monthsCount={currentPayroll.monthsCount}
              useNepaliDigits={useNepaliDigits}
              schoolInfo={schoolInfo}
              periodTitle={currentPayroll.periodTitle}
              fiscalYear={currentPayroll.fiscalYear}
              includeDashain={currentPayroll.includeDashain ?? true}
              includePoshak={currentPayroll.includePoshak ?? true}
              selectedQuarter={currentPayroll.selectedQuarter || 'first'}
              onToggleDashain={handleToggleDashain}
              onTogglePoshak={handleTogglePoshak}
              onSelectQuarter={handleSelectQuarter}
              onEditTeacher={(teacher) => {
                setEditingTeacher(teacher);
                setIsTeacherModalOpen(true);
              }}
              onDeleteTeacher={handleDeleteTeacher}
              onToggleHideTeacher={handleToggleHideTeacher}
              onOpenGradeSplitView={() => setActiveTab('grade-split')}
            />
          </>
        )}
      </main>
      </div>

      {/* Modals */}
      <TeacherModal
        isOpen={isTeacherModalOpen}
        onClose={() => {
          setIsTeacherModalOpen(false);
          setEditingTeacher(null);
        }}
        onSave={handleSaveTeacher}
        initialTeacher={editingTeacher}
        nextSn={currentPayroll.teachers.length + 1}
        monthsCount={currentPayroll.monthsCount}
        useNepaliDigits={useNepaliDigits}
      />

      <YearPeriodModal
        isOpen={isYearModalOpen}
        onClose={() => setIsYearModalOpen(false)}
        availableYears={fiscalYears}
        currentYear={currentPayroll}
        onSelectYear={(yr) => setSelectedYear(yr)}
        onSaveNewYear={handleSaveNewYear}
        onDeleteYear={handleDeleteYear}
        onUpdatePeriodTitle={handleUpdatePeriodTitle}
      />

      <SchoolSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        schoolInfo={schoolInfo}
        onSave={(info) => setSchoolInfo(info)}
      />

      {/* Full Period Register Print View */}
      <PrintView
        isOpen={isPrintViewOpen}
        onClose={() => setIsPrintViewOpen(false)}
        currentYear={currentPayroll}
        schoolInfo={schoolInfo}
        useNepaliDigits={useNepaliDigits}
      />

      {/* Monthly Report Print View */}
      {printMonthlyMonth && (
        <MonthlyPrintView
          isOpen={true}
          onClose={() => setPrintMonthlyMonth(null)}
          month={printMonthlyMonth}
          teachers={currentPayroll.teachers}
          schoolInfo={schoolInfo}
          fiscalYear={currentPayroll.fiscalYear}
          useNepaliDigits={useNepaliDigits}
        />
      )}

      {/* Partial Salary Modal (१ महिना १७ दिन वा अन्य आंशिक दिनको तलब हिसाब) */}
      <PartialSalaryModal
        isOpen={isPartialSalaryModalOpen}
        onClose={() => {
          setIsPartialSalaryModalOpen(false);
          setPartialSalaryTeacherId(undefined);
        }}
        teachers={currentPayroll.teachers}
        schoolInfo={schoolInfo}
        fiscalYear={currentPayroll.fiscalYear}
        selectedTeacherId={partialSalaryTeacherId}
        onApplyDurationToTeacher={handleApplyDurationToTeacher}
      />
    </div>
  );
}

