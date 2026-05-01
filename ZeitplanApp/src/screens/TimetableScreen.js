import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, StatusBar, Animated,
  SafeAreaView, Image, FlatList,
  Dimensions,
} from 'react-native';
import { SCHEDULE, TIME_SLOTS, ATTENDANCE_OPTIONS, DAY_COLORS } from '../data/timetable';
import { makeKey } from '../utils/attendance';
import { saveAttendance, loadAttendance } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_W } = Dimensions.get('window');

const DATE_COL = 72;   // fixed left column — never scrolls horizontally
const SLOT_W   = 96;   // each slot column width (wide = comfortable, rectangular feel)
const SLOT_H   = 58;   // row height
const HEADER_H = 44;   // time-slot header height

// Build "DD Mon" from "DD-Mon-YYYY"
function parseDateParts(dateStr) {
  const p = dateStr.split('-');
  return { day: p[0], mon: p[1] };
}

// Today's date in SCHEDULE format "DD-Mon-YYYY"
function todayStr() {
  const d   = new Date();
  const dd  = String(d.getDate()).padStart(2, '0');
  const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
  return `${dd}-${mon}-${d.getFullYear()}`;
}

export default function TimetableScreen({ navigation }) {
  const { theme: T }              = useTheme();
  const [attendance, setAttendance] = useState({});
  const [modal, setModal]           = useState(null);
  const fadeAnim                    = useRef(new Animated.Value(0)).current;
  const flatRef                     = useRef(null);
  const logoTapCount                = useRef(0);
  const logoTapTimer                = useRef(null);

  // ── Load & scroll to last filled row ───────────────────────────────────────
  useEffect(() => {
    loadAttendance().then(data => {
      const att = data || {};
      setAttendance(att);

      // Find last row with any marked cell
      let targetIdx = -1;
      for (let i = SCHEDULE.length - 1; i >= 0; i--) {
        const row    = SCHEDULE[i];
        const hasAny = row.slots.some((_, si) => att[makeKey(i, si)]);
        if (hasAny) { targetIdx = i; break; }
      }
      if (targetIdx > 0) {
        setTimeout(() => {
          flatRef.current?.scrollToIndex({
            index: targetIdx,
            animated: false,
            viewPosition: 0.3,
          });
        }, 300);
      }
    });
  }, []);

  useEffect(() => {
    if (Object.keys(attendance).length > 0) saveAttendance(attendance);
  }, [attendance]);

  // ── Modal ──────────────────────────────────────────────────────────────────
  const openModal = useCallback((dateIdx, slotIdx, subject) => {
    if (!subject || subject === 'LUNCH') return;
    setModal({ dateIdx, slotIdx, subject });
    Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const closeModal = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => setModal(null));
  };

  const selectStatus = useCallback((status) => {
    if (!modal) return;
    const key     = makeKey(modal.dateIdx, modal.slotIdx);
    const updated = { ...attendance, [key]: status };
    setAttendance(updated);
    saveAttendance(updated);
    closeModal();
  }, [modal, attendance]);

  const clearStatus = useCallback(() => {
    if (!modal) return;
    const key     = makeKey(modal.dateIdx, modal.slotIdx);
    const updated = { ...attendance };
    delete updated[key];
    setAttendance(updated);
    saveAttendance(updated);
    closeModal();
  }, [modal, attendance]);

  // ── Triple-tap logo → Settings ─────────────────────────────────────────────
  const handleLogoTap = () => {
    logoTapCount.current += 1;
    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
    if (logoTapCount.current >= 3) {
      logoTapCount.current = 0;
      navigation.navigate('Settings');
    } else {
      logoTapTimer.current = setTimeout(() => { logoTapCount.current = 0; }, 700);
    }
  };

  // ── Render a single data row ───────────────────────────────────────────────
  // Layout:
  //   [ DATE COL fixed ] [ horizontal ScrollView with subject cells ]
  // The date col is outside the ScrollView so it never scrolls left/right.
  // Vertical scrolling is handled by the outer FlatList — so diagonal swipes
  // naturally move up/down (FlatList) and left/right (inner ScrollView) at once.
  const renderRow = useCallback(({ item: row, index: dateIdx }) => {
    const dayColor = DAY_COLORS[row.day] || { bg: '#333', text: '#fff' };
    const { day, mon } = parseDateParts(row.date);
    const slots = row.slots;
    const cells = [];
    let si = 0;

    while (si < slots.length) {
      const subject = slots[si];
      if (subject === null) { si++; continue; }

      const isLab   = subject === 'TA LAB' || subject === 'AC LAB';
      const isLunch = subject === 'LUNCH';
      const span    = isLab ? 2 : 1;
      const cellW   = SLOT_W * span - 3;
      const attKey  = makeKey(dateIdx, si);
      const status  = attendance[attKey];
      const opt     = status ? ATTENDANCE_OPTIONS.find(o => o.value === status) : null;
      const finalSi = si;

      cells.push(
        <TouchableOpacity
          key={si}
          style={[
            styles.cell,
            {
              width: cellW,
              height: SLOT_H - 6,
              backgroundColor: opt
                ? opt.color
                : isLab
                  ? T.labCellBg
                  : isLunch
                    ? T.lunchCellBg
                    : T.cellBg,
            },
          ]}
          onPress={() => !isLunch && openModal(dateIdx, finalSi, subject)}
          activeOpacity={isLunch ? 1 : 0.7}
        >
          <Text
            style={[
              styles.cellText,
              {
                color: opt
                  ? opt.textColor
                  : isLab
                    ? T.labText
                    : isLunch
                      ? T.lunchText
                      : T.cellText,
              },
              isLab && styles.labTextStyle,
            ]}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            {subject}
          </Text>
          {status && (
            <Text style={[styles.statusDot, { color: opt ? opt.textColor : T.cellText }]}>
              {status === 'Present' ? '✓' : status === 'Absent' ? '✗' : '~'}
            </Text>
          )}
        </TouchableOpacity>
      );
      si += span;
    }

    return (
      <View
        style={[
          styles.row,
          {
            height: SLOT_H,
            backgroundColor: dateIdx % 2 === 0 ? T.rowBg : T.rowAltBg,
            borderBottomColor: T.borderColor,
          },
        ]}
      >
        {/* ── Fixed date column (outside horizontal ScrollView) ── */}
        <View
          style={[
            styles.dateCell,
            { width: DATE_COL, backgroundColor: T.dateCellBg, borderRightColor: T.borderColor },
          ]}
        >
          <Text style={[styles.dateNum, { color: T.dateText }]}>{day} {mon}</Text>
          <View style={[styles.dayBadge, { backgroundColor: dayColor.bg }]}>
            <Text style={[styles.dayText, { color: dayColor.text }]}>{row.day.slice(0, 3)}</Text>
          </View>
        </View>

        {/* ── Scrollable subject cells (independent per row — no sync needed) ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.slotsInner}
          style={{ flex: 1 }}
          // nestedScrollEnabled allows diagonal scroll: FlatList takes vertical,
          // this ScrollView takes horizontal — they don't conflict.
          nestedScrollEnabled
        >
          {cells}
        </ScrollView>
      </View>
    );
  }, [attendance, T, openModal]);

  // ── Fixed time-slot header (never scrolls vertically or horizontally) ──────
  // It is OUTSIDE the FlatList so it stays pinned at top always.
  // Its horizontal scroll is independent — user can scroll it to peek at slot labels,
  // but rows scroll independently anyway so this is just a reference header.
  const renderHeader = () => (
    <View
      style={[
        styles.headerRow,
        { height: HEADER_H, backgroundColor: T.headerAccent, borderBottomColor: T.topBorderColor },
      ]}
    >
      {/* Fixed corner above date column */}
      <View
        style={[
          styles.headerCorner,
          { width: DATE_COL, backgroundColor: T.headerAccent, borderRightColor: T.borderColor },
        ]}
      >
        <Text style={[styles.headerText, { color: T.headerText }]}>Date</Text>
      </View>

      {/* Time slot labels — scrollable so user can reference them while scrolling rows */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.slotsInner}
        style={{ flex: 1 }}
        scrollEnabled={false}  // header is pinned; rows scroll freely on their own
      >
        {TIME_SLOTS.map((slot, i) => (
          <View
            key={i}
            style={[
              styles.headerCell,
              { width: SLOT_W - 3, height: HEADER_H, backgroundColor: T.headerAccent },
            ]}
          >
            <Text
              style={[styles.headerText, { color: T.headerText }]}
              adjustsFontSizeToFit
              numberOfLines={2}
            >
              {slot}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.appBg }]}>
      <StatusBar barStyle={T.statusBarStyle} backgroundColor={T.statusBarBg} />

      {/* Top bar */}
      <View style={[styles.topBar, { backgroundColor: T.topBarBg, borderBottomColor: T.borderColor }]}>
        <TouchableOpacity onPress={handleLogoTap} activeOpacity={0.85}>
          <Image
            source={
              T.value === 'LIGHT'
                ? require('../../assets/logo_light.png')
                : require('../../assets/logo_dark.png')
            }
            style={styles.logoImg}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statsBtn, { backgroundColor: T.statsBtnBg, borderColor: T.statsBtnBorder }]}
          onPress={() => navigation.navigate('Summary', { attendance })}
        >
          <Text style={[styles.statsBtnText, { color: T.statsBtnText }]}>Stats →</Text>
        </TouchableOpacity>
      </View>

      {/* Pinned time-slot header — never moves */}
      {renderHeader()}

      {/* Scrollable rows list */}
      <FlatList
        ref={flatRef}
        data={SCHEDULE}
        keyExtractor={item => item.date}
        renderItem={renderRow}
        getItemLayout={(_, index) => ({ length: SLOT_H, offset: SLOT_H * index, index })}
        initialNumToRender={20}
        windowSize={10}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={info => {
          setTimeout(
            () => flatRef.current?.scrollToIndex({ index: info.index, animated: false }),
            500,
          );
        }}
      />

      {/* Attendance Modal */}
      <Modal visible={!!modal} transparent animationType="none" onRequestClose={closeModal}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeModal}>
          <Animated.View
            style={[
              styles.modalBox,
              { opacity: fadeAnim, backgroundColor: T.modalBg, borderColor: T.borderColor },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <Text style={[styles.modalTitle, { color: T.modalTitle }]}>{modal?.subject}</Text>
              <Text style={[styles.modalSubtitle, { color: T.modalSubtitle }]}>Mark attendance</Text>

              {ATTENDANCE_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionBtn, { backgroundColor: opt.color }]}
                  onPress={() => selectStatus(opt.value)}
                >
                  <Text style={[styles.optionText, { color: opt.textColor }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.clearBtn, { borderColor: T.clearBtnBorder }]}
                onPress={clearStatus}
              >
                <Text style={[styles.clearText, { color: T.clearText }]}>✕  Clear</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },

  topBar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                   paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1 },
  logoImg:       { width: 160, height: 40 },
  statsBtn:      { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  statsBtnText:  { fontSize: 13, fontWeight: '600' },

  // Header row — pinned above FlatList
  headerRow:     { flexDirection: 'row', borderBottomWidth: 2 },
  headerCorner:  { justifyContent: 'center', alignItems: 'center', borderRightWidth: 1 },
  headerCell:    { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 2 },
  headerText:    { fontSize: 9, fontWeight: '700', textAlign: 'center' },

  // Data rows
  row:           { flexDirection: 'row', borderBottomWidth: 1 },
  dateCell:      { justifyContent: 'center', alignItems: 'center',
                   paddingHorizontal: 4, borderRightWidth: 1 },
  dateNum:       { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  dayBadge:      { marginTop: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  dayText:       { fontSize: 9, fontWeight: '700' },

  slotsInner:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 1 },

  // Subject cells — wider than tall = rectangular
  cell:          { marginHorizontal: 1.5, borderRadius: 5,
                   justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  cellText:      { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  labTextStyle:  { fontSize: 9, fontWeight: '700' },
  statusDot:     { fontSize: 9, marginTop: 1 },

  // Modal
  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)',
                   justifyContent: 'center', alignItems: 'center' },
  modalBox:      { borderRadius: 16, padding: 20, width: 300, borderWidth: 1,
                   shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
                   shadowOpacity: 0.5, shadowRadius: 16, elevation: 20 },
  modalTitle:    { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  modalSubtitle: { fontSize: 12, marginBottom: 16 },
  optionBtn:     { paddingVertical: 13, borderRadius: 10, marginBottom: 8,
                   alignItems: 'center', elevation: 2 },
  optionText:    { fontSize: 14, fontWeight: '700' },
  clearBtn:      { marginTop: 4, paddingVertical: 11, alignItems: 'center',
                   borderRadius: 10, borderWidth: 1 },
  clearText:     { fontSize: 13 },
});
