import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@zeitplan_theme';

export const THEMES = {
  DARK: {
    name: 'Midnight Dark',
    value: 'DARK',
    // Backgrounds
    appBg:        '#000000',
    topBarBg:     '#000000',
    headerBg:     '#111111',
    headerAccent: '#1a3a1a',
    rowBg:        '#000000',
    rowAltBg:     '#0a0a0a',
    cellBg:       '#0f0f0f',
    labCellBg:    '#141414',
    lunchCellBg:  '#050505',
    dateCellBg:   '#000000',
    modalBg:      '#111111',
    settingsBg:   '#000000',
    // Borders
    borderColor:  '#1a1a1a',
    topBorderColor: '#1a3a1a',
    // Text
    appTitleColor:  '#ffffff',
    dateText:       '#666666',
    cellText:       '#cccccc',
    labText:        '#aaaaaa',
    lunchText:      '#333333',
    headerText:     '#ffffff',
    modalTitle:     '#ffffff',
    modalSubtitle:  '#444444',
    settingsText:   '#ffffff',
    settingsLabel:  '#888888',
    // Buttons
    statsBtnBg:    '#0f1f0f',
    statsBtnBorder:'#1a3a1a',
    statsBtnText:  '#44aa44',
    backText:      '#44aa44',
    clearBtnBorder:'#222222',
    clearText:     '#555555',
    statusBarStyle: 'light-content',
    statusBarBg:   '#000000',
    // Dropdown
    dropdownBg:    '#111111',
    dropdownBorder:'#222222',
    dropdownText:  '#ffffff',
    dropdownSelected: '#1a3a1a',
  },
  LIGHT: {
    name: 'Bright Light',
    value: 'LIGHT',
    // Backgrounds
    appBg:        '#ffffff',
    topBarBg:     '#ffffff',
    headerBg:     '#f5f5f5',
    headerAccent: '#2d5a2d',
    rowBg:        '#ffffff',
    rowAltBg:     '#f9f9f9',
    cellBg:       '#f0f0f0',
    labCellBg:    '#e8e8e8',
    lunchCellBg:  '#fafafa',
    dateCellBg:   '#ffffff',
    modalBg:      '#ffffff',
    settingsBg:   '#ffffff',
    // Borders
    borderColor:  '#e0e0e0',
    topBorderColor: '#2d5a2d',
    // Text
    appTitleColor:  '#000000',
    dateText:       '#666666',
    cellText:       '#222222',
    labText:        '#333333',
    lunchText:      '#bbbbbb',
    headerText:     '#ffffff',
    modalTitle:     '#000000',
    modalSubtitle:  '#888888',
    settingsText:   '#000000',
    settingsLabel:  '#555555',
    // Buttons
    statsBtnBg:    '#e8f0e8',
    statsBtnBorder:'#2d5a2d',
    statsBtnText:  '#2d5a2d',
    backText:      '#2d5a2d',
    clearBtnBorder:'#dddddd',
    clearText:     '#999999',
    statusBarStyle: 'dark-content',
    statusBarBg:   '#ffffff',
    // Dropdown
    dropdownBg:    '#ffffff',
    dropdownBorder:'#dddddd',
    dropdownText:  '#000000',
    dropdownSelected: '#e8f0e8',
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(THEMES.DARK);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(val => {
      if (val && THEMES[val]) setTheme(THEMES[val]);
    });
  }, []);

  const switchTheme = (themeValue) => {
    const t = THEMES[themeValue] || THEMES.DARK;
    setTheme(t);
    AsyncStorage.setItem(THEME_KEY, themeValue);
  };

  return (
    <ThemeContext.Provider value={{ theme, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
