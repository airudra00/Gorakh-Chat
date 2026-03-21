import { Platform } from 'react-native';
import { Subject } from 'rxjs';

declare const require: any;

export interface WiFiNode {
  macAddress: string;
  deviceName: string;
}

class WiFiDirectManager {
  public discoveredPeers = new Subject<WiFiNode>();
  public isInitialized = false;

  public async initializeWiFiEngine() {
    if (Platform.OS !== 'android') {
      console.warn('[WiFi.Direct] ⚠️ High-Speed tunnel is an Android-exclusive hardware feature.');
      return;
    }

    if (this.isInitialized) return;

    try {
      // Raw injection into the Android P2P stack
      const WiFiP2P = require('react-native-wifi-p2p');
      await WiFiP2P.initialize();
      this.isInitialized = true;
      console.log('[WiFi.Direct] 🚀 Core Android High-Speed P2P Systems Engine online!');
    } catch (error) {
      console.error('[WiFi.Direct] 🚨 Native Wi-Fi Engine failed to bind to OS:', error);
    }
  }

  public async blastFrequencies() {
    if (!this.isInitialized) return;
    
    console.log('[WiFi.Direct] 🔭 Blasting massive high-speed radio frequencies to discover Local Hotspots...');
    try {
      const WiFiP2P = require('react-native-wifi-p2p');
      await WiFiP2P.startDiscoveringPeers();
      
      // Simulate polling the OS natively for caught frequencies until we hook up the specific Broadcaster logic
      setTimeout(async () => {
        try {
          const peers = await WiFiP2P.getAvailablePeers();
          if (peers && peers.deviceList) {
            peers.deviceList.forEach((device: any) => {
              this.discoveredPeers.next({
                macAddress: device.deviceAddress,
                deviceName: device.deviceName,
              });
            });
          }
        } catch (e) {
          console.warn('[WiFi.Direct] ⚠️ Peer interceptor sync failed:', e);
        }
      }, 3000);

    } catch (error) {
      console.error('[WiFi.Direct] 🚨 Scan failure:', error);
    }
  }

  public async constructDeepTunnel(macAddress: string) {
    if (!this.isInitialized) return;

    console.log(`[WiFi.Direct] ⚡ Forcing severe hardware tunnel connection to MAC: ${macAddress}`);
    try {
      const WiFiP2P = require('react-native-wifi-p2p');
      await WiFiP2P.connect(macAddress);
      console.log(`[WiFi.Direct] ✅ Massive P2P tunnel secured offline with ${macAddress}. Ready for 4K video streams!`);
    } catch (error) {
      console.error(`[WiFi.Direct] 🚨 Tunnel connection physically rejected by ${macAddress}:`, error);
    }
  }
}

export default new WiFiDirectManager();
