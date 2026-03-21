import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import ConnectionManager, { MeshNode } from '../core/mesh/ConnectionManager';

export default function RadarScreen({ myIdentity }: { myIdentity: { publicKey: string } }) {
  const [nearbyUsers, setNearbyUsers] = useState<MeshNode[]>([]);
  
  // Animation Engine for the Radar Sweep
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Kick off the visual radar sweeping animations natively
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseValue, { toValue: 1.0, duration: 800, useNativeDriver: true })
      ])
    ).start();

    // 2. Hook directly into the LIVE Android/iOS Bluetooth Hardware Radio Stream!
    console.log("[Radar UI] Listening to live hardware stream...");
    
    const subscription = ConnectionManager.discoveredNodes.subscribe((device) => {
      setNearbyUsers((prev) => {
        // Prevent duplicates in the UI
        const exists = prev.find(d => d.id === device.id);
        if (exists) return prev;
        
        return [...prev, device];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Gorakh Chat</Text>
      <Text style={styles.subtext}>Your ID: {myIdentity.publicKey.substring(0, 16)}...</Text>
      
      {/* Dynamic Animated Sweeping Radar */}
      <View style={styles.radarContainer}>
        <View style={styles.radarOrb}>
          <Animated.View style={[styles.radarPulse, { transform: [{ scale: pulseValue }] }]} />
          
          {/* Sweeper Line */}
          <Animated.View style={[styles.sweeper, { transform: [{ rotate: spin }] }]}>
            <View style={styles.sweeperLine} />
          </Animated.View>
        </View>
      </View>

      <Text style={styles.foundText}>
        {nearbyUsers.length === 0 ? "Scanning airspace offline..." : `Intercepted ${nearbyUsers.length} Devices!`}
      </Text>

      <ScrollView style={styles.list}>
        {nearbyUsers.map(user => (
          <TouchableOpacity key={user.id} style={styles.glassCard}>
            <View>
              <Text style={styles.userName}>{user.publicKey || 'Encrypted Node'}</Text>
              <Text style={styles.userInfo}>MAC: {user.id} | Signal RSSI: {user.rssi}</Text>
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
  radarContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 200,
    marginBottom: 30
  },
  radarOrb: {
    width: 180,
    height: 180,
    borderRadius: 90,
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
  },
  radarPulse: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(34, 197, 94, 0.5)',
  },
  sweeper: {
    position: 'absolute',
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sweeperLine: {
    position: 'absolute',
    top: 90,
    right: 0,
    width: 90,
    height: 2,
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
    transform: [{ translateY: -1 }],
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
