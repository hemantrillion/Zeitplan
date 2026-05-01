import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';

// Change this to your desired password
const APP_PASSWORD = 'zeitplan2026';

export default function PasswordScreen({ onUnlock }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (input === APP_PASSWORD) {
      onUnlock();
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Image
        source={require('../../assets/splash_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>ZEITPLAN</Text>
      <Text style={styles.subtitle}>Enter access password</Text>

      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={input}
        onChangeText={setInput}
        secureTextEntry
        placeholder="Password"
        placeholderTextColor="#bbbbbb"
        onSubmitEditing={handleSubmit}
        autoFocus
      />
      {error && <Text style={styles.errorText}>Incorrect password</Text>}

      <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
        <Text style={styles.btnText}>Unlock</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#ffffff', alignItems: 'center',
                 justifyContent: 'center', paddingHorizontal: 40 },
  logo:        { width: 120, height: 120, marginBottom: 16 },
  title:       { fontSize: 28, fontWeight: '900', color: '#000000',
                 letterSpacing: 6, marginBottom: 6 },
  subtitle:    { fontSize: 13, color: '#888888', marginBottom: 32 },
  input:       { width: '100%', borderWidth: 1.5, borderColor: '#dddddd',
                 borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
                 fontSize: 16, color: '#000000', backgroundColor: '#f9f9f9',
                 marginBottom: 8 },
  inputError:  { borderColor: '#ff3333' },
  errorText:   { color: '#ff3333', fontSize: 13, marginBottom: 8 },
  btn:         { width: '100%', backgroundColor: '#2d5a2d', borderRadius: 12,
                 paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnText:     { color: '#ffffff', fontWeight: '700', fontSize: 16, letterSpacing: 1 },
});
