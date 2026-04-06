'use client';

import { useEffect, useMemo } from 'react';
import { LayersControl, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 18;
const markerIcon2xUrl = marker2x?.src || marker2x;
const markerIconUrl = marker?.src || marker;
const markerShadowUrl = shadow?.src || shadow;
const GOOGLE_SATELLITE_URL = 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
const GOOGLE_SUBDOMAINS = ['mt0', 'mt1', 'mt2', 'mt3'];

if (typeof window !== 'undefined') {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2xUrl,
    iconUrl: markerIconUrl,
    shadowUrl: markerShadowUrl,
  });
}

function isValidNumber(value) {
  return Number.isFinite(Number(value));
}

function ChangeView({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, DEFAULT_ZOOM, { animate: true });
  }, [center, map]);

  return null;
}

function MapClickHandler({ onLocationChange }) {
  useMapEvents({
    click(event) {
      if (!onLocationChange) return;

      onLocationChange({
        latitude: event.latlng.lat.toFixed(6),
        longitude: event.latlng.lng.toFixed(6),
      });
    },
  });

  return null;
}

export default function FarmMapLeaflet({ latitude, longitude, onLocationChange }) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const hasValidCoordinates = isValidNumber(lat) && isValidNumber(lng);

  const center = useMemo(() => {
    if (hasValidCoordinates) {
      return [lat, lng];
    }
    return DEFAULT_CENTER;
  }, [hasValidCoordinates, lat, lng]);

  return (
    <div className="h-[300px] w-full overflow-hidden rounded-2xl">
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Normal Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite View">
            <TileLayer
              attribution='&copy; Google'
              url={GOOGLE_SATELLITE_URL}
              subdomains={GOOGLE_SUBDOMAINS}
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        <ChangeView center={center} />
        <MapClickHandler onLocationChange={onLocationChange} />
        {hasValidCoordinates && (
          <Marker position={center}>
            <Popup>Farm Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}