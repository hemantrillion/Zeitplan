import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';
import { useApp } from '../context/AppContext';

export default function SummaryScreen({ navigation }) {
  const { theme: T, computeStats, thresholds } = useApp();
  const stats = useMemo(() => computeStats(), []);

  const getPercentColor = (pct) => {
    if (pct === null) return T.text3;
    const { safe, moderate } = thresholds;
    if (safe === null && moderate === null) return T.text; // no thresholds set
    if (safe !== null && pct >= safe) return '#27AE60';
    if (moderate !== null && pct >= moderate) return '#E67E22';
    return '#C0392B';
  };

  const subjects = Object.keys(stats);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.isDark ? 'light-content' : 'dark-content'} backgroundColor={T.topBarBg} />

      <View style={[styles.topBar, { backgroundColor: T.topBarBg, borderBottomColor: T.topBarBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backTxt, { color: T.isDark ? '#2ECC71' : '#2D5A3D' }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: T.text }]}>Attendance Summary</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Threshold legend if set */}
      {(thresholds.safe !== null || thresholds.moderate !== null) && (
        <View style={[styles.legendRow, { backgroundColor: T.bg2 }]}>
          {thresholds.safe !== null && (
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#27AE60' }]} />
              <Text style={[styles.legendTxt, { color: T.text2 }]}>≥{thresholds.safe}%</Text>
            </View>
          )}
          {thresholds.moderate !== null && (
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#E67E22' }]} />
              <Text style={[styles.legendTxt, { color: T.text2 }]}>≥{thresholds.moderate}%</Text>
            </View>
          )}
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#C0392B' }]} />
            <Text style={[styles.legendTxt, { color: T.text2 }]}>Below</Text>
          </View>
        </View>
      )}

      {/* Table header */}
      <View style={[styles.tableHeader, { backgroundColor: T.headerBg }]}>
        <Text style={[styles.th, { flex: 2, textAlign: 'left', paddingLeft: 10 }]}>Subject</Text>
        <Text style={styles.th}>Total</Text>
        <Text style={styles.th}>Present</Text>
        <Text style={styles.th}>Absent</Text>
        <Text style={styles.th}>ML</Text>
        <Text style={[styles.th, { color: '#AADDFF' }]}>%</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {subjects.length === 0 ? (
          <Text style={[styles.emptyTxt, { color: T.text3 }]}>No attendance data yet.</Text>
        ) : subjects.map((sub, i) => {
          const s = stats[sub];
          const pctColor = getPercentColor(s.percent);
          return (
            <View key={sub} style={[styles.row,
              { borderBottomColor: T.border },
              i % 2 === 0 ? { backgroundColor: T.bg } : { backgroundColor: T.bg2 }]}>
              <Text style={[styles.td, { flex: 2, textAlign: 'left', paddingLeft: 10,
                color: T.text, fontWeight: '600' }]} numberOfLines={1}>{sub}</Text>
              <Text style={[styles.td, { color: T.text2 }]}>{s.total || '–'}</Text>
              <Text style={[styles.td, s.present > 0 && styles.greenTd]}>{s.present || '–'}</Text>
              <Text style={[styles.td, s.absent > 0 && styles.redTd]}>{s.absent || '–'}</Text>
              <Text style={[styles.td, s.ml > 0 && styles.orangeTd]}>{s.ml || '–'}</Text>
              <Text style={[styles.td, { color: pctColor, fontWeight: '800', fontSize: 13 }]}>
                {s.percent !== null ? `${s.percent}%` : '–'}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  topBar:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                 paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn:     { width: 60 },
  backTxt:     { fontSize: 14, fontWeight: '600' },
  title:       { fontSize: 16, fontWeight: '700' },
  legendRow:   { flexDirection: 'row', justifyContent: 'center', paddingVertical: 8, gap: 18 },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot:         { width: 9, height: 9, borderRadius: 5 },
  legendTxt:   { fontSize: 11 },
  tableHeader: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 4 },
  th:          { flex: 1, color: '#FFFFFF', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  row:         { flexDirection: 'row', paddingVertical: 13, paddingHorizontal: 4, borderBottomWidth: 1 },
  td:          { flex: 1, fontSize: 12, textAlign: 'center', color: '#888' },
  greenTd:     { color: '#27AE60', fontWeight: '700' },
  redTd:       { color: '#C0392B', fontWeight: '700' },
  orangeTd:    { color: '#E67E22', fontWeight: '700' },
  emptyTxt:    { textAlign: 'center', marginTop: 60, fontSize: 14 },
});
