import React, { useState, useEffect } from 'react';
import { X, Calculator, HelpCircle, Save, Info } from 'lucide-react';
import { TeacherRecord } from '../types';
import { calculateTeacherPayroll, getMaxGradeForDesignation } from '../utils/calculations';
import { formatNepaliCurrency } from '../utils/nepaliNumber';
import { getYearScaleConfig } from '../data/initialData';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacher: TeacherRecord) => void;
  initialTeacher?: TeacherRecord | null;
  nextSn: number;
  monthsCount: number;
  useNepaliDigits: boolean;
  currentFiscalYear?: string;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTeacher,
  nextSn,
  monthsCount,
  useNepaliDigits,
  currentFiscalYear = '२०८२/८३'
}) => {
  const is2083 = currentFiscalYear.includes('२०८३') || currentFiscalYear.includes('2083');
  const defaultScale = getYearScaleConfig(currentFiscalYear, 'मा.वि. तृतीय');

  const [formData, setFormData] = useState<TeacherRecord>({
    id: '',
    sn: nextSn,
    name: '',
    designation: 'मा.वि. तृतीय',
    category: 'permanent',
    basicSalary: defaultScale.basicSalary || (is2083 ? 48058 : 43689),
    gradeCount: 0,
    gradeRate: defaultScale.gradeRate || (is2083 ? 1602 : 1456),
    gradeAmount: 0,
    koshThap: Math.round((defaultScale.basicSalary || (is2083 ? 48058 : 43689)) * 0.10 * 100) / 100,
    bimaThap: 400,
    praABhatta: 0,
    mahangiBhatta: 5000,
    protsahanBhatta: 0,
    anyaBhatta: 0,
    koshKatti: Math.round((defaultScale.basicSalary || (is2083 ? 48058 : 43689)) * 0.20 * 100) / 100,
    bimaKatti: 800,
    citKatti: 0,
    dashainPoshakBhatta: 0
  });

  const [autoCalculateFields, setAutoCalculateFields] = useState(true);

  useEffect(() => {
    if (initialTeacher) {
      setFormData(initialTeacher);
    } else {
      // Default new teacher template with current fiscal year scale
      const pravaScale = getYearScaleConfig(currentFiscalYear, 'प्रा.वि. तृतीय');
      const baseSalary = pravaScale.basicSalary || (is2083 ? 36192 : 32902);
      const gRate = pravaScale.gradeRate || (is2083 ? 1206 : 1097);
      const base: TeacherRecord = {
        id: `t-${Date.now()}`,
        sn: nextSn,
        name: '',
        designation: 'प्रा.वि. तृतीय',
        category: 'permanent',
        basicSalary: baseSalary,
        gradeCount: 1,
        gradeRate: gRate,
        gradeAmount: gRate,
        koshThap: Math.round((baseSalary + gRate) * 0.10 * 100) / 100,
        bimaThap: 400,
        praABhatta: 0,
        mahangiBhatta: 5000,
        protsahanBhatta: Math.round(baseSalary * 0.10 * 100) / 100, // स्केलको १०% स्वतः भरिने
        anyaBhatta: 0,
        koshKatti: Math.round((baseSalary + gRate) * 0.20 * 100) / 100,
        bimaKatti: 800,
        citKatti: 4000,
        dashainBhatta: Math.round(baseSalary + gRate),
        poshakBhatta: 10000,
        dashainPoshakBhatta: Math.round(baseSalary + gRate + 10000)
      };
      setFormData(calculateTeacherPayroll(base, monthsCount, true));
    }
  }, [initialTeacher, nextSn, isOpen, monthsCount, currentFiscalYear, is2083]);

  if (!isOpen) return null;

  // Handle number input changes
  const handleNumberChange = (field: keyof TeacherRecord, value: string) => {
    const parsed = parseFloat(value) || 0;
    const updated = { ...formData, [field]: parsed };
    
    // तलब स्केल परिवर्तन हुँदा स्वतः हिसाब अन भएमा प्रोत्साहन भत्ता स्केलको १०% हुने
    if (field === 'basicSalary' && autoCalculateFields) {
      updated.protsahanBhatta = Math.round(parsed * 0.10 * 100) / 100;
    }

    if (autoCalculateFields) {
      setFormData(calculateTeacherPayroll(updated, monthsCount, true));
    } else {
      setFormData(calculateTeacherPayroll(updated, monthsCount, false));
    }
  };

  const handleSelectDesignation = (desig: string) => {
    let category = formData.category;
    let bima = formData.bimaThap;

    const scaleConfig = getYearScaleConfig(currentFiscalYear, desig, formData.name);
    let basic = scaleConfig.basicSalary || formData.basicSalary;
    let gradeRate = scaleConfig.gradeRate || Math.round(basic / 30);

    if (desig.includes('मा.वि.') || desig.includes('नि.मा.वि.') || desig.includes('प्रा.वि.')) {
      if (!desig.includes('राहत') && !desig.includes('नगर')) {
        category = 'permanent';
        bima = 400;
      }
    } else if (desig.includes('राहत')) {
      category = 'relief';
      bima = 0;
    } else if (desig.includes('नगर')) {
      category = 'municipal';
      bima = 0;
    } else if (desig.includes('लेखापाल') || desig.includes('सहयोगी') || desig.includes('स.का.') || desig.includes('श्रेणी विहीन')) {
      category = 'staff';
      bima = 0;
    }

    const isPerm = category === 'permanent';
    const updated = {
      ...formData,
      designation: desig,
      category,
      basicSalary: basic,
      bimaThap: isPerm ? bima : 0,
      bimaKatti: isPerm ? 800 : 0,
      koshThap: isPerm ? formData.koshThap : 0,
      koshKatti: isPerm ? formData.koshKatti : 0,
      gradeRate: isPerm ? gradeRate : 0,
      protsahanBhatta: Math.round(basic * 0.10 * 100) / 100 // स्केलको १०% स्वतः
    };

    setFormData(calculateTeacherPayroll(updated, monthsCount, autoCalculateFields));
  };

  const handleCategoryChange = (newCat: TeacherRecord['category']) => {
    const isPerm = newCat === 'permanent';
    const updated = {
      ...formData,
      category: newCat,
      koshThap: isPerm ? formData.koshThap : 0,
      koshKatti: isPerm ? formData.koshKatti : 0,
      bimaThap: isPerm ? (formData.bimaThap || 400) : 0,
      bimaKatti: isPerm ? (formData.bimaKatti || 800) : 0
    };
    setFormData(calculateTeacherPayroll(updated, monthsCount, autoCalculateFields));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('कृपया शिक्षक वा कर्मचारीको नाम अनिवार्य लेख्नुहोस्!');
      return;
    }
    const finalCalculated = calculateTeacherPayroll(formData, monthsCount, autoCalculateFields);
    onSave(finalCalculated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-stone-300">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              {initialTeacher ? 'शिक्षक / कर्मचारी विवरण सम्पादन' : 'नयाँ शिक्षक / कर्मचारी थप्नुहोस्'}
            </h2>
            <p className="text-xs text-stone-500">
              तलबी भर्पाईको नियम अनुसार स्वतः हिसाब हुनेछ
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Section 1: Basic Information */}
          <div>
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
              १. आधारभूत विवरण
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  क्र. सं. (S.N.)
                </label>
                <input
                  type="number"
                  value={formData.sn}
                  onChange={(e) => setFormData({ ...formData, sn: parseInt(e.target.value) || 1 })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  शिक्षक / कर्मचारीको नाम <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="उदा. सन्तलाल सोरेन"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded font-medium focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  पद / श्रेणी ({currentFiscalYear} तलब स्केल)
                </label>
                <select
                  value={formData.designation}
                  onChange={(e) => handleSelectDesignation(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded font-medium focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  {is2083 ? (
                    <>
                      <option value="मा.वि. तृतीय">मा.वि. तृतीय (Scale: ४८,०५८ | ग्रेड: १,६०२ | सिमा: ८)</option>
                      <option value="मा.वि. द्वितीय">मा.वि. द्वितीय (Scale: ५२,२७० | सिमा: ८)</option>
                      <option value="नि.मा.वि. तृतीय">नि.मा.वि. तृतीय (Scale: ३८,२०३ | ग्रेड: १,२७३ | सिमा: ८)</option>
                      <option value="प्रा.वि. द्वितीय">प्रा.वि. द्वितीय (Scale: ३८,२०३ | ग्रेड: १,२७३ | सिमा: ८)</option>
                      <option value="प्रा.वि. तृतीय">प्रा.वि. तृतीय (Scale: ३६,१९२ | ग्रेड: १,२०६ | सिमा: ६)</option>
                    </>
                  ) : (
                    <>
                      <option value="मा.वि. तृतीय">मा.वि. तृतीय (Scale: ४३,६८९ | ग्रेड: १,४५६ | सिमा: ८)</option>
                      <option value="मा.वि. द्वितीय">मा.वि. द्वितीय (Scale: ४७,३८० | सिमा: ८)</option>
                      <option value="नि.मा.वि. तृतीय">नि.मा.वि. तृतीय (Scale: ३४,७३० | ग्रेड: १,१५८ | सिमा: ८)</option>
                      <option value="नि.मा.वि. द्वितीय">नि.मा.वि. द्वितीय (Scale: ३८,४४० | सिमा: ८)</option>
                      <option value="प्रा.वि. द्वितीय">प्रा.वि. द्वितीय (Scale: ३४,७३० | ग्रेड: १,१५८ | सिमा: ८)</option>
                      <option value="प्रा.वि. तृतीय">प्रा.वि. तृतीय (Scale: ३२,९०२ | ग्रेड: १,०९७ | सिमा: ६)</option>
                    </>
                  )}
                  <option value="लेखापाल">लेखापाल (Scale: १८,०००)</option>
                  <option value="का. सहयोगी">का. सहयोगी (Scale: १७,५००)</option>
                  <option value="स.का.">स.का. (Scale: १६,०००)</option>
                  <option value="श्रेणी विहीन">श्रेणी विहीन (Scale: १३,०००)</option>
                  <option value="नगर शिक्षक">नगर शिक्षक (Scale: १७,०००)</option>
                  <option value="राहत शिक्षक">राहत शिक्षक ({is2083 ? '३८,२०३ / ३६,१९२' : '३४,७३० / ३२,९०२'})</option>
                  <option value="अन्य">अन्य पद</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  तलब स्केल (महिनाको Basic)
                </label>
                <input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => handleNumberChange('basicSalary', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded font-mono font-medium focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  प्रकार (Category)
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded focus:ring-1 focus:ring-blue-500 bg-white font-medium"
                >
                  <option value="permanent">स्थायी (क. कोष + बिमा लागू हुने)</option>
                  <option value="contract">करार / अस्थायी (क. कोष हुँदैन)</option>
                  <option value="relief">राहत (क. कोष हुँदैन)</option>
                  <option value="municipal">नगर शिक्षक (क. कोष हुँदैन)</option>
                  <option value="staff">कर्मचारी / सहयोगी (क. कोष हुँदैन)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Grades & Addition */}
          <div className="pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                २. ग्रेड र सरकारी थप रकम
              </h3>
              <label className="inline-flex items-center gap-1.5 text-xs text-blue-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCalculateFields}
                  onChange={(e) => setAutoCalculateFields(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>स्वतः हिसाब (Auto Compute)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-blue-50/40 p-3 rounded-lg border border-blue-100">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-stone-700">
                    ग्रेड संख्या
                  </label>
                  {formData.category === 'permanent' && (
                    <span className="text-[10px] font-semibold text-blue-700">
                      अधिकतम: {getMaxGradeForDesignation(formData.designation)}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={formData.gradeCount}
                  onChange={(e) => handleNumberChange('gradeCount', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded font-mono focus:ring-1 focus:ring-blue-500 bg-white"
                />
                {formData.category === 'permanent' && formData.gradeCount >= getMaxGradeForDesignation(formData.designation) && (
                  <p className="text-[10px] text-amber-700 mt-0.5 leading-tight">
                    * अधिकतम सीमा पुगेको (ग्रेड वृद्धि नहुने)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  ग्रेड दर (१ दिनको तलब)
                </label>
                <input
                  type="number"
                  value={formData.gradeRate}
                  onChange={(e) => handleNumberChange('gradeRate', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded font-mono focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  ग्रेड जम्मा रकम
                </label>
                <input
                  type="number"
                  readOnly={autoCalculateFields}
                  value={formData.gradeAmount}
                  onChange={(e) => handleNumberChange('gradeAmount', e.target.value)}
                  className={`w-full text-xs px-3 py-2 border border-stone-300 rounded font-mono font-bold ${
                    autoCalculateFields ? 'bg-stone-100 text-stone-600' : 'bg-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  क. कोष थप (१०%)
                  {formData.category !== 'permanent' && (
                    <span className="text-[10px] text-rose-600 block font-normal">लागू हुँदैन (स्थायी मात्र)</span>
                  )}
                </label>
                <input
                  type="number"
                  disabled={formData.category !== 'permanent'}
                  readOnly={autoCalculateFields || formData.category !== 'permanent'}
                  value={formData.category === 'permanent' ? formData.koshThap : 0}
                  onChange={(e) => handleNumberChange('koshThap', e.target.value)}
                  className={`w-full text-xs px-3 py-2 border border-stone-300 rounded font-mono font-bold ${
                    formData.category !== 'permanent' 
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                      : autoCalculateFields ? 'bg-stone-100 text-stone-600' : 'bg-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Allowances (भत्ता) */}
          <div className="pt-2 border-t border-stone-200">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
              ३. भत्ताहरू ( Allowances )
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50/40 p-3 rounded-lg border border-amber-100">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  बिमा थप (रू ४००)
                </label>
                <input
                  type="number"
                  value={formData.bimaThap}
                  onChange={(e) => handleNumberChange('bimaThap', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded font-mono bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  प्र.अ. भत्ता
                </label>
                <input
                  type="number"
                  value={formData.praABhatta}
                  onChange={(e) => handleNumberChange('praABhatta', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded font-mono bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  महँगी भत्ता (रू ५,०००)
                </label>
                <input
                  type="number"
                  value={formData.mahangiBhatta}
                  onChange={(e) => handleNumberChange('mahangiBhatta', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded font-mono bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    प्रोत्साहन भत्ता (१०%)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const autoVal = Math.round((Number(formData.basicSalary) || 0) * 0.10 * 100) / 100;
                      handleNumberChange('protsahanBhatta', autoVal.toString());
                    }}
                    className="inline-flex items-center gap-1 text-[10px] text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded font-medium transition-colors cursor-pointer"
                    title="तलब स्केलको १०% स्वतः हिसाब गरी भर्नुहोस्"
                  >
                    <span>स्केलको १०% स्वतः</span>
                    <span className="font-mono font-bold">
                      (रू {Math.round((Number(formData.basicSalary) || 0) * 0.10)})
                    </span>
                  </button>
                </div>
                <input
                  type="number"
                  step="any"
                  value={formData.protsahanBhatta !== undefined ? formData.protsahanBhatta : ''}
                  onChange={(e) => handleNumberChange('protsahanBhatta', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded font-mono bg-white focus:ring-1 focus:ring-blue-500 font-medium text-stone-800"
                  placeholder={`१०% = रू ${Math.round((Number(formData.basicSalary) || 0) * 0.10)}`}
                />
                <div className="flex items-center justify-between mt-1 text-[10px] text-stone-500">
                  <span>स्केलको १०% स्वतः भरिने</span>
                  <span className="text-emerald-700 font-medium">म्यानुअल टाइप गर्न मिल्ने</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  अन्य भत्ता
                </label>
                <input
                  type="number"
                  value={formData.anyaBhatta}
                  onChange={(e) => handleNumberChange('anyaBhatta', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded font-mono bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Deductions (कट्टी रकम) */}
          <div className="pt-2 border-t border-stone-200">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
              ४. कट्टी रकमहरू ( Deductions )
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-rose-50/40 p-3 rounded-lg border border-rose-100">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  क. कोष कट्टी (२०%)
                  {formData.category !== 'permanent' && (
                    <span className="text-[10px] text-rose-600 block font-normal">लागू हुँदैन (स्थायी मात्र)</span>
                  )}
                </label>
                <input
                  type="number"
                  disabled={formData.category !== 'permanent'}
                  value={formData.category === 'permanent' ? formData.koshKatti : 0}
                  onChange={(e) => handleNumberChange('koshKatti', e.target.value)}
                  className={`w-full text-xs px-3 py-2 border border-stone-300 rounded font-mono ${
                    formData.category !== 'permanent' 
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                      : 'bg-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  बिमा कट्टी (रू ८००)
                </label>
                <input
                  type="number"
                  value={formData.bimaKatti}
                  onChange={(e) => handleNumberChange('bimaKatti', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded font-mono bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  सा. क. कोष / ना. ल. कोष
                </label>
                <input
                  type="number"
                  value={formData.citKatti}
                  onChange={(e) => handleNumberChange('citKatti', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded font-mono bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  अन्य कट्टी रकम
                </label>
                <input
                  type="number"
                  value={formData.otherKatti || 0}
                  onChange={(e) => handleNumberChange('otherKatti', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded font-mono bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Dashain & Poshak Allowance (दसैं साउनमा र पोशाक चैतमा) */}
          <div className="pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                ५. विशेष भत्ता (दसैं तथा पोशाक भत्ता - म्यानुअल प्रविष्टि)
              </h3>
              <span className="text-[11px] text-stone-500">म्यानुअल प्रविष्टि अनुसार हिसाब हुने</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/50 p-3 rounded-lg border border-amber-200">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-amber-950">
                    दसैं भत्ता रकम (रू.)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const std = (formData.basicSalary || 0) + (formData.gradeAmount || 0);
                      handleNumberChange('dashainBhatta', std.toString());
                    }}
                    className="text-[10px] text-amber-800 underline hover:text-amber-950"
                  >
                    १ महिनाको तलब+ग्रेड भर्नुहोस्
                  </button>
                </div>
                <input
                  type="number"
                  placeholder="० वा १ महिनाको तलब+ग्रेड"
                  value={formData.dashainBhatta !== undefined ? formData.dashainBhatta : ''}
                  onChange={(e) => handleNumberChange('dashainBhatta', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-amber-300 rounded font-mono bg-white font-bold"
                />
                <p className="text-[10px] text-amber-800/80 mt-0.5">साउन महिनाको तलब निकासामा समावेश हुन्छ</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-emerald-950">
                    पोशाक भत्ता रकम (रू.)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleNumberChange('poshakBhatta', '10000')}
                    className="text-[10px] text-emerald-800 underline hover:text-emerald-950"
                  >
                    नियम अनुसार रू १०,००० भर्नुहोस्
                  </button>
                </div>
                <input
                  type="number"
                  placeholder="० वा रू १०,०००"
                  value={formData.poshakBhatta !== undefined ? formData.poshakBhatta : ''}
                  onChange={(e) => handleNumberChange('poshakBhatta', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-emerald-300 rounded font-mono bg-white font-bold"
                />
                <p className="text-[10px] text-emerald-800/80 mt-0.5">चैत महिनाको तलब निकासामा समावेश हुन्छ</p>
              </div>
            </div>
          </div>

          {/* Section 6: Baisakh Grade Change (साउन-चैत ९ महिना र वैशाख-असार ३ महिना) */}
          <div className="pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                ६. वैशाख १ देखिको नयाँ ग्रेड संख्या (९ महिना / ३ महिना विभाजन)
              </h3>
              <span className="text-[11px] text-stone-500">वैशाखमा ग्रेड परिवर्तन हुने व्यवस्था</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-purple-50/50 p-3 rounded-lg border border-purple-200">
              <div>
                <label className="block text-xs font-bold text-purple-950 mb-1">
                  वैशाख १ देखिको नयाँ ग्रेड संख्या
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={25}
                    placeholder="उदा. ६"
                    value={formData.gradeCountBaisakh !== undefined ? formData.gradeCountBaisakh : ''}
                    onChange={(e) => handleNumberChange('gradeCountBaisakh', e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-purple-300 rounded font-mono bg-white font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const current = Number(formData.gradeCount) || 0;
                      handleNumberChange('gradeCountBaisakh', (current + 1).toString());
                    }}
                    className="px-2.5 py-2 text-xs font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded whitespace-nowrap border border-purple-300"
                  >
                    +१ ग्रेड थप्नुहोस्
                  </button>
                </div>
                <p className="text-[10px] text-purple-700 mt-1">
                  खाली छाडेमा स्वतः साउन-चैतको ग्रेड (वा स्थायीको हकमा +१) प्रयोग हुनेछ
                </p>
              </div>

              {/* Section 7: Partial month and days */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  विशेष आंशिक अवधि (उदा. १ महिना १७ दिन भुक्तानी)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    placeholder="महिना"
                    value={formData.customMonths !== undefined ? formData.customMonths : ''}
                    onChange={(e) => handleNumberChange('customMonths', e.target.value)}
                    className="w-1/2 text-xs px-2 py-2 border border-stone-300 rounded font-mono bg-white text-center"
                  />
                  <span className="text-xs font-semibold text-stone-500">महिना</span>
                  <input
                    type="number"
                    min={0}
                    max={29}
                    placeholder="दिन"
                    value={formData.customDays !== undefined ? formData.customDays : ''}
                    onChange={(e) => handleNumberChange('customDays', e.target.value)}
                    className="w-1/2 text-xs px-2 py-2 border border-stone-300 rounded font-mono bg-white text-center"
                  />
                  <span className="text-xs font-semibold text-stone-500">दिन</span>
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  नियमित ३ महिना बाहेक अन्य आंशिक दिन भुक्तानी गर्नुपर्दा मात्र भर्नुहोस्
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Real-time calculation preview card */}
          <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-300 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-stone-800 mb-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>स्वतः हिसाब पूर्वावलोकन ({monthsCount} महिनाको आधारमा):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-stone-700">
              <div>
                १ महिनाको जम्मा: <b className="font-mono font-bold text-stone-900">रू {formatNepaliCurrency(formData.monthlyGross, { nepaliDigits: useNepaliDigits })}</b>
              </div>
              <div>
                त्रैमासिक जम्मा: <b className="font-mono font-bold text-indigo-900">रू {formatNepaliCurrency(formData.periodGross, { nepaliDigits: useNepaliDigits })}</b>
              </div>
              <div>
                १% कर: <b className="font-mono font-bold text-amber-800">रू {formatNepaliCurrency(formData.tax1Percent, { nepaliDigits: useNepaliDigits })}</b>
              </div>
              <div className="text-emerald-800">
                खुद भुक्तानी: <b className="font-mono font-extrabold text-emerald-900">रू {formatNepaliCurrency(formData.periodNet, { nepaliDigits: useNepaliDigits })}</b>
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>सुरक्षित गर्नुहोस्</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
