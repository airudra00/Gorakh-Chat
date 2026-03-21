import { Platform, PermissionsAndroid } from 'react-native';
import * as Device from 'expo-device';
import { BleManager, ScanMode } from 'react-native-ble-plx';
import { Subject } from 'rxjs';
import { encodeBase64, encodeUTF8 } from '../crypto/E2EEProtocol';
import WiFiDirectManager from './WiFiDirectManager';

const GORAKH_CHAT_UUID = '00006084-0000-1000-8000-00805F9B34FB';
const GORAKH_WRITE_UUID = '00006085-0000-1000-8000-00805F9B34FB';

export interface MeshNode {
  id: string; // The MAC Address
  publicKey: string | null;
  rssi: number | null;
}

export interface IncomingMessage {
  peerId: string;
  payload: string;
}

class ConnectionManager {
  private isInitialized = false;
  private manager: BleManager | null = null;
  public discoveredNodes = new Subject<MeshNode>();
  public incomingMessages = new Subject<IncomingMessage>();

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

    // Synchronize the Heavy-Duty Wi-Fi Direct Engine!
    await WiFiDirectManager.initializeWiFiEngine();
    await WiFiDirectManager.blastFrequencies();

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
    console.log('[Mesh] 🔭 Raw Hardware is strictly sweeping for Gorakh Chat Service UUIDs!');
    
    // We pass the exact Service UUID to completely blind the radar to all other 500+ trash devices (TVs, Earbuds)
    this.manager?.startDeviceScan(
      [GORAKH_CHAT_UUID], 
      { allowDuplicates: false }, 
      (error, device) => {
        if (error) {
          console.error('[Mesh.Scanner] ⚠️ Scan error:', error.message);
          return;
        }

        if (device) {
          // Because we filtered by UUID, ANY device that hits this block is guaranteed to be a Gorakh Phone!
          console.log(`[Mesh.Scanner] 📡 Intercepted Gorakh Device: ${device.id}`);
          
          this.discoveredNodes.next({
            id: device.id,
            publicKey: device.name || 'Anonymous Gorakh Node', 
            rssi: device.rssi
          });
        }
      }
    );
  }

  private async startAdvertising() {
    console.log('[Mesh] 📡 Powering up the Cell Tower (Broadcasting our UUID)');
    try {
      // Require the newly injected Android Native Module
      const BLEPeripheral = require('munim-bluetooth-peripheral').default || require('munim-bluetooth-peripheral');
      
      // Inject the Gorakh Chat Identity Signature
      BLEPeripheral.addService(GORAKH_CHAT_UUID, true);
      BLEPeripheral.setName('Gorakh Node');
      
      await BLEPeripheral.start();
      console.log('[Mesh] 🟢 Broadcaster goes LIVE! We are now a cell tower.');
    } catch (e) {
      console.warn('[Mesh] ⚠️ Broadcaster skipped: Native module still compiling in GitHub Action.');
    }
  }

  // ===================================
  // MESSAGE TRANSMISSION PROTOCOL
  // ===================================
  public async sendMessage(peerId: string, payload: string): Promise<boolean> {
    console.log(`[Mesh.Transmitter] 🚀 Initiating Hardware Handshake with MAC: ${peerId}`);
    try {
      // 1. Physically connect to the other phone's Bluetooth chip
      const device = await this.manager.connectToDevice(peerId);
      
      // 2. Map their internal GATT server to find the Gorakh Chat Service
      await device.discoverAllServicesAndCharacteristics();
      
      // 3. Convert our text payload into a raw Base64 physical byte stream
      // We encode the string to UTF8 bytes, then convert bytes to Base64
      const base64Data = encodeBase64(encodeUTF8(payload));
      
      // 4. Force-Write the payload directly into the other phone's memory chip
      await this.manager.writeCharacteristicWithResponseForDevice(
        peerId,
        GORAKH_CHAT_UUID,
        GORAKH_WRITE_UUID,
        base64Data
      );

      console.log(`[Mesh.Transmitter] ✅ Payload successfully delivered to ${peerId}`);
      
      // Disconnect smoothly to save battery and open the slot for others
      await this.manager.cancelDeviceConnection(peerId);
      return true;

    } catch (error) {
      console.error(`[Mesh.Transmitter] 🚨 Delivery Failed to ${peerId}:`, error);
      // Failsafe disconnect
      this.manager.cancelDeviceConnection(peerId).catch(() => {});
      return false;
    }
  }
}

export default new ConnectionManager();
