import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  StatusBar, Modal,
} from 'react-native';
import { useTheme, THEMES } from '../context/ThemeContext';

export default function SettingsScreen({ navigation }) {
  const { theme, switchTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const T = theme;
  const options = [THEMES.DARK, THEMES.LIGHT];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.settingsBg }]}>
      <StatusBar barStyle={T.statusBarStyle} backgroundColor={T.statusBarBg} />

      {/* Top bar */}
      <View style={[styles.topBar, { backgroundColor: T.topBarBg, borderBottomColor: T.borderColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: T.backText }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: T.settingsText }]}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Single setting row */}
      <View style={[styles.settingRow, { borderBottomColor: T.borderColor }]}>
        <Text style={[styles.settingLabel, { color: T.settingsLabel }]}>Display Theme</Text>

        {/* Dropdown trigger */}
        <TouchableOpacity
          style={[styles.dropdown, { backgroundColor: T.dropdownBg, borderColor: T.dropdownBorder }]}
          onPress={() => setDropdownOpen(true)}
        >
          <Text style={[styles.dropdownText, { color: T.dropdownText }]}>{theme.name}</Text>
          <Text style={[styles.dropdownArrow, { color: T.dropdownText }]}>▾</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          <View style={[styles.dropdownMenu, { backgroundColor: T.dropdownBg, borderColor: T.dropdownBorder }]}>
            {options.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.dropdownItem,
                  { borderBottomColor: T.dropdownBorder },
                  theme.value === opt.value && { backgroundColor: T.dropdownSelected },
                ]}
                onPress={() => {
                  switchTheme(opt.value);
                  setDropdownOpen(false);
                }}
              >
                <Text style={[styles.dropdownItemText, { color: T.dropdownText }]}>{opt.name}</Text>
                {theme.value === opt.value && (
                  <Text style={{ color: T.statsBtnText, fontSize: 16 }}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  topBar:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingHorizontal: 14, paddingVertical: 12,
                    borderBottomWidth: 1 },
  backBtn:        { width: 60 },
  backText:       { fontSize: 14, fontWeight: '600' },
  title:          { fontSize: 16, fontWeight: '700' },
  settingRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1 },
  settingLabel:   { fontSize: 15, fontWeight: '600' },
  dropdown:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14,
                    paddingVertical: 10, borderRadius: 8, borderWidth: 1, minWidth: 150 },
  dropdownText:   { fontSize: 14, fontWeight: '500', flex: 1 },
  dropdownArrow:  { fontSize: 14, marginLeft: 6 },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
                    justifyContent: 'center', alignItems: 'center' },
  dropdownMenu:   { borderRadius: 12, borderWidth: 1, overflow: 'hidden',
                    minWidth: 220, elevation: 10,
                    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3, shadowRadius: 8 },
  dropdownItem:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  dropdownItemText: { fontSize: 15, fontWeight: '500' },
});
