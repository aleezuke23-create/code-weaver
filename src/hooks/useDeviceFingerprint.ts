import { useMemo } from 'react';

interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
  colorDepth: number;
  timezone: string;
  touchSupport: boolean;
  hardwareConcurrency: number;
  deviceMemory: number | null;
}

function getDeviceInfo(): DeviceInfo {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory || null,
  };
}

function generateFingerprint(info: DeviceInfo): string {
  // Create a stable string from device characteristics
  const components = [
    info.platform,
    info.screenResolution,
    info.colorDepth.toString(),
    info.timezone,
    info.touchSupport.toString(),
    info.hardwareConcurrency.toString(),
    info.deviceMemory?.toString() || 'unknown',
    // Extract browser and OS info from userAgent
    extractBrowserInfo(info.userAgent),
  ];

  // Simple hash function
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `device_${Math.abs(hash).toString(36)}`;
}

function extractBrowserInfo(userAgent: string): string {
  // Extract key browser/device identifiers
  const patterns = [
    /Chrome\/[\d.]+/,
    /Firefox\/[\d.]+/,
    /Safari\/[\d.]+/,
    /Edge\/[\d.]+/,
    /OPR\/[\d.]+/,
    /Mobile/,
    /Android/,
    /iPhone/,
    /iPad/,
    /Windows/,
    /Mac OS/,
    /Linux/,
  ];

  const matches = patterns
    .map(p => userAgent.match(p)?.[0])
    .filter(Boolean);

  return matches.join('_') || 'unknown';
}

export function useDeviceFingerprint(): string {
  const fingerprint = useMemo(() => {
    // Check if we already have a stored fingerprint for this device
    const storedFingerprint = localStorage.getItem('barber-device-id');
    
    if (storedFingerprint) {
      return storedFingerprint;
    }

    // Generate new fingerprint based on device characteristics
    const deviceInfo = getDeviceInfo();
    const newFingerprint = generateFingerprint(deviceInfo);
    
    // Store it for future sessions
    localStorage.setItem('barber-device-id', newFingerprint);
    
    return newFingerprint;
  }, []);

  return fingerprint;
}

export function getDeviceFingerprint(): string {
  const storedFingerprint = localStorage.getItem('barber-device-id');
  
  if (storedFingerprint) {
    return storedFingerprint;
  }

  const deviceInfo = getDeviceInfo();
  const newFingerprint = generateFingerprint(deviceInfo);
  localStorage.setItem('barber-device-id', newFingerprint);
  
  return newFingerprint;
}
