import { SCHEDULE, SUBJECTS, NON_ACADEMIC } from '../data/timetable';

// Build attendance key: "dateIndex_slotIndex"
export const makeKey = (dateIdx, slotIdx) => `${dateIdx}_${slotIdx}`;

// For a lab row, slot 0 = TA LAB spanning 0+1, slot 5 = AC LAB spanning 5+6
// Attendance key for TA LAB is dateIdx_0, for AC LAB is dateIdx_5
export const getLabAttendanceSlot = (slots) => {
  if (slots[0] === 'TA LAB') return 0;
  if (slots[5] === 'AC LAB') return 5;
  return null;
};

export const computeSubjectStats = (attendance) => {
  const stats = {};
  SUBJECTS.forEach(sub => {
    stats[sub] = { total: 0, present: 0, absent: 0, ml: 0, percent: 0 };
  });

  SCHEDULE.forEach((row, dateIdx) => {
    const { slots } = row;
    let si = 0;
    while (si < slots.length) {
      const subject = slots[si];
      // Skip null (continuation of lab), LUNCH, and non-trackable
      if (!subject || subject === 'LUNCH') { si++; continue; }

      const isLab = subject === 'TA LAB' || subject === 'AC LAB';
      // For labs, attendance key uses the first slot index
      const attKey = makeKey(dateIdx, si);
      const status = attendance[attKey];

      // Only count if status has been recorded (not blank)
      if (status && stats[subject]) {
        stats[subject].total++;
        if (status === 'Present') stats[subject].present++;
        else if (status === 'Absent') stats[subject].absent++;
        else if (status === 'Medical Submitted' || status === 'Medical Uploaded') stats[subject].ml++;
      } else if (stats[subject]) {
        // Count as total only if status is set (user interacted)
        // We track total from marked slots only
      }

      // Skip next slot if lab (spans 2 slots)
      si += isLab ? 2 : 1;
    }
  });

  // Compute totals properly: total = all slots where user set a status
  // Recalculate
  const stats2 = {};
  SUBJECTS.forEach(sub => {
    stats2[sub] = { total: 0, present: 0, absent: 0, ml: 0, mlU: 0, percent: 0 };
  });

  SCHEDULE.forEach((row, dateIdx) => {
    const { slots } = row;
    let si = 0;
    while (si < slots.length) {
      const subject = slots[si];
      if (!subject || subject === 'LUNCH') { si++; continue; }
      const isLab = subject === 'TA LAB' || subject === 'AC LAB';
      const attKey = makeKey(dateIdx, si);
      const status = attendance[attKey];

      if (status && stats2[subject]) {
        const s = stats2[subject];
        s.total++;
        if (status === 'Present') s.present++;
        else if (status === 'Absent') s.absent++;
        else if (status === 'Medical Submitted') s.ml++;
        else if (status === 'Medical Uploaded') { s.ml++; s.mlU++; }
      }

      si += isLab ? 2 : 1;
    }
  });

  // Calculate percentage: (Present + Medical Uploaded) / Total * 100
  SUBJECTS.forEach(sub => {
    const s = stats2[sub];
    if (s.total > 0) {
      s.percent = Math.round(((s.present + s.mlU) / s.total) * 100 * 10) / 10;
    }
  });

  return stats2;
};
