import React, { useEffect, useRef } from 'react';
import { View, Image, Text, StyleSheet, Animated, StatusBar } from 'react-native';

export default function SplashScreen({ onDone }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    const t = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => onDone());
    }, 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.brand}>HeKuGo</Text>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  logo:      { width: 200, height: 200 },
  brand:     { position: 'absolute', bottom: 52, fontSize: 16, color: '#AAAAAA',
               fontWeight: '700', letterSpacing: 4 },
});
