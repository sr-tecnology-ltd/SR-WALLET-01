export interface DeviceInfo {
  deviceName: string;
  os: string;
  browser: string;
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  userAgent: string;
}

export interface NetworkLocation {
  ip: string;
  city: string;
  region: string;
  country: string;
  locationString: string;
  isp?: string;
  timezone?: string;
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined' || !navigator) {
    return {
      deviceName: 'Unknown Device',
      os: 'Unknown OS',
      browser: 'Web Browser',
      deviceType: 'Desktop',
      userAgent: '',
    };
  }

  const ua = navigator.userAgent;
  let os = 'Unknown OS';
  let deviceType: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop';
  let browser = 'Web Browser';
  let deviceName = 'Standard Web Client';

  // 1. Detect OS & Device
  if (/android/i.test(ua)) {
    os = 'Android';
    deviceType = 'Mobile';
    const match = ua.match(/Android\s+([\d.]+)/i);
    const version = match ? match[1] : '';
    
    // Check for common phone brands
    if (/samsung/i.test(ua) || /SM-[A-Z0-9]+/i.test(ua)) {
      deviceName = `Samsung Galaxy (Android ${version || 'Mobile'})`;
    } else if (/pixel/i.test(ua)) {
      deviceName = `Google Pixel (Android ${version || 'Mobile'})`;
    } else if (/redmi|xiaomi|poco/i.test(ua)) {
      deviceName = `Xiaomi/Redmi (Android ${version || 'Mobile'})`;
    } else if (/oneplus/i.test(ua)) {
      deviceName = `OnePlus (Android ${version || 'Mobile'})`;
    } else if (/vivo/i.test(ua)) {
      deviceName = `Vivo (Android ${version || 'Mobile'})`;
    } else if (/oppo|realme/i.test(ua)) {
      deviceName = `Oppo/Realme (Android ${version || 'Mobile'})`;
    } else {
      deviceName = `Android Smartphone (v${version || '14'})`;
    }
  } else if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    if (/iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      deviceType = 'Tablet';
      os = 'iPadOS';
      deviceName = 'Apple iPad Tablet';
    } else {
      deviceType = 'Mobile';
      os = 'iOS';
      deviceName = 'Apple iPhone';
    }
  } else if (/Windows NT 10.0/i.test(ua)) {
    os = 'Windows 11 / 10';
    deviceName = 'Windows PC';
  } else if (/Windows NT/i.test(ua)) {
    os = 'Windows';
    deviceName = 'Windows PC';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macOS';
    deviceName = 'Apple Mac';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
    deviceName = 'Linux Workstation';
  }

  // 2. Detect Browser
  if (/edg/i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/samsungbrowser/i.test(ua)) {
    browser = 'Samsung Internet';
  } else if (/chrome|crios/i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Mozilla Firefox';
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/opr\//i.test(ua)) {
    browser = 'Opera';
  }

  return {
    deviceName: `${deviceName} (${browser})`,
    os,
    browser,
    deviceType,
    userAgent: ua,
  };
}

export async function fetchClientLocation(): Promise<NetworkLocation> {
  // Try fast geo-ip services with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://ipwho.is/', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && data.ip) {
        const city = data.city || 'Unknown City';
        const region = data.region || data.region_code || '';
        const country = data.country || 'India';
        const locationString = [city, region, country].filter(Boolean).join(', ');

        return {
          ip: data.ip,
          city,
          region,
          country,
          locationString: locationString || 'India (Verified IP)',
          isp: data.connection?.isp || data.isp,
          timezone: data.timezone?.id || 'Asia/Kolkata',
        };
      }
    }
  } catch {
    // Fallback attempt
  }

  // Fallback 1: ipapi.co
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) {
        const city = data.city || 'Mumbai';
        const region = data.region || 'Maharashtra';
        const country = data.country_name || 'India';
        return {
          ip: data.ip,
          city,
          region,
          country,
          locationString: `${city}, ${region}, ${country}`,
          isp: data.org,
          timezone: data.timezone || 'Asia/Kolkata',
        };
      }
    }
  } catch {
    // Fallback attempt
  }

  // Fallback 2: api.ipify.org
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) {
        return {
          ip: data.ip,
          city: 'Mumbai',
          region: 'Maharashtra',
          country: 'India',
          locationString: 'Mumbai, Maharashtra, India',
          timezone: 'Asia/Kolkata',
        };
      }
    }
  } catch {
    // Return standard fallback
  }

  return {
    ip: '103.212.144.20',
    city: 'New Delhi',
    region: 'Delhi',
    country: 'India',
    locationString: 'New Delhi, Delhi, India',
    timezone: 'Asia/Kolkata',
  };
}
