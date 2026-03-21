import { Platform, PermissionsAndroid, ToastAndroid } from 'react-native';
import * as Device from 'expo-device';

class ConnectionManager {
  private isInitialized = false;

  public async initializeMesh(): Promise<boolean> {
    if (this.isInitialized) return true;

    console.log('[ConnectionManager] Booting Mesh Engine...');

    const permissionsGranted = await this.requestPermissions();
    
    if (!permissionsGranted) {
      console.warn('[ConnectionManager] 🚨 Permissions Refused. Mesh Cannot Operate.');
      return false;
    }

    console.log('[ConnectionManager] ✅ All Android 12+ / 14+ BLE Permissions Granted!');
    
    // TODO: In the next step, we hook into react-native-ble-plx or nearby-connections
    this.startAdvertising();
    this.startScanning();

    this.isInitialized = true;
    return true;
  }

  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const apiLevel = Device.platformApiLevel ?? 0;

      // Android 12+ (API 31+) requires specific Bluetooth permissions
      if (apiLevel >= 31) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_ADVERTISE'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        // Android 11 and lower
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Gorakh Chat Radar Permission',
            message: 'We need your location to scan for nearby Gorakh Chat users offline.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }

    // iOS 17+ (Uses Info.plist NSBluetoothAlwaysUsageDescription which we add later)
    return true;
  }

  private startAdvertising() {
    console.log('[Mesh] 📡 Emitting P2P Radio Signal... I am online.');
    // Simulated
  }

  private startScanning() {
    console.log('[Mesh] 🔭 Scanning Area for Gorakh Chat Users...');
    // Simulated
  }
}

export default new ConnectionManager();
