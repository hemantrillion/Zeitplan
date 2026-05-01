// All schedule data extracted from Excel Master sheet
// slots: [9:30, 10:30, 11:30, 12:30, 1:30, 2:30, 3:30]
// null in slot 1 means TA LAB spans slot 0+1 (9:30-11:30)
// null in slot 6 means AC LAB spans slot 5+6 (2:30-4:30)

export const TIME_SLOTS = [
  '9:30-10:30',
  '10:30-11:30',
  '11:30-12:30',
  '12:30-1:30',
  '1:30-2:30',
  '2:30-3:30',
  '3:30-4:30',
];

export const SUBJECTS = [
  'AC', 'AC LAB', 'AI', 'LIBRARY', 'LIVE', 'NN', 'PFP',
  'PS', 'SL', 'TA', 'TA LAB', 'Wearable'
];

export const NON_ACADEMIC = ['LIBRARY', 'LUNCH', 'LIVE'];

export const ATTENDANCE_OPTIONS = [
  { label: 'Present',           value: 'Present',           color: '#00B050', textColor: '#000000' },
  { label: 'Absent',            value: 'Absent',            color: '#FF0000', textColor: '#FFFFFF' },
  { label: 'Medical Submitted', value: 'Medical Submitted', color: '#FF8C00', textColor: '#FFFFFF' },
  { label: 'Medical Uploaded',  value: 'Medical Uploaded',  color: '#1F6B00', textColor: '#FFFFFF' },
  { label: 'No Class',          value: 'No Class',          color: '#A6A6A6', textColor: '#FFFFFF' },
];

export const DAY_COLORS = {
  Monday:    { bg: '#FF0000', text: '#FFFFFF' },
  Tuesday:   { bg: '#FF8C00', text: '#000000' },
  Wednesday: { bg: '#FFD700', text: '#000000' },
  Thursday:  { bg: '#008000', text: '#FFFFFF' },
  Friday:    { bg: '#0000FF', text: '#FFFFFF' },
};

