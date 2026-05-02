import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  StatusBar, ScrollView, Modal, TextInput, Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import CreateTimetableModal from '../components/CreateTimetableModal';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SettingsScreen({ navigation }) {
  const {
    theme: T, changeTheme, THEMES,
    timetables, saveTimetables,
    transparentSlots, saveTransparent,
    medicalMode, saveMedicalMode,
    thresholds, saveThresholds,
    attendance, saveAttendance,
    hiddenDates, saveHiddenDates,
    getAllRows,
  } = useApp();
  const [showHideDates, setShowHideDates] = useState(false);
  const [hideDateInput, setHideDateInput] = useState('');
  const [hideRangeMode, setHideRangeMode] = useState(false);
  const [hideDateEnd,   setHideDateEnd]   = useState('');

  const [showCreateTT,   setShowCreateTT]   = useState(false);
  const [themeDropdown,  setThemeDropdown]  = useState(false);
  const [showTransparent,setShowTransparent]= useState(false);
  const [showThresholds, setShowThresholds] = useState(false);
  const [showAddDate,    setShowAddDate]    = useState(false);
  const [expandedTT,     setExpandedTT]     = useState(null);

  // Threshold inputs
  const [safeInput,     setSafeInput]     = useState(thresholds.safe !== null ? String(thresholds.safe) : '');
  const [moderateInput, setModerateInput] = useState(thresholds.moderate !== null ? String(thresholds.moderate) : '');

  // Add/remove date
  const [dateInput, setDateInput]       = useState('');
  const [dateRangeMode, setDateRangeMode] = useState(false);
  const [dateEndInput, setDateEndInput] = useState('');

  const currentThemeKey = T.isDark ? 'dark' : 'light';

  const deleteTimetable = (id) => {
    Alert.alert('Delete Timetable', 'This cannot be undone.',
      [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive',
        onPress: () => saveTimetables(timetables.filter(t => t.id !== id)) }]);
  };

  const saveThresholdValues = () => {
    const s = safeInput     ? parseFloat(safeInput)     : null;
    const m = moderateInput ? parseFloat(moderateInput) : null;
    if (s !== null && (isNaN(s) || s < 0 || s > 100)) { Alert.alert('Invalid value for Safe %'); return; }
    if (m !== null && (isNaN(m) || m < 0 || m > 100)) { Alert.alert('Invalid value for Moderate %'); return; }
    saveThresholds({ safe: s, moderate: m });
    setShowThresholds(false);
  };

  const renderTimetables = () => (
    <View style={[styles.card, { backgroundColor: T.settingsCard, borderColor: T.border }]}>
      <Text style={[styles.cardTitle, { color: T.text }]}>Timetables</Text>
      {timetables.length === 0
        ? <Text style={[styles.hint, { color: T.text3 }]}>No timetables yet.</Text>
        : timetables.map(tt => (
          <View key={tt.id}>
            <TouchableOpacity
              style={[styles.ttRow, { borderColor: T.border }]}
              onPress={() => setExpandedTT(expandedTT === tt.id ? null : tt.id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.ttName, { color: T.text }]}>{tt.name}</Text>
                <Text style={[styles.ttDates, { color: T.text3 }]}>{tt.startDate} → {tt.endDate}</Text>
              </View>
              <Text style={[{ color: T.text3, fontSize: 11 }]}>{expandedTT === tt.id ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {expandedTT === tt.id && (
              <View style={[styles.ttExpanded, { backgroundColor: T.bg2, borderColor: T.border }]}>
                <Text style={[styles.hint, { color: T.text2 }]}>Days: {tt.days.join(', ')}</Text>
                <Text style={[styles.hint, { color: T.text2, marginTop: 4 }]}>
                  Slots: {Object.entries(tt.weekSlots).map(([d, s]) =>
                    `${d.slice(0,3)}: ${s.map(x => x.name).join(', ')}`).join(' | ')}
                </Text>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteTimetable(tt.id)}>
                  <Text style={styles.deleteTxt}>Delete Timetable</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      }
      <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateTT(true)}>
        <Text style={styles.createBtnTxt}>+ Create New Timetable</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTheme = () => (
    <View style={[styles.card, { backgroundColor: T.settingsCard, borderColor: T.border }]}>
      <Text style={[styles.cardTitle, { color: T.text }]}>Display Theme</Text>
      <TouchableOpacity
        style={[styles.dropdown, { backgroundColor: T.bg2, borderColor: T.border }]}
        onPress={() => setThemeDropdown(true)}
      >
        <Text style={[styles.dropdownTxt, { color: T.text }]}>
          {T.isDark ? 'Midnight Dark' : 'Bright Light'}
        </Text>
        <Text style={{ color: T.text3 }}>▼</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMedical = () => (
    <View style={[styles.card, { backgroundColor: T.settingsCard, borderColor: T.border }]}>
      <Text style={[styles.cardTitle, { color: T.text }]}>Medical Leave Mode</Text>
      {[
        { key: 'simple', label: 'MEDICAL LEAVE', desc: 'Single status, counts as present' },
        { key: 'split',  label: 'MEDICAL SUBMITTED + UPLOADED', desc: 'Two statuses (current)' },
      ].map(opt => (
        <TouchableOpacity key={opt.key}
          style={[styles.radioRow, { borderColor: T.border },
            medicalMode === opt.key && { borderColor: '#2D5A3D', backgroundColor: T.isDark ? '#0D2B0D' : '#EAF4ED' }]}
          onPress={() => saveMedicalMode(opt.key)}>
          <View style={[styles.radio, { borderColor: T.border },
            medicalMode === opt.key && { borderColor: '#2D5A3D' }]}>
            {medicalMode === opt.key && <View style={styles.radioDot} />}
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.radioLabel, { color: T.text }]}>{opt.label}</Text>
            <Text style={[styles.radioDesc, { color: T.text3 }]}>{opt.desc}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderThresholds = () => (
    <View style={[styles.card, { backgroundColor: T.settingsCard, borderColor: T.border }]}>
      <Text style={[styles.cardTitle, { color: T.text }]}>Attendance Thresholds</Text>
      <Text style={[styles.hint, { color: T.text3 }]}>
        Leave blank to disable color coding.
      </Text>
      <TouchableOpacity style={styles.createBtn} onPress={() => setShowThresholds(true)}>
        <Text style={styles.createBtnTxt}>
          {thresholds.safe !== null || thresholds.moderate !== null
            ? `Safe: ${thresholds.safe ?? '–'}%  Moderate: ${thresholds.moderate ?? '–'}%`
            : 'Set Thresholds'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTransparent = () => (
    <View style={[styles.card, { backgroundColor: T.settingsCard, borderColor: T.border }]}>
      <Text style={[styles.cardTitle, { color: T.text }]}>Excluded Slots</Text>
      <Text style={[styles.hint, { color: T.text3 }]}>
        Slots excluded from attendance stats.
      </Text>
      {transparentSlots.length > 0 && transparentSlots.map((rule, i) => (
        <View key={i} style={[styles.transparentRow, { borderColor: T.border }]}>
          <Text style={[styles.transparentTxt, { color: T.text2 }]}>
            {rule.type === 'all'  && `All days`}
            {rule.type === 'day'  && `Every ${rule.day}`}
            {rule.type === 'date' && rule.date}
            {' → '}{rule.slotName}
          </Text>
          <TouchableOpacity onPress={() => saveTransparent(transparentSlots.filter((_, j) => j !== i))}>
            <Text style={{ color: '#E74C3C', fontWeight: '700' }}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.createBtn} onPress={() => setShowTransparent(true)}>
        <Text style={styles.createBtnTxt}>+ Add Excluded Slot</Text>
      </TouchableOpacity>
    </View>
  );


  const renderHideDates = () => (
    <View style={[styles.card, { backgroundColor: T.settingsCard, borderColor: T.border }]}>
      <Text style={[styles.cardTitle, { color: T.text }]}>Hide / Show Dates</Text>
      <Text style={[styles.hint, { color: T.text3 }]}>Hidden dates won't appear in timetable.</Text>
      {hiddenDates.length > 0 && hiddenDates.map((d, i) => (
        <View key={i} style={[styles.transparentRow, { borderColor: T.border }]}>
          <Text style={[styles.transparentTxt, { color: T.text2 }]}>{d}</Text>
          <TouchableOpacity onPress={() => saveHiddenDates(hiddenDates.filter((_,j)=>j!==i))}>
            <Text style={{ color: '#E74C3C', fontWeight: '700' }}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.createBtn} onPress={() => setShowHideDates(true)}>
        <Text style={styles.createBtnTxt}>+ Hide a Date / Range</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.isDark ? 'light-content' : 'dark-content'} backgroundColor={T.topBarBg} />

      <View style={[styles.topBar, { backgroundColor: T.topBarBg, borderBottomColor: T.topBarBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 60 }}>
          <Text style={[styles.backTxt, { color: T.isDark ? '#2ECC71' : '#2D5A3D' }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: T.text }]}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
        {renderTimetables()}
        {renderTheme()}
        {renderMedical()}
        {renderThresholds()}
        {renderTransparent()}
        {renderHideDates()}
      </ScrollView>

      {/* Create timetable modal */}
      <CreateTimetableModal visible={showCreateTT} onClose={() => setShowCreateTT(false)} T={T} />

      {/* Theme dropdown modal */}
      <Modal visible={themeDropdown} transparent animationType="fade" onRequestClose={() => setThemeDropdown(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setThemeDropdown(false)}>
          <View style={[styles.dropdownMenu, { backgroundColor: T.modalBg, borderColor: T.modalBorder }]}>
            {['light','dark'].map(k => (
              <TouchableOpacity key={k}
                style={[styles.dropdownItem,
                  currentThemeKey === k && { backgroundColor: T.isDark ? '#0D2B0D' : '#EAF4ED' }]}
                onPress={() => { changeTheme(k); setThemeDropdown(false); }}>
                <Text style={[styles.dropdownItemTxt, { color: T.text },
                  currentThemeKey === k && { color: '#2D5A3D', fontWeight: '700' }]}>
                  {k === 'light' ? 'Bright Light' : 'Midnight Dark'}
                </Text>
                {currentThemeKey === k && <Text style={{ color: '#2D5A3D' }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Thresholds modal */}
      <Modal visible={showThresholds} transparent animationType="fade" onRequestClose={() => setShowThresholds(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowThresholds(false)}>
          <TouchableOpacity activeOpacity={1}
            style={[styles.smallBox, { backgroundColor: T.modalBg, borderColor: T.modalBorder }]}>
            <Text style={[styles.cardTitle, { color: T.text, marginBottom: 16 }]}>Set Thresholds</Text>
            <Text style={[styles.hint, { color: T.text3, marginBottom: 4 }]}>Safe % (e.g. 75)</Text>
            <TextInput
              style={[styles.fullInput, { color: T.text, borderColor: T.border, backgroundColor: T.bg2 }]}
              placeholder="Leave blank to disable" placeholderTextColor={T.text3}
              value={safeInput} onChangeText={setSafeInput} keyboardType="numeric"
            />
            <Text style={[styles.hint, { color: T.text3, marginBottom: 4, marginTop: 12 }]}>Moderate % (e.g. 60)</Text>
            <TextInput
              style={[styles.fullInput, { color: T.text, borderColor: T.border, backgroundColor: T.bg2 }]}
              placeholder="Leave blank to disable" placeholderTextColor={T.text3}
              value={moderateInput} onChangeText={setModerateInput} keyboardType="numeric"
            />
            <TouchableOpacity style={[styles.createBtn, { marginTop: 16 }]} onPress={saveThresholdValues}>
              <Text style={styles.createBtnTxt}>Save</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Add transparent slot modal */}
      <TransparentModal
        visible={showTransparent} T={T}
        timetables={timetables}
        onClose={() => setShowTransparent(false)}
        onSave={(rule) => { saveTransparent([...transparentSlots, rule]); setShowTransparent(false); }}
      />

      {/* Hide date modal */}
      <Modal visible={showHideDates} transparent animationType="fade" onRequestClose={() => setShowHideDates(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowHideDates(false)}>
          <TouchableOpacity activeOpacity={1}
            style={[styles.smallBox, { backgroundColor: T.modalBg, borderColor: T.modalBorder }]}>
            <Text style={[styles.cardTitle, { color: T.text, marginBottom: 14 }]}>Hide Dates</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {[false, true].map(rm => (
                <TouchableOpacity key={String(rm)}
                  style={[styles.typeBtn, { borderColor: T.border },
                    hideRangeMode === rm && { backgroundColor: '#2D5A3D', borderColor: '#2D5A3D' }]}
                  onPress={() => setHideRangeMode(rm)}>
                  <Text style={[styles.typeBtnTxt, { color: hideRangeMode === rm ? '#FFFFFF' : T.text2 }]}>
                    {rm ? 'Date Range' : 'Single Date'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.fullInput, { color: T.text, borderColor: T.border, backgroundColor: T.bg2, marginBottom: 10 }]}
              placeholder="YYYY-MM-DD" placeholderTextColor={T.text3}
              value={hideDateInput} onChangeText={setHideDateInput}
            />
            {hideRangeMode && (
              <TextInput
                style={[styles.fullInput, { color: T.text, borderColor: T.border, backgroundColor: T.bg2, marginBottom: 10 }]}
                placeholder="End YYYY-MM-DD" placeholderTextColor={T.text3}
                value={hideDateEnd} onChangeText={setHideDateEnd}
              />
            )}
            <TouchableOpacity style={styles.createBtn} onPress={() => {
              const toAdd = [];
              if (!hideRangeMode) {
                if (hideDateInput) toAdd.push(hideDateInput);
              } else {
                const s = new Date(hideDateInput + 'T00:00:00');
                const e = new Date(hideDateEnd   + 'T00:00:00');
                if (!isNaN(s) && !isNaN(e) && e >= s) {
                  const c = new Date(s);
                  while (c <= e) { toAdd.push(c.toISOString().split('T')[0]); c.setDate(c.getDate()+1); }
                }
              }
              if (toAdd.length > 0) {
                saveHiddenDates([...new Set([...hiddenDates, ...toAdd])]);
              }
              setHideDateInput(''); setHideDateEnd(''); setShowHideDates(false);
            }}>
              <Text style={styles.createBtnTxt}>Hide</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ── Transparent slot sub-modal ──────────────────────────────────────
function TransparentModal({ visible, T, timetables, onClose, onSave }) {
  const [type, setType]       = useState('all'); // all | day | date
  const [day, setDay]         = useState('Monday');
  const [date, setDate]       = useState('');
  const [slotName, setSlotName] = useState('');
  const [error, setError]     = useState('');

  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  const allSlotNames = (() => {
    const names = new Set();
    timetables.forEach(tt => Object.values(tt.weekSlots).forEach(slots =>
      slots.forEach(s => names.add(s.name))));
    return [...names];
  })();

  const handleSave = () => {
    if (!slotName) { setError('Select a slot.'); return; }
    if (type === 'date' && !date) { setError('Enter a date.'); return; }
    onSave({ type, day: type === 'day' ? day : undefined, date: type === 'date' ? date : undefined, slotName });
    setType('all'); setDay('Monday'); setDate(''); setSlotName(''); setError('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1}
          style={[styles.smallBox, { backgroundColor: T.modalBg, borderColor: T.modalBorder }]}>
          <Text style={[styles.cardTitle, { color: T.text, marginBottom: 14 }]}>Add Excluded Slot</Text>

          {/* Type selector */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            {['all','day','date'].map(t => (
              <TouchableOpacity key={t}
                style={[styles.typeBtn, { borderColor: T.border },
                  type === t && { backgroundColor: '#2D5A3D', borderColor: '#2D5A3D' }]}
                onPress={() => setType(t)}>
                <Text style={[styles.typeBtnTxt, { color: type === t ? '#FFFFFF' : T.text2 }]}>
                  {t === 'all' ? 'All' : t === 'day' ? 'By Day' : 'By Date'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {type === 'day' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {DAYS.map(d => (
                  <TouchableOpacity key={d}
                    style={[styles.typeBtn, { borderColor: T.border },
                      day === d && { backgroundColor: '#2D5A3D', borderColor: '#2D5A3D' }]}
                    onPress={() => setDay(d)}>
                    <Text style={[styles.typeBtnTxt, { color: day === d ? '#FFFFFF' : T.text2 }]}>
                      {d.slice(0,3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          {type === 'date' && (
            <TextInput
              style={[styles.fullInput, { color: T.text, borderColor: T.border, backgroundColor: T.bg2, marginBottom: 12 }]}
              placeholder="YYYY-MM-DD" placeholderTextColor={T.text3}
              value={date} onChangeText={setDate}
            />
          )}

          <Text style={[styles.hint, { color: T.text3, marginBottom: 6 }]}>Select slot to exclude:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {allSlotNames.map(n => (
                <TouchableOpacity key={n}
                  style={[styles.typeBtn, { borderColor: T.border },
                    slotName === n && { backgroundColor: '#2D5A3D', borderColor: '#2D5A3D' }]}
                  onPress={() => setSlotName(n)}>
                  <Text style={[styles.typeBtnTxt, { color: slotName === n ? '#FFFFFF' : T.text2 }]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {error ? <Text style={styles.errorTxt}>{error}</Text> : null}
          <TouchableOpacity style={styles.createBtn} onPress={handleSave}>
            <Text style={styles.createBtnTxt}>Add</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  topBar:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  backTxt:        { fontSize: 14, fontWeight: '600' },
  pageTitle:      { fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  card:           { borderRadius: 14, borderWidth: 1, padding: 16 },
  cardTitle:      { fontSize: 15, fontWeight: '800', marginBottom: 10, letterSpacing: 0.3 },
  hint:           { fontSize: 12 },
  ttRow:          { flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
                    borderBottomWidth: 1 },
  ttName:         { fontSize: 14, fontWeight: '700' },
  ttDates:        { fontSize: 11, marginTop: 2 },
  ttExpanded:     { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  deleteBtn:      { marginTop: 10, paddingVertical: 8, alignItems: 'center',
                    borderRadius: 8, backgroundColor: '#E74C3C' },
  deleteTxt:      { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  createBtn:      { marginTop: 10, paddingVertical: 12, alignItems: 'center',
                    borderRadius: 10, backgroundColor: '#2D5A3D' },
  createBtnTxt:   { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  dropdown:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  dropdownTxt:    { fontSize: 14, fontWeight: '500' },
  radioRow:       { flexDirection: 'row', alignItems: 'center', padding: 12,
                    borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  radio:          { width: 18, height: 18, borderRadius: 9, borderWidth: 2,
                    alignItems: 'center', justifyContent: 'center' },
  radioDot:       { width: 9, height: 9, borderRadius: 5, backgroundColor: '#2D5A3D' },
  radioLabel:     { fontSize: 13, fontWeight: '700' },
  radioDesc:      { fontSize: 11, marginTop: 2 },
  transparentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingVertical: 8, borderBottomWidth: 1 },
  transparentTxt: { fontSize: 12, flex: 1 },
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)',
                    justifyContent: 'center', alignItems: 'center', padding: 20 },
  dropdownMenu:   { borderRadius: 14, borderWidth: 1, overflow: 'hidden', minWidth: 240, elevation: 10 },
  dropdownItem:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingVertical: 16, paddingHorizontal: 20 },
  dropdownItemTxt:{ fontSize: 15 },
  smallBox:       { width: '100%', maxWidth: 360, borderRadius: 18, padding: 22, borderWidth: 1, elevation: 20 },
  fullInput:      { height: 46, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, fontSize: 14 },
  typeBtn:        { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  typeBtnTxt:     { fontSize: 12, fontWeight: '600' },
  errorTxt:       { color: '#E74C3C', fontSize: 12, marginBottom: 8, textAlign: 'center' },
});

// Note: HideDateModal is appended below SettingsScreen
