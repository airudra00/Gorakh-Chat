import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function RadarScreen({ myIdentity }: { myIdentity: { publicKey: string } }) {
  // Temporary mock data to simulate Mesh Network discovery
  const mockNearbyUsers = [
    { id: 'usr-1', name: 'Alina (BLE)', distance: '10m', signal: 'Strong', battery: '80%' },
    { id: 'usr-2', name: 'Ramesh (Wi-Fi Direct)', distance: '45m', signal: 'Medium', battery: '50%' },
    { id: 'usr-3', name: 'Unknown Device', distance: '150m (Hop)', signal: 'Weak', battery: '??' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Nearby Mesh Radar</Text>
      <Text style={styles.subtext}>Your ID: {myIdentity.publicKey.substring(0, 16)}...</Text>
      
      {/* 
        This is where a Lottie animation of a sweeping radar would go.
        For now, a glowing glassmorphism orb placeholder.
      */}
      <View style={styles.radarOrb}>
        <View style={styles.radarPulse} />
      </View>

      <Text style={styles.foundText}>Scanning for devices offline...</Text>

      <ScrollView style={styles.list}>
        {mockNearbyUsers.map(user => (
          <TouchableOpacity key={user.id} style={styles.glassCard}>
            <View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userInfo}>Distance: {user.distance} | {user.signal}</Text>
            </View>
            <TouchableOpacity style={styles.chatButton}>
              <Text style={styles.chatBtnText}>Chat</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0F172A', // Slate 900
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20
  },
  subtext: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 30
  },
  radarOrb: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 30
  },
  radarPulse: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(56, 189, 248, 0.8)',
  },
  foundText: {
    color: '#38BDF8',
    marginBottom: 20,
    fontSize: 14,
    fontWeight: '600'
  },
  list: {
    flex: 1,
    width: '100%'
  },
  glassCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 15
  },
  userName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  },
  userInfo: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4
  },
  chatButton: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20
  },
  chatBtnText: {
    color: '#0F172A',
    fontWeight: 'bold'
  }
});
