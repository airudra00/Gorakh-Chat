import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
// Reanimated & Lottie could be used for advanced mesh UI animations here
import E2EEProtocol from './src/core/crypto/E2EEProtocol';
import RadarScreen from './src/screens/RadarScreen';

export default function App() {
  const [keys, setKeys] = useState<{ publicKey: string; privateKey: string } | null>(null);

  // 1. Initialize E2EE Identity on app load
  useEffect(() => {
    // Check if we have an existing key in local storage.
    // If not, generate a brand new Identity for Gorakh Chat.
    const newIdentity = E2EEProtocol.generateIdentity();
    setKeys(newIdentity);
    console.log("My Gorakh Chat Identity (Public Key):", newIdentity.publicKey);

    // TODO: Initialize ConnectionManager to start BLE Advertising here
  }, []);

  if (!keys) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Generating secure offline identity...</Text>
      </View>
    );
  }

  // Pass our generated Identity down to the Mesh Network UI
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* 
        The 'Radar UI' is the core of an offline mesh app. 
        It shows who is nearby within Bluetooth/WiFi range. 
      */}
      <RadarScreen myIdentity={keys} />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Deep modern dark mode (Glassmorphism base)
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '600'
  }
});
