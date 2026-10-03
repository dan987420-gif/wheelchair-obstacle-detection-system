const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Sensor
  getLatestReading: (deviceId) => request(`/sensor/readings/latest${deviceId ? `?deviceId=${deviceId}` : ''}`),
  getReadings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/sensor/readings${query ? `?${query}` : ''}`);
  },

  // Events
  getObstacleEvents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/obstacle-events${query ? `?${query}` : ''}`);
  },
  getObstacleEventById: (id) => request(`/obstacle-events/${id}`),
  exportEventsCsvUrl: () => `${BASE_URL}/obstacle-events/export/csv`,

  // Statistics
  getStatisticsOverview: () => request('/statistics/overview'),
  getRiskDistribution: () => request('/statistics/risk-distribution'),
  getDistanceHistory: () => request('/statistics/distance'),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (settings) => request('/settings', { method: 'PATCH', body: JSON.stringify(settings) }),

  // Devices
  getDevices: () => request('/devices'),
  getDeviceById: (id) => request(`/devices/${id}`),

  // Simulation
  sendSimulationReading: (distanceCm, deviceId = 'WC-001') =>
    request('/simulation/readings', { method: 'POST', body: JSON.stringify({ distanceCm, deviceId }) }),
  startAutoSimulation: () => request('/simulation/start', { method: 'POST' }),
  stopAutoSimulation: () => request('/simulation/stop', { method: 'POST' })
};