export const SCHEDULE = [
  { date: '19-Jan-2026', day: 'Monday',    slots: ['AC','PS','AI','LIBRARY','LUNCH','SL','TA'] },
  { date: '21-Jan-2026', day: 'Wednesday', slots: ['TA LAB',null,'PFP','SL','LUNCH','NN','TA'] },
  { date: '22-Jan-2026', day: 'Thursday',  slots: ['Wearable','AI','PFP','AC','LUNCH','SL','PS'] },
  { date: '27-Jan-2026', day: 'Tuesday',   slots: ['TA','NN','LIBRARY','LIVE','LUNCH','AI','LIBRARY'] },
  { date: '28-Jan-2026', day: 'Wednesday', slots: ['TA LAB',null,'PFP','SL','LUNCH','NN','TA'] },
  { date: '29-Jan-2026', day: 'Thursday',  slots: ['Wearable','AI','PFP','AC','LUNCH','SL','PS'] },
  { date: '30-Jan-2026', day: 'Friday',    slots: ['LIVE','AC','Wearable','NN','LUNCH','AC LAB',null] },
  { date: '02-Feb-2026', day: 'Monday',    slots: ['AC','PS','AI','LIBRARY','LUNCH','SL','TA'] },
  { date: '03-Feb-2026', day: 'Tuesday',   slots: ['TA','NN','LIBRARY','LIVE','LUNCH','AI','LIBRARY'] },
  { date: '04-Feb-2026', day: 'Wednesday', slots: ['TA LAB',null,'PFP','SL','LUNCH','NN','TA'] },
  { date: '05-Feb-2026', day: 'Thursday',  slots: ['Wearable','AI','PFP','AC','LUNCH','SL','PS'] },
  { date: '06-Feb-2026', day: 'Friday',    slots: ['LIVE','AC','Wearable','NN','LUNCH','AC LAB',null] },
  { date: '09-Feb-2026', day: 'Monday',    slots: ['AC','PS','AI','LIBRARY','LUNCH','SL','TA'] },
  { date: '10-Feb-2026', day: 'Tuesday',   slots: ['TA','NN','LIBRARY','LIVE','LUNCH','AI','LIBRARY'] },
  { date: '11-Feb-2026', day: 'Wednesday', slots: ['TA LAB',null,'PFP','SL','LUNCH','NN','TA'] },
  { date: '12-Feb-2026', day: 'Thursday',  slots: ['Wearable','AI','PFP','AC','LUNCH','SL','PS'] },
  { date: '13-Feb-2026', day: 'Friday',    slots: ['LIVE','AC','Wearable','NN','LUNCH','AC LAB',null] },
  { date: '16-Feb-2026', day: 'Monday',    slots: ['AC','PS','AI','LIBRARY','LUNCH','SL','TA'] },
  { date: '17-Feb-2026', day: 'Tuesday',   slots: ['TA','NN','LIBRARY','LIVE','LUNCH','AI','LIBRARY'] },
  { date: '18-Feb-2026', day: 'Wednesday', slots: ['TA LAB',null,'PFP','SL','LUNCH','NN','TA'] },
  { date: '19-Feb-2026', day: 'Thursday',  slots: ['Wearable','AI','PFP','AC','LUNCH','SL','PS'] },
  { date: '20-Feb-2026', day: 'Friday',    slots: ['LIVE','AC','Wearable','NN','LUNCH','AC LAB',null] },
  { date: '23-Feb-2026', day: 'Monday',    slots: ['AC','PS','AI','LIBRARY','LUNCH','SL','TA'] },
  { date: '24-Feb-2026', day: 'Tuesday',   slots: ['TA','NN','LIBRARY','LIVE','LUNCH','AI','LIBRARY'] },
  { date: '25-Feb-2026', day: 'Wednesday', slots: ['TA LAB',null,'PFP','SL','LUNCH','NN','TA'] },
  { date: '26-Feb-2026', day: 'Thursday',  slots: ['Wearable','AI','PFP','AC','LUNCH','SL','PS'] },
  { date: '27-Feb-2026', day: 'Friday',    slots: ['LIVE','AC','Wearable','NN','LUNCH','AC LAB',null] },
  { date: '02-Mar-2026', day: 'Monday',    slots: ['AC','PS','AI','LIBRARY','LUNCH','SL','TA'] },
  { date: '05-Mar-2026', day: 'Thursday',  slots: ['Wearable','AI','PFP','AC','LUNCH','SL','PS'] },
  { date: '06-Mar-2026', day: 'Friday',    slots: ['LIVE','AC','Wearable','NN','LUNCH','AC LAB',null] },
  { date: '09-Mar-2026', day: 'Monday',    slots: ['AC','PS','AI','LIBRARY','LUNCH','SL','TA'] },
  { date: '10-Mar-2026', day: 'Tuesday',   slots: ['TA','NN','LIBRARY','LIVE','LUNCH','AI','LIBRARY'] },
  { date: '11-Mar-2026', day: 'Wednesday', slots: ['TA LAB',null,'PFP','SL','LUNCH','NN','TA'] },
  { date: '12-Mar-2026', day: 'Thursday',  slots: ['SL','AI','Wearable','AC','LUNCH','LIVE','PS'] },
  { date: '16-Mar-2026', day: 'Monday',    slots: ['AC','PS','AI','LIBRARY','LUNCH','SL','TA'] },
  { date: '17-Mar-2026', day: 'Tuesday',   slots: ['TA','NN','LIBRARY','PFP','LUNCH','AI','AC'] },
  { date: '18-Mar-2026', day: 'Wednesday', slots: ['TA LAB',null,'PFP','LIBRARY','LUNCH','NN','TA'] },
  { date: '19-Mar-2026', day: 'Thursday',  slots: ['SL','AI','Wearable','AC','LUNCH','LIVE','PS'] },
  { date: '20-Mar-2026', day: 'Friday',    slots: ['AC LAB',null,'LIVE','NN','LUNCH','SL','PFP'] },
  { date: '24-Mar-2026', day: 'Tuesday',   slots: ['TA','NN','LIBRARY','PFP','LUNCH','AI','AC'] },
  { date: '25-Mar-2026', day: 'Wednesday', slots: ['TA LAB',null,'PFP','LIBRARY','LUNCH','NN','TA'] },
  { date: '27-Mar-2026', day: 'Friday',    slots: ['AC LAB',null,'LIVE','NN','LUNCH','SL','PFP'] },
  { date: '30-Mar-2026', day: 'Monday',    slots: ['AC','PS','AI','LIBRARY','LUNCH','SL','TA'] },
  { date: '01-Apr-2026', day: 'Wednesday', slots: ['TA LAB',null,'PFP','LIBRARY','LUNCH','NN','TA'] },
  { date: '02-Apr-2026', day: 'Thursday',  slots: ['SL','AI','Wearable','AC','LUNCH','LIVE','PS'] },
  { date: '06-Apr-2026', day: 'Monday',    slots: ['AC','PS','AI','LIBRARY','LUNCH','SL','TA'] },
  { date: '07-Apr-2026', day: 'Tuesday',   slots: ['TA','NN','LIBRARY','PFP','LUNCH','AI','AC'] },
  { date: '08-Apr-2026', day: 'Wednesday', slots: ['TA LAB',null,'PFP','LIBRARY','LUNCH','NN','TA'] },
  { date: '09-Apr-2026', day: 'Thursday',  slots: ['SL','AI','Wearable','AC','LUNCH','LIVE','PS'] },
  { date: '10-Apr-2026', day: 'Friday',    slots: ['AC LAB',null,'LIVE','NN','LUNCH','SL','PFP'] },
  { date: '13-Apr-2026', day: 'Monday',    slots: ['AC','PS','AI','LIBRARY','LUNCH','SL','TA'] },
  { date: '15-Apr-2026', day: 'Wednesday', slots: ['TA LAB',null,'PFP','LIBRARY','LUNCH','NN','TA'] },
  { date: '16-Apr-2026', day: 'Thursday',  slots: ['SL','AI','Wearable','AC','LUNCH','LIVE','PS'] },
  { date: '17-Apr-2026', day: 'Friday',    slots: ['AC LAB',null,'LIVE','NN','LUNCH','SL','PFP'] },
  { date: '20-Apr-2026', day: 'Monday',    slots: ['AC','PS','AI','LIBRARY','LUNCH','SL','TA'] },
  { date: '21-Apr-2026', day: 'Tuesday',   slots: ['TA','NN','LIBRARY','PFP','LUNCH','AI','AC'] },
  { date: '22-Apr-2026', day: 'Wednesday', slots: ['TA LAB',null,'PFP','LIBRARY','LUNCH','NN','TA'] },
  { date: '23-Apr-2026', day: 'Thursday',  slots: ['SL','AI','Wearable','AC','LUNCH','LIVE','PS'] },
  { date: '24-Apr-2026', day: 'Friday',    slots: ['AC LAB',null,'LIVE','NN','LUNCH','SL','PFP'] },
  { date: '27-Apr-2026', day: 'Monday',    slots: ['AC','PS','AI','LIBRARY','LUNCH','SL','TA'] },
  { date: '28-Apr-2026', day: 'Tuesday',   slots: ['TA','NN','LIBRARY','PFP','LUNCH','AI','AC'] },
  { date: '29-Apr-2026', day: 'Wednesday', slots: ['TA LAB',null,'PFP','LIBRARY','LUNCH','NN','TA'] },
  { date: '30-Apr-2026', day: 'Thursday',  slots: ['SL','AI','Wearable','AC','LUNCH','LIVE','PS'] },
  { date: '01-May-2026', day: 'Friday',    slots: ['AC LAB',null,'LIVE','NN','LUNCH','SL','PFP'] },
  { date: '04-May-2026', day: 'Monday',    slots: ['AC','PS','AI','LIBRARY','LUNCH','SL','TA'] },
  { date: '05-May-2026', day: 'Tuesday',   slots: ['TA','NN','LIBRARY','PFP','LUNCH','AI','AC'] },
  { date: '06-May-2026', day: 'Wednesday', slots: ['TA LAB',null,'PFP','LIBRARY','LUNCH','NN','TA'] },
  { date: '07-May-2026', day: 'Thursday',  slots: ['SL','AI','Wearable','AC','LUNCH','LIVE','PS'] },
  { date: '08-May-2026', day: 'Friday',    slots: ['AC LAB',null,'LIVE','NN','LUNCH','SL','PFP'] },
  { date: '11-May-2026', day: 'Monday',    slots: ['AC','PS','AI','LIBRARY','LUNCH','SL','TA'] },
  { date: '12-May-2026', day: 'Tuesday',   slots: ['TA','NN','LIBRARY','PFP','LUNCH','AI','AC'] },
  { date: '13-May-2026', day: 'Wednesday', slots: ['TA LAB',null,'PFP','LIBRARY','LUNCH','NN','TA'] },
  { date: '14-May-2026', day: 'Thursday',  slots: ['SL','AI','Wearable','AC','LUNCH','LIVE','PS'] },
  { date: '15-May-2026', day: 'Friday',    slots: ['AC LAB',null,'LIVE','NN','LUNCH','SL','PFP'] },
];
