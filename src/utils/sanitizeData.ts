import { FiscalYearPayroll, TeacherRecord } from '../types';
import { initialFiscalYears } from '../data/initialData';

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
 * and sequential `sn`.
 */
export function sanitizeFiscalYears(rawYears: FiscalYearPayroll[]): FiscalYearPayroll[] {
  if (!Array.isArray(rawYears) || rawYears.length === 0) {
    return initialFiscalYears;
  }

  // Filter out any un-entered placeholder years (like old 2080 or 2081 if not customized by user)
  let yearsList = rawYears.filter(y => {
    // Keep 2082/83, 2083/84 and any newly created year by user (excluding unentered default 2080/81)
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

    // 1. Process existing teachers, removing duplicate names or assigning unique IDs
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

      uniqueTeachers.push({
        ...t,
        id: uniqueId,
        sn: idx + 1
      });
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
