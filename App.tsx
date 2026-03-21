import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
// Reanimated & Lottie could be used for advanced mesh UI animations here
import E2EEProtocol from './src/core/crypto/E2EEProtocol';
import ConnectionManager from './src/core/mesh/ConnectionManager';
import { MeshNode } from './src/core/mesh/ConnectionManager';
import RadarScreen from './src/screens/RadarScreen';
import ChatScreen from './src/screens/ChatScreen';

export default function App() {
  const [keys, setKeys] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [activeChat, setActiveChat] = useState<MeshNode | null>(null);

  // 1. Initialize E2EE Identity on app load
  useEffect(() => {
    // Check if we have an existing key in local storage.
    // If not, generate a brand new Identity for Gorakh Chat.
    const newIdentity = E2EEProtocol.generateIdentity();
    setKeys(newIdentity);
    console.log("My Gorakh Chat Identity (Public Key):", newIdentity.publicKey);

    // Prompt the User to violently open up their Android Bluetooth radios
    ConnectionManager.initializeMesh();
  }, []);

  if (!keys) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Generating secure offline identity...</Text>
      </View>
    );
  }

  // Conditional Navigation: Fast, native, no deep libraries needed.
  if (activeChat) {
    return <ChatScreen peer={activeChat} goBack={() => setActiveChat(null)} myIdentity={keys} />;
  }

  // Pass our generated Identity down to the Mesh Network UI
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <RadarScreen myIdentity={keys} onChatPress={(peer) => setActiveChat(peer)} />
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
