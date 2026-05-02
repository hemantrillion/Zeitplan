import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export const DEFAULT_STATUSES_SPLIT = [
  { value: 'PRESENT',           label: 'PRESENT',           color: '#27AE60', textColor: '#FFFFFF', countsAs: 'present' },
  { value: 'ABSENT',            label: 'ABSENT',            color: '#C0392B', textColor: '#FFFFFF', countsAs: 'absent'  },
  { value: 'ON-DUTY',           label: 'ON-DUTY',           color: '#2E86C1', textColor: '#FFFFFF', countsAs: 'present' },
  { value: 'MEDICAL SUBMITTED', label: 'MEDICAL SUBMITTED', color: '#D35400', textColor: '#FFFFFF', countsAs: 'absent'  },
  { value: 'MEDICAL UPLOADED',  label: 'MEDICAL UPLOADED',  color: '#1A5276', textColor: '#FFFFFF', countsAs: 'present' },
  { value: 'NO CLASS',          label: 'NO CLASS',          color: '#7F8C8D', textColor: '#FFFFFF', countsAs: 'noclass' },
];

export const DEFAULT_STATUSES_SIMPLE = [
  { value: 'PRESENT',       label: 'PRESENT',       color: '#27AE60', textColor: '#FFFFFF', countsAs: 'present' },
  { value: 'ABSENT',        label: 'ABSENT',        color: '#C0392B', textColor: '#FFFFFF', countsAs: 'absent'  },
  { value: 'ON-DUTY',       label: 'ON-DUTY',       color: '#2E86C1', textColor: '#FFFFFF', countsAs: 'present' },
  { value: 'MEDICAL LEAVE', label: 'MEDICAL LEAVE', color: '#D35400', textColor: '#FFFFFF', countsAs: 'present' },
  { value: 'NO CLASS',      label: 'NO CLASS',      color: '#7F8C8D', textColor: '#FFFFFF', countsAs: 'noclass' },
];

// When switching mode, migrate existing attendance values
const migrateAttendance = (att, fromMode, toMode) => {
  if (fromMode === toMode) return att;
  const updated = { ...att };
  Object.keys(updated).forEach(k => {
    const v = updated[k];
    if (toMode === 'simple') {
      // Both medical submitted and uploaded → MEDICAL LEAVE
      if (v === 'MEDICAL SUBMITTED' || v === 'MEDICAL UPLOADED') updated[k] = 'MEDICAL LEAVE';
    } else {
      // MEDICAL LEAVE → MEDICAL SUBMITTED
      if (v === 'MEDICAL LEAVE') updated[k] = 'MEDICAL SUBMITTED';
    }
  });
  return updated;
};

export const THEMES = {
  light: {
    name: 'Bright Light', key: 'light', isDark: false,
    bg: '#FFFFFF', bg2: '#F7F6F2', bg3: '#EFEFEF',
    border: '#E0E0E0', text: '#1A1A1A', text2: '#555555', text3: '#AAAAAA',
    headerBg: '#2D5A3D', headerText: '#FFFFFF',
    cellBg: '#FAFAFA', cellText: '#333333',
    labCellBg: '#F0EEE8', emptyBg: '#FAF9F6', emptyText: '#AAAAAA',
    topBarBg: '#FFFFFF', topBarBorder: '#EEEEEE',
    modalBg: '#FFFFFF', modalBorder: '#E0E0E0',
    statsBtnBg: '#F0F0EC', statsBtnText: '#2D5A3D', statsBtnBorder: '#CCCCCC',
    settingsCard: '#F7F6F2', dayColBg: '#F2F1ED',
  },
  dark: {
    name: 'Midnight Dark', key: 'dark', isDark: true,
    bg: '#000000', bg2: '#0A0A0A', bg3: '#141414',
    border: '#1C1C1C', text: '#F0F0F0', text2: '#BBBBBB', text3: '#555555',
    headerBg: '#0D2B0D', headerText: '#FFFFFF',
    cellBg: '#0A0A0A', cellText: '#DDDDDD',
    labCellBg: '#0F0F0F', emptyBg: '#000000', emptyText: '#333333',
    topBarBg: '#000000', topBarBorder: '#111111',
    modalBg: '#0A0A0A', modalBorder: '#1C1C1C',
    statsBtnBg: '#0F0F0F', statsBtnText: '#2ECC71', statsBtnBorder: '#1C1C1C',
    settingsCard: '#0A0A0A', dayColBg: '#060606',
  },
};

