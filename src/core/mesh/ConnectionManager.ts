import { Platform, PermissionsAndroid } from 'react-native';
import * as Device from 'expo-device';
import { BleManager, ScanMode } from 'react-native-ble-plx';
import { Subject } from 'rxjs';

export interface MeshNode {
  id: string;   // Hardware Mac Address / Local ID
  publicKey?: string; // Gorakh Identity
  rssi: number | null; // Signal Strength
}

class ConnectionManager {
  private isInitialized = false;
  private manager: BleManager | null = null;
  public discoveredNodes = new Subject<MeshNode>();

  public async initializeMesh(): Promise<boolean> {
    if (this.isInitialized) return true;
    console.log('[ConnectionManager] Booting Native BLE Hardware Engine...');

    const permissionsGranted = await this.requestPermissions();
    if (!permissionsGranted) {
      console.warn('[ConnectionManager] 🚨 Permissions Refused. Hardware asleep.');
      return false;
    }
    
    // Wake up the physical Bluetooth Antenna
    this.manager = new BleManager();
    
    // Automatically force the Android System to prompt the user to turn on Bluetooth!
    const state = await this.manager.state();
    if (state !== 'PoweredOn') {
      console.warn('[ConnectionManager] ⚠️ Bluetooth is off. Ordering OS to turn it on...');
      try {
        await this.manager.enable();
      } catch (e) {
        console.warn('[ConnectionManager] 🚨 User refused to let us turn on Bluetooth.');
      }
    }

    // This listener waits for the exact millisecond the Bluetooth chip gets power
    // and instantly starts sweeping the area. No manual app restarts needed!
    this.manager.onStateChange((newState) => {
      if (newState === 'PoweredOn') {
        this.startScanning();
      } else {
        console.log('[ConnectionManager] Bluetooth power lost. Pausing scan...');
        this.manager?.stopDeviceScan();
      }
    }, true); // `true` fires it immediately with the current state too

    this.startAdvertising(); // Note: Emitting requires peripheral bridge integration 

    this.isInitialized = true;
    return true;
  }

  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const apiLevel = Device.platformApiLevel ?? 0;
      if (apiLevel >= 31) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return (
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  }

  private startScanning() {
    if (!this.manager) return;
    console.log('[Mesh] 🔭 Raw Hardware is officially sweeping for Gorakh Chat Users!');
    
    // We scan specifically for our Gorakh App signature or any BLE device nearby initially
    this.manager.startDeviceScan(null, { scanMode: ScanMode.LowLatency }, (error, device) => {
      if (error) {
        console.log('[Mesh.Scanner] ⚠️ Scan error:', error.message);
        return;
      }
      
      if (device) {
        // Emit through RxJS so RadarScreen can visibly update in real time!
        this.discoveredNodes.next({
          id: device.id,
          publicKey: device.name || 'Unknown Signal',
          rssi: device.rssi
        });
      }
    });
  }

  private startAdvertising() {
    // 📡 Broadcasting logic goes here (requires react-native-ble-peripheral or custom Java)
    console.log('[Mesh] 📡 (Advertising Identity to nearby hardware)');
  }

  // ===================================
  // MESSAGE TRANSMISSION PROTOCOL
  // ===================================
  public async sendMessage(peerId: string, encryptedPayload: string): Promise<boolean> {
    console.log(`[Mesh.Transmitter] 🚀 Firing encrypted payload to MAC: ${peerId}`);
    // Simulated: Here we would use react-native-ble-plx to write a characteristic to the peer!
    return true; // Assume success for now
  }
}

export default new ConnectionManager();
