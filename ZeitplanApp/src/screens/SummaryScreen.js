import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { SUBJECTS } from '../data/timetable';
import { computeSubjectStats } from '../utils/attendance';
import { useTheme } from '../context/ThemeContext';

export default function SummaryScreen({ route, navigation }) {
  const { attendance } = route.params;
  const { theme: T }   = useTheme();
  const stats          = useMemo(() => computeSubjectStats(attendance), [attendance]);

  const getPercentColor = (pct, total) => {
    if (total === 0) return T.settingsLabel;
    if (pct >= 75) return '#00B050';
    if (pct >= 60) return '#FF8C00';
    return '#FF0000';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.appBg }]}>
      <StatusBar barStyle={T.statusBarStyle} backgroundColor={T.statusBarBg} />

      <View style={[styles.topBar, { backgroundColor: T.topBarBg, borderBottomColor: T.borderColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: T.backText }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: T.settingsText }]}>Attendance Summary</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Legend */}
      <View style={[styles.legendRow, { backgroundColor: T.headerBg }]}>
        {[['#00B050','≥75%'],['#FF8C00','60–74%'],['#FF0000','<60%']].map(([c,l]) => (
          <View key={l} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: c }]} />
            <Text style={[styles.legendText, { color: T.settingsLabel }]}>{l}</Text>
          </View>
        ))}
      </View>

      {/* Table header */}
      <View style={[styles.tableHeader, { backgroundColor: T.headerAccent }]}>
        <Text style={[styles.th, { flex: 2 }]}>Subject</Text>
        <Text style={styles.th}>Total</Text>
        <Text style={styles.th}>Present</Text>
        <Text style={styles.th}>Absent</Text>
        <Text style={styles.th}>ML</Text>
        <Text style={[styles.th, { color: '#a0ffa0' }]}>%</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {SUBJECTS.map((sub, i) => {
          const s        = stats[sub] || { total: 0, present: 0, absent: 0, ml: 0, percent: 0 };
          const pctColor = getPercentColor(s.percent, s.total);
          return (
            <View key={sub} style={[
              styles.tableRow,
              { borderBottomColor: T.borderColor,
                backgroundColor: i % 2 === 0 ? T.rowBg : T.rowAltBg }
            ]}>
              <Text style={[styles.td, styles.subjectTd, { flex: 2, color: T.cellText }]} numberOfLines={1}>
                {sub}
              </Text>
              <Text style={[styles.td, { color: T.settingsLabel }]}>{s.total || '–'}</Text>
              <Text style={[styles.td, s.present > 0 && styles.presentTd]}>{s.present || '–'}</Text>
              <Text style={[styles.td, s.absent  > 0 && styles.absentTd]}>{s.absent  || '–'}</Text>
              <Text style={[styles.td, s.ml      > 0 && styles.mlTd]}>{s.ml      || '–'}</Text>
              <Text style={[styles.td, styles.pctTd, { color: pctColor }]}>
                {s.total === 0 ? '–' : `${s.percent}%`}
              </Text>
            </View>
          );
        })}
        {/* No footer formula per change #5 */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  topBar:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                 paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn:     { width: 60 },
  backText:    { fontSize: 14, fontWeight: '600' },
  title:       { fontSize: 16, fontWeight: '700' },
  legendRow:   { flexDirection: 'row', justifyContent: 'center', paddingVertical: 10,
                 gap: 20 },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot:         { width: 10, height: 10, borderRadius: 5 },
  legendText:  { fontSize: 12 },
  tableHeader: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 8 },
  th:          { flex: 1, color: '#FFFFFF', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  tableRow:    { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8,
                 borderBottomWidth: 1 },
  td:          { flex: 1, fontSize: 12, textAlign: 'center' },
  subjectTd:   { fontWeight: '600', textAlign: 'left', paddingLeft: 4 },
  presentTd:   { color: '#00B050', fontWeight: '700' },
  absentTd:    { color: '#FF5555', fontWeight: '700' },
  mlTd:        { color: '#FF8C00', fontWeight: '700' },
  pctTd:       { fontWeight: '800', fontSize: 13 },
});
