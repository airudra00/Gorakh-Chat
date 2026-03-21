import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const POCKET_MODE_TASK = 'GORAKH_POCKET_MODE_TASK';

// Define the Headless Background Task that Android wakes up physically
// This massive C++ bridge keeps the entire React Native JavaScript engine alive
TaskManager.defineTask(POCKET_MODE_TASK, ({ data, error }) => {
  if (error) {
    console.error('[Mesh.PocketMode] 🚨 OS killed the background sweeper:', error);
    return;
  }
  // The moment Android fires this location ping, our ConnectionManager effortlessly sweeps!
  console.log('[Mesh.PocketMode] 🔭 Pocket Mode pulse! We are hunting offline devices in the background.');
  // Because the JS Engine stays fully alive, ConnectionManager.ts BLE Scanners remain open.
});

class BackgroundSweeper {
  public async engagePocketMode() {
    console.log('[Mesh.PocketMode] 🔋 Requesting profound Background Service permission from Core OS...');
    
    // We request physical Background Tracking powers
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus === 'granted') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus === 'granted') {
        // We instruct the Android System to spawn a permanent Foreground Notification Action
        // This violently tells Android 14 battery optimization to never kill Gorakh Chat!
        await Location.startLocationUpdatesAsync(POCKET_MODE_TASK, {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10, // Fire every 10 meters of movement to pulse the radar!
          deferredUpdatesInterval: 5000, 
          showsBackgroundLocationIndicator: true, 
          foregroundService: {
            notificationTitle: 'Gorakh Chat Active',
            notificationBody: 'Offline Mesh Network scanning from your Pocket...',
            notificationColor: '#00FF00',
          },
        });
        console.log('[Mesh.PocketMode] ✅ Pocket Mode Engaged! We fully survive the screen being locked.');
      } else {
        console.warn('[Mesh.PocketMode] ⚠️ Background permission denied. App will die when put in Pocket.');
      }
    }
  }
}

export default new BackgroundSweeper();
