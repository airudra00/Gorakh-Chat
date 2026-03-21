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
      <Text style={styles.headerTitle}>Gorakh Chat</Text>
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
    backgroundColor: '#020617', // Extremely deep black/green base
    alignItems: 'center',
  },
  headerTitle: {
    color: '#22C55E', // Neon hacker green
    fontSize: 28,
    fontWeight: '900',
    marginTop: 20,
    letterSpacing: 1
  },
  subtext: {
    color: '#3F6212',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 30
  },
  radarOrb: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 15,
    marginBottom: 30
  },
  radarPulse: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(34, 197, 94, 0.7)',
  },
  foundText: {
    color: '#4ADE80',
    marginBottom: 20,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5
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
    borderRadius: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    marginBottom: 15
  },
  userName: {
    color: '#F0FDF4',
    fontSize: 16,
    fontWeight: 'bold'
  },
  userInfo: {
    color: '#86EFAC',
    fontSize: 12,
    marginTop: 4
  },
  chatButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#22C55E',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5
  },
  chatBtnText: {
    color: '#022C22',
    fontWeight: '900',
    fontSize: 14
  }
});
