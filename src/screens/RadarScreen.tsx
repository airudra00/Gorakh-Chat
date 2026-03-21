import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import ConnectionManager, { MeshNode } from '../core/mesh/ConnectionManager';

const { width } = Dimensions.get('window');
const RADAR_SIZE = width * 0.85;
const CENTER = RADAR_SIZE / 2;

export interface RadarNode extends MeshNode {
  angle: number;
  distance: number;
}

export default function RadarScreen({ myIdentity, onChatPress }: { myIdentity: { publicKey: string }, onChatPress: (peer: MeshNode) => void }) {
  const [nearbyUsers, setNearbyUsers] = useState<RadarNode[]>([]);
  
  // High-Performance Engine
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  // Blinks the dots smoothly
  const blinkValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Visually aggressively sweeping radar blade natively
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3500, // slower, realistic military rotation
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 2. Subtle center sonar pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseValue, { toValue: 1.0, duration: 1500, useNativeDriver: true })
      ])
    ).start();

    // 3. Blinking targeting reticles
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkValue, { toValue: 0.2, duration: 400, useNativeDriver: true }),
        Animated.timing(blinkValue, { toValue: 1.0, duration: 400, useNativeDriver: true })
      ])
    ).start();

    // Hook directly into the LIVE Bluetooth / Wi-Fi Streams
    const subscription = ConnectionManager.discoveredNodes.subscribe((device) => {
      setNearbyUsers((prev) => {
        // Prevent duplicate ghost devices
        const exists = prev.find(d => d.id === device.id);
        if (exists) return prev;
        
        console.log(`[Radar UI] Target acquired: ${device.id}`);
        // Physically position the blip realistically around you
        const angle = Math.random() * Math.PI * 2;
        const distance = 0.15 + (Math.random() * 0.75); // Avoid center and edges
        
        return [...prev, { ...device, angle, distance }];
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerPlate}>
        <Text style={styles.systemStatus}>GORAKH AIRSPACE ONLINE</Text>
        <Text style={styles.headerTitle}>TACTICAL RADAR</Text>
        <Text style={styles.subtext}>AWAITING HANDSHAKE | YOUR KEY: {myIdentity.publicKey.substring(0, 16)}...</Text>
      </View>
      
      {/* ==================================
          THE PHYSICAL RADAR ENGINE 
          ================================== */}
      <View style={styles.radarContainer}>
        <View style={styles.radarOrb}>
          
          {/* Sonar Rings */}
          <Animated.View style={[styles.ring1, { transform: [{ scale: pulseValue }] }]} />
          <View style={styles.ring2} />
          <View style={styles.ring3} />
          
          {/* Military Crosshairs */}
          <View style={styles.crosshairVertical} />
          <View style={styles.crosshairHorizontal} />

          {/* Sweeper Tactical Blade */}
          <Animated.View style={[styles.sweeper, { transform: [{ rotate: spin }] }]}>
            <View style={styles.sweeperLine} />
            <View style={styles.sweeperBeam} />
          </Animated.View>

          {/* Intercepted Target Blips */}
          {nearbyUsers.map(user => {
            // Plot hardware coordinates
            const maxRadius = RADAR_SIZE / 2;
            const cx = (Math.cos(user.angle) * user.distance * maxRadius);
            const cy = (Math.sin(user.angle) * user.distance * maxRadius); 
            return (
              <Animated.View 
                key={user.id} 
                style={[
                  styles.blip, 
                  { 
                    transform: [{ translateX: cx }, { translateY: cy }],
                    opacity: blinkValue 
                  }
                ]} 
              />
            )
          })}
        </View>
      </View>

      <View style={styles.intelContainer}>
        <Text style={styles.foundText}>
          {nearbyUsers.length === 0 ? "SCANNING SECTORS..." : `[WARNING] ${nearbyUsers.length} TARGETS ACQUIRED!`}
        </Text>
        
        <ScrollView style={styles.list}>
          {nearbyUsers.map(user => (
            <TouchableOpacity key={user.id} style={styles.glassCard} onPress={() => onChatPress(user)}>
              <View>
                <Text style={styles.targetLabel}>TARGET LOCK: ACQUIRED</Text>
                <Text style={styles.userName}>{user.publicKey || 'ANONYMOUS SIGINT'}</Text>
                <Text style={styles.userInfo}>MAC IDENT: {user.id}</Text>
                <Text style={styles.userRssi}>SIGNAL STRENGTH: {user.rssi || '-99'} dBm</Text>
              </View>
              <View style={styles.chatButton}>
                <Text style={styles.chatBtnText}>ENGAGE</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040B07', // Very dark tactical gray-green
    alignItems: 'center',
    paddingTop: 30
  },
  headerPlate: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 20
  },
  systemStatus: {
    color: '#39FF14',
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: 'bold'
  },
  headerTitle: {
    color: '#F4F4F5',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: 2
  },
  subtext: {
    color: '#4ADE80',
    fontSize: 10,
    marginTop: 5,
    letterSpacing: 1
  },
  radarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    marginVertical: 15
  },
  radarOrb: {
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    borderRadius: RADAR_SIZE / 2,
    backgroundColor: '#05180D', // darker green core
    borderColor: '#39FF14',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  ring1: {
    position: 'absolute',
    width: RADAR_SIZE * 0.7,
    height: RADAR_SIZE * 0.7,
    borderRadius: RADAR_SIZE,
    borderWidth: 1.5,
    borderColor: 'rgba(57, 255, 20, 0.4)',
  },
  ring2: {
    position: 'absolute',
    width: RADAR_SIZE * 0.4,
    height: RADAR_SIZE * 0.4,
    borderRadius: RADAR_SIZE,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.3)',
  },
  ring3: {
    position: 'absolute',
    width: RADAR_SIZE * 0.1,
    height: RADAR_SIZE * 0.1,
    borderRadius: RADAR_SIZE,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.6)',
    backgroundColor: '#39FF14', // The eye
  },
  crosshairVertical: {
    position: 'absolute',
    height: RADAR_SIZE,
    width: 1.5,
    backgroundColor: 'rgba(57, 255, 20, 0.5)',
  },
  crosshairHorizontal: {
    position: 'absolute',
    width: RADAR_SIZE,
    height: 1.5,
    backgroundColor: 'rgba(57, 255, 20, 0.5)',
  },
  sweeper: {
    position: 'absolute',
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  sweeperLine: {
    width: 3,
    height: RADAR_SIZE / 2,
    backgroundColor: '#39FF14',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  sweeperBeam: {
    position: 'absolute',
    width: RADAR_SIZE / 2,
    height: RADAR_SIZE / 2,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    top: 0,
    right: RADAR_SIZE / 2,
    borderTopLeftRadius: RADAR_SIZE,
  },
  blip: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: '#FFF', // blinding white-hot target
    borderRadius: 5,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  intelContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 10
  },
  foundText: {
    color: '#39FF14',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center'
  },
  list: {
    flex: 1,
  },
  glassCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.4)',
    padding: 18,
    borderRadius: 8,
    marginBottom: 12,
  },
  targetLabel: {
    color: '#ef4444',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 4
  },
  userName: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  userInfo: {
    color: '#4ADE80',
    fontSize: 10,
    marginTop: 4,
  },
  userRssi: {
    color: '#39FF14',
    fontSize: 9,
    marginTop: 2,
  },
  chatButton: {
    backgroundColor: '#39FF14',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  chatBtnText: {
    color: '#000',
    fontWeight: 'bold',
    letterSpacing: 1
  }
});
