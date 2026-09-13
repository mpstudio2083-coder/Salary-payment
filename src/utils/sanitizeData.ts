import { FiscalYearPayroll, TeacherRecord } from '../types';
import { initialFiscalYears, getYearScaleConfig } from '../data/initialData';
import { calculateTeacherPayroll, getMaxGradeForDesignation } from './calculations';

export const CANONICAL_TEACHER_ORDER = [
  'सन्तलाल सोरेन',
  'सुमन पोखरेल',
  'जीत बहादुर राई',
  'सुरेश कुमार मण्डल',
  'चिन्तामणी तिमसिरे',
  'भरतमान राई',
  'बुद्ध थापा',
  'धर्म राज महतो',
  'बिजय कुमार राजवंशी',
  'महेन्द्र प्रसाद चौलागाई',
  'बल बहादुर राई',
  'विनोद साह',
  'अमृता पोखरेल',
  'नन्दमाया सुब्बा',
  'हरी माया लिम्बु',
  'सपना राई',
  'कृष्ण प्रसाद रिजाल',
  'कुमारी राई',
  'गंगा माया राई',
  'राधिका कार्की',
  'सविन्द्र कुमारी राजवंशी',
  'बबिता गुरुगाई',
  'असिम राई'
];

/**
 * Sanitizes and deduplicates teachers in fiscal years.
 * Guarantees that every teacher in every fiscal year has a strictly unique `id`
 * and sequential `sn`, and aligns salary scales with government rules.
 */
