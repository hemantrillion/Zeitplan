import AsyncStorage from '@react-native-async-storage/async-storage';

const ATTENDANCE_KEY = '@timetable_attendance';

export const saveAttendance = async (attendance) => {
  try {
    await AsyncStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
  } catch (e) {
    console.error('Save failed:', e);
  }
};

export const loadAttendance = async () => {
  try {
    const json = await AsyncStorage.getItem(ATTENDANCE_KEY);
    return json ? JSON.parse(json) : {};
  } catch (e) {
    console.error('Load failed:', e);
    return {};
  }
};

export const clearAttendance = async () => {
  try {
    await AsyncStorage.removeItem(ATTENDANCE_KEY);
  } catch (e) {
    console.error('Clear failed:', e);
  }
};