export function AppProvider({ children }) {
  const [theme, setTheme]                 = useState(THEMES.light);
  const [timetables, setTimetablesState]  = useState([]);
  const [attendance, setAttendanceState]  = useState({});
  const [transparentSlots, setTransparentState] = useState([]);
  const [medicalMode, setMedicalModeState] = useState('split');
  const [thresholds, setThresholdsState]   = useState({ safe: null, moderate: null });
  const [hiddenDates, setHiddenDatesState] = useState([]); // array of YYYY-MM-DD strings
  const [loaded, setLoaded]               = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const keys = ['@zp_theme','@zp_timetables','@zp_attendance','@zp_transparent','@zp_medmode','@zp_thresholds','@zp_hidden'];
        const results = await AsyncStorage.multiGet(keys);
        const map = {};
        results.forEach(([k,v]) => { map[k] = v; });
        if (map['@zp_theme'])       setTheme(THEMES[map['@zp_theme']] || THEMES.light);
        if (map['@zp_timetables'])  setTimetablesState(JSON.parse(map['@zp_timetables']));
        if (map['@zp_attendance'])  setAttendanceState(JSON.parse(map['@zp_attendance']));
        if (map['@zp_transparent']) setTransparentState(JSON.parse(map['@zp_transparent']));
        if (map['@zp_medmode'])     setMedicalModeState(map['@zp_medmode']);
        if (map['@zp_thresholds'])  setThresholdsState(JSON.parse(map['@zp_thresholds']));
        if (map['@zp_hidden'])      setHiddenDatesState(JSON.parse(map['@zp_hidden']));
      } catch(e) { console.error('Load error:', e); }
      setLoaded(true);
    })();
  }, []);

  const persist = async (key, val) => {
    try { await AsyncStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val)); }
    catch(e) {}
  };

  const changeTheme     = (k) => { const t = THEMES[k]||THEMES.light; setTheme(t); persist('@zp_theme', k); };
  const saveTimetables  = (v) => { setTimetablesState(v); persist('@zp_timetables', v); };
  const saveAttendance  = (v) => { setAttendanceState(v); persist('@zp_attendance', v); };
  const saveTransparent = (v) => { setTransparentState(v); persist('@zp_transparent', v); };
  const saveThresholds  = (v) => { setThresholdsState(v); persist('@zp_thresholds', v); };
  const saveHiddenDates = (v) => { setHiddenDatesState(v); persist('@zp_hidden', v); };

  const saveMedicalMode = (newMode) => {
    const migrated = migrateAttendance(attendance, medicalMode, newMode);
    setMedicalModeState(newMode);
    persist('@zp_medmode', newMode);
    setAttendanceState(migrated);
    persist('@zp_attendance', migrated);
  };

  const getStatuses = () => medicalMode === 'simple' ? DEFAULT_STATUSES_SIMPLE : DEFAULT_STATUSES_SPLIT;

  // A slot is transparent if it matches any rule
  const isTransparent = (date, dayName, slotName) =>
    transparentSlots.some(r =>
      (r.type === 'all'  && r.slotName === slotName) ||
      (r.type === 'day'  && r.day === dayName && r.slotName === slotName) ||
      (r.type === 'date' && r.date === date   && r.slotName === slotName)
    );

  // Build all rows sorted by date, skip hidden dates
  // Each row has: ttId, ttName, date, dayName, slots[]
  // slots[] = [{name, start, end, isLab, isMerged}] — only NON-transparent ones
  // Header columns = time slots (start-end), displayed as time labels
  // Each row's cells map to the global time slot list
  const getAllRows = () => {
    const all = [];
    timetables.forEach(tt => {
      const start = new Date(tt.startDate + 'T00:00:00');
      const end   = new Date(tt.endDate   + 'T00:00:00');
      const cur   = new Date(start);
      while (cur <= end) {
        const dayName = cur.toLocaleDateString('en-US', { weekday: 'long' });
        const dateStr = cur.toISOString().split('T')[0];
        if (tt.days.includes(dayName) && !hiddenDates.includes(dateStr)) {
          const rawSlots = (tt.weekSlots[dayName] || []);
          all.push({
            ttId: tt.id, ttName: tt.name,
            date: dateStr, dayName,
            slots: rawSlots, // keep all slots, transparency filtered in render
          });
        }
        cur.setDate(cur.getDate() + 1);
      }
    });
    all.sort((a, b) => a.date.localeCompare(b.date));
    return all;
  };

  // Get global time slot list from all timetables (unique, sorted by start time)
  // Returns [{start, end, label}] where label = "09:00-11:00"
  const getGlobalTimeSlots = () => {
    const seen = new Set();
    const slots = [];
    timetables.forEach(tt => {
      (tt.timeSlots || []).forEach(ts => {
        const key = `${ts.start}-${ts.end}`;
        if (!seen.has(key)) { seen.add(key); slots.push({ ...ts, key }); }
      });
    });
    slots.sort((a, b) => a.start.localeCompare(b.start));
    return slots;
  };

  const makeAttKey = (ttId, date, slotKey) => `${ttId}_${date}_${slotKey}`;

  // Compute stats: only count non-transparent slots
  const computeStats = () => {
    const rows = getAllRows();
    const stats = {};
    const statuses = getStatuses();

    rows.forEach(row => {
      row.slots.forEach((slot) => {
        // Skip transparent slots entirely
        if (isTransparent(row.date, row.dayName, slot.name)) return;
        const name = slot.name;
        if (!stats[name]) stats[name] = { total: 0, present: 0, absent: 0, ml: 0, noclass: 0 };
        const key    = makeAttKey(row.ttId, row.date, `${slot.start}-${slot.end}`);
        const status = attendance[key];
        if (!status) return;
        const st = statuses.find(s => s.value === status);
        if (!st) return;
        stats[name].total++;
        if (st.countsAs === 'present') stats[name].present++;
        else if (st.countsAs === 'absent') stats[name].absent++;
        else if (st.countsAs === 'noclass') stats[name].noclass++;
      });
    });

    Object.keys(stats).forEach(name => {
      const s = stats[name];
      const countable = s.total - s.noclass;
      if (s.total === 0) s.percent = null;
      else if (countable === 0) s.percent = 0; // all no-class
      else s.percent = Math.round((s.present / countable) * 1000) / 10;
    });

    return stats;
  };

  return (
    <AppContext.Provider value={{
      theme, changeTheme, THEMES,
      timetables, saveTimetables,
      attendance, saveAttendance,
      transparentSlots, saveTransparent,
      medicalMode, saveMedicalMode,
      thresholds, saveThresholds,
      hiddenDates, saveHiddenDates,
      getStatuses, isTransparent,
      getAllRows, makeAttKey, computeStats,
      getGlobalTimeSlots, loaded,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
