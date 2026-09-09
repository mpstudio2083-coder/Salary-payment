import { FiscalYearPayroll, TeacherRecord } from '../types';
import { initialFiscalYears } from '../data/initialData';

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
        sn: uniqueTeachers.length + 1
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

    return {
      ...yr,
      teachers: uniqueTeachers
    };
  });

  return sanitizedYears;
}
