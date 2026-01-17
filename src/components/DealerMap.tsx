'use client';

import { useEffect, useRef, useState } from 'react';
import type { Dealer } from '@/lib/types';

interface DealerMapProps {
  dealers: Dealer[];
  onDealerClick?: (dealer: Dealer) => void;
  userLocation?: { lat: number; lng: number } | null;
  theme?: 'light' | 'dark';
  className?: string;
}

export function DealerMap({ dealers, onDealerClick, userLocation, theme = 'light', className = '' }: DealerMapProps) {
  const mapRef = useRef<any>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Dynamically import Leaflet only on client side
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  useEffect(() => {
    if (!L || !mapRef.current || mapInstance) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([31.9539, 35.9106], 8); // Center on Jordan

    // Use free tile providers to avoid 401 errors
    // Light: OpenStreetMap (Standard)
    // Dark: CartoDB Dark Matter
    const lightTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(theme === 'dark' ? darkTileUrl : lightTileUrl, {
      maxZoom: 20,
      attribution: theme === 'dark'
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    setMapInstance({ map, tileLayer });

    // Cleanup only when component unmounts
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [L]);

  useEffect(() => {
    if (!mapInstance || !L) return;

    const { map, tileLayer } = mapInstance;

    // Update tile layer for theme with modern styles
    // Update tile layer for theme with modern styles
    const lightTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    tileLayer.setUrl(theme === 'dark' ? darkTileUrl : lightTileUrl);
  }, [theme, mapInstance, L]);

  useEffect(() => {
    if (!mapInstance || !L || !dealers.length) return;

    const { map } = mapInstance;

    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Futuristic dealer icon with glow effect
    const dealerIcon = L.divIcon({
      className: 'custom-dealer-marker',
      html: `
        <div class="relative">
          <div class="absolute -inset-2 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full blur-md opacity-75 animate-pulse-glow"></div>
          <div class="relative ${theme === 'dark' ? 'bg-gradient-to-br from-sky-500 to-indigo-600' : 'bg-gradient-to-br from-sky-600 to-indigo-700'} rounded-2xl p-3 shadow-2xl border-2 ${theme === 'dark' ? 'border-sky-400/50' : 'border-white/50'} transform hover:scale-110 transition-all duration-300 cursor-pointer backdrop-blur-sm">
            <svg class="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] ${theme === 'dark' ? 'border-t-indigo-600' : 'border-t-indigo-700'} border-l-transparent border-r-transparent drop-shadow-lg"></div>
        </div>
      `,
      iconSize: [56, 56],
      iconAnchor: [28, 56],
      popupAnchor: [0, -56],
    });

    // Add dealer markers
    const markers: any[] = [];
    dealers.forEach((dealer) => {
      if (dealer.latitude && dealer.longitude) {
        const marker = L.marker([dealer.latitude, dealer.longitude], { icon: dealerIcon })
          .addTo(map);

        // Modern glassmorphic popup
        const popupContent = `
          <div class="relative overflow-hidden rounded-2xl ${theme === 'dark' ? 'bg-slate-800/95' : 'bg-white/95'} backdrop-blur-xl border ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/50'} shadow-2xl">
            <div class="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-indigo-500/10"></div>
            <div class="relative p-4 min-w-[280px]">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-bold text-lg ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}">${dealer.name}</h3>
                ${dealer.verified ? `<span class="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-lg animate-pulse"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>Verified</span>` : ''}
              </div>
              <p class="text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 ${theme === 'dark' ? 'text-sky-400' : 'text-sky-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                ${dealer.location || 'Location not specified'}
              </p>
              ${dealer.rating ? `
                <div class="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl ${theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-50'} border ${theme === 'dark' ? 'border-amber-500/30' : 'border-amber-200'}">
                  <svg class="w-5 h-5 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  <span class="text-base font-bold ${theme === 'dark' ? 'text-amber-300' : 'text-amber-600'}">${dealer.rating.toFixed(1)}</span>
                  <span class="text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}">(${dealer.reviews_count || 0} reviews)</span>
                </div>
              ` : ''}
              ${dealer.distance ? `<p class="text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} mb-3 flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>${dealer.distance.toFixed(1)} km away</p>` : ''}
              <button 
                class="w-full mt-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
                onclick="window.dispatchEvent(new CustomEvent('dealer-click', { detail: ${dealer.id} }))"
              >
                <span>View Details</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          className: 'modern-popup',
          maxWidth: 320,
        });

        markers.push(marker);
      }
    });

    // Modern user location marker with ping effect
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative">
            <div class="absolute -inset-3 bg-blue-400 rounded-full blur-lg opacity-60 animate-ping"></div>
            <div class="relative bg-gradient-to-br from-blue-400 to-blue-600 rounded-full p-2.5 shadow-2xl border-3 border-white ring-4 ring-blue-400/30">
              <svg class="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" />
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<div class="p-2 text-center font-bold">📍 Your Location</div>');
    }

    // Fit bounds to show all dealers
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    // Handle dealer click events
    const handleDealerClick = (e: any) => {
      const dealerId = e.detail;
      const dealer = dealers.find(d => d.id === dealerId);
      if (dealer && onDealerClick) {
        onDealerClick(dealer);
      }
    };

    window.addEventListener('dealer-click', handleDealerClick);

    return () => {
      window.removeEventListener('dealer-click', handleDealerClick);
    };
  }, [mapInstance, L, dealers, theme, userLocation, onDealerClick]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapRef}
        className="w-full h-full rounded-3xl overflow-hidden shadow-lg"
        style={{ minHeight: '500px' }}
      />
      <style jsx global>{`
        .leaflet-container {
          background: ${theme === 'dark' ? '#0f172a' : '#f8fafc'};
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .custom-dealer-marker,
        .custom-user-marker {
          background: transparent;
          border: none;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 0.4; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 16px;
          padding: 0;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, ${theme === 'dark' ? '0.3' : '0.1'}), 0 10px 10px -5px rgba(0, 0, 0, ${theme === 'dark' ? '0.2' : '0.04'});
          border: none;
          overflow: hidden;
          background: ${theme === 'dark' ? '#1e293b' : '#ffffff'} !important;
        }
        .leaflet-popup-tip {
          display: none;
        }
        .leaflet-popup-close-button {
          position: absolute !important;
          top: 8px !important;
          right: 8px !important;
          width: 28px !important;
          height: 28px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: ${theme === 'dark' ? '#e2e8f0' : '#1e293b'} !important;
          font-size: 20px !important;
          font-weight: bold !important;
          padding: 0 !important;
          background: ${theme === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(241, 245, 249, 0.8)'} !important;
          border-radius: 8px !important;
          backdrop-filter: blur(8px) !important;
          transition: all 0.2s !important;
          z-index: 1000 !important;
        }
        .leaflet-popup-close-button:hover {
          color: ${theme === 'dark' ? '#60a5fa' : '#3b82f6'} !important;
          background: ${theme === 'dark' ? 'rgba(71, 85, 105, 0.9)' : 'rgba(226, 232, 240, 0.9)'} !important;
          transform: scale(1.1) !important;
        }
      `}</style>
    </div>
  );
}