export function sanitizeFiscalYears(rawYears: FiscalYearPayroll[]): FiscalYearPayroll[] {
  if (!Array.isArray(rawYears) || rawYears.length === 0) {
    return initialFiscalYears;
  }

  // Filter out any un-entered placeholder years (like old 2080 or 2081 if not customized by user)
  let yearsList = rawYears.filter(y => {
    if (y.fiscalYear === '२०८०/८१' || y.fiscalYear === '२०८१/८२') {
      return false;
    }
    return Boolean(y.fiscalYear);
  });

  if (yearsList.length === 0) {
    yearsList = initialFiscalYears;
  }

  // Ensure 2083/84 exists
  const has2083 = yearsList.some((y) => y.fiscalYear && y.fiscalYear.includes('२०८३'));
  if (!has2083) {
    const year2083 = initialFiscalYears.find((y) => y.fiscalYear.includes('२०८३'));
    if (year2083) {
      yearsList = [...yearsList, year2083];
    }
  }

  const sanitizedYears: FiscalYearPayroll[] = yearsList.map((yr, yearIdx) => {
    const initialYr = initialFiscalYears.find((iy) => iy.fiscalYear === yr.fiscalYear);
    const existingTeachers = Array.isArray(yr.teachers) ? yr.teachers : [];

    const uniqueTeachers: TeacherRecord[] = [];
    const seenNames = new Set<string>();
    const seenIds = new Set<string>();

    const is2083 = yr.fiscalYear.includes('२०८३') || yr.fiscalYear.includes('2083');
    const is2082 = yr.fiscalYear.includes('२०८२') || yr.fiscalYear.includes('2082');

    // 1. Process existing teachers, updating salary scale if necessary and removing duplicate names
    existingTeachers.forEach((t, idx) => {
      const trimmedName = (t.name || '').trim();
      if (!trimmedName) return;

      // Deduplicate if identical name appears multiple times in the same fiscal year
      if (seenNames.has(trimmedName)) {
        return;
      }
      seenNames.add(trimmedName);

      // Ensure unique ID
      let uniqueId = t.id;
      if (!uniqueId || seenIds.has(uniqueId)) {
        uniqueId = `t-${yr.fiscalYear.replace(/[^0-9]/g, '') || yearIdx}-${idx + 1}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      }
      seenIds.add(uniqueId);

      let teacherData = { ...t, id: uniqueId, sn: idx + 1 };

      // Apply government scale upgrades
      if (is2082) {
        // Upgrade Ma.Vi. scale from 43680 to 43689
        if (teacherData.designation?.includes('मा.वि.') && !teacherData.designation.includes('नि.मा.वि.') && !teacherData.designation.includes('प्रा.वि.')) {
          if (teacherData.basicSalary === 43680 || !teacherData.basicSalary) {
            teacherData.basicSalary = 43689;
            teacherData.gradeRate = 1456;
            teacherData = calculateTeacherPayroll(teacherData, yr.monthsCount, true);
          }
        }
      } else if (is2083) {
        // Apply 2083/84 salary scales & grade rate
        const scaleConfig = getYearScaleConfig('२०८३/८४', teacherData.designation, teacherData.name);
        if (scaleConfig.basicSalary > 0) {
          // If teacher still has old 2082 scale, update to 2083 scale
          if (teacherData.basicSalary < scaleConfig.basicSalary || teacherData.basicSalary === 43680 || teacherData.basicSalary === 43689) {
            teacherData.basicSalary = scaleConfig.basicSalary;
            teacherData.gradeRate = scaleConfig.gradeRate;
            
            // Respect legal grade limits: "yo samma hune ko grad bridhhi nagarnu"
            const maxGrade = scaleConfig.maxGrade || getMaxGradeForDesignation(teacherData.designation);
            if (teacherData.category === 'permanent') {
              if (teacherData.gradeCount > maxGrade) {
                teacherData.gradeCount = maxGrade;
              }
            }
            teacherData.gradeAmount = teacherData.gradeCount * teacherData.gradeRate;
            teacherData = calculateTeacherPayroll(teacherData, yr.monthsCount, true);
          }
        }
      }

      // Auto-fill Protsahan Bhatta as 10% of scale ONLY for permanent staff; non-permanent is 0
      if (teacherData.category === 'permanent') {
        if (teacherData.protsahanBhatta === undefined || teacherData.protsahanBhatta === 0 || teacherData.protsahanBhatta === null) {
          teacherData.protsahanBhatta = Math.round(teacherData.basicSalary * 0.10 * 100) / 100;
          teacherData = calculateTeacherPayroll(teacherData, yr.monthsCount, true);
        }
      } else {
        if (teacherData.protsahanBhatta !== 0) {
          teacherData.protsahanBhatta = 0;
          teacherData = calculateTeacherPayroll(teacherData, yr.monthsCount, true);
        }
        if (teacherData.gradeCount !== 0) {
          teacherData.gradeCount = 0;
          teacherData.gradeAmount = 0;
          teacherData = calculateTeacherPayroll(teacherData, yr.monthsCount, true);
        }
      }

      // सा. क. कोष / ना. ल. कोष स्वतः आउने रकम हटाउने (Clear auto-filled CIT / Kalyan Kosh deduction)
      if (teacherData.citKatti && teacherData.citKatti > 0) {
        teacherData.citKatti = 0;
        teacherData = calculateTeacherPayroll(teacherData, yr.monthsCount, true);
      }

      uniqueTeachers.push(teacherData);
    });

    // 2. If initialYr has default teachers that don't exist yet, add them safely
    if (initialYr && Array.isArray(initialYr.teachers)) {
      initialYr.teachers.forEach((it, itIdx) => {
        const trimmed = (it.name || '').trim();
        if (trimmed && !seenNames.has(trimmed)) {
          seenNames.add(trimmed);
          let uniqueId = it.id;
          if (!uniqueId || seenIds.has(uniqueId)) {
            uniqueId = `t-new-${yr.fiscalYear.replace(/[^0-9]/g, '') || yearIdx}-${itIdx + 1}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
          }
          seenIds.add(uniqueId);

          uniqueTeachers.push({
            ...it,
            id: uniqueId,
            sn: uniqueTeachers.length + 1
          });
        }
      });
    }

    // 3. Sort teachers strictly according to CANONICAL_TEACHER_ORDER (बुद्ध थापा -> धर्म राज -> बिजय; नन्दमाया -> हरी माया -> सपना)
    uniqueTeachers.sort((a, b) => {
      const idxA = CANONICAL_TEACHER_ORDER.indexOf((a.name || '').trim());
      const idxB = CANONICAL_TEACHER_ORDER.indexOf((b.name || '').trim());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return (a.sn || 0) - (b.sn || 0);
    });

    // Reassign sequential sn
    const orderedTeachers = uniqueTeachers.map((t, i) => ({
      ...t,
      sn: i + 1
    }));

    return {
      ...yr,
      teachers: orderedTeachers
    };
  });

  return sanitizedYears;
}
