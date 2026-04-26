import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, MarkerClusterer, Circle, InfoWindow, Polyline, Polygon, Marker, HeatmapLayer } from "@react-google-maps/api";
import { useStore } from "../store";

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '12px'
};

const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Center of India

// NASA-style Dark Control System Map Theme
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0a0f18" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0f18" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#4b5563" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b", weight: 1 }]
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#020617" }]
  },
  {
    featureType: "road",
    stylers: [{ visibility: "off" }]
  }
];

// Helper: Calculate a curved path (quadratic bezier)
const getCurvedPath = (origin, dest) => {
  if (!origin || !dest) return [];
  const points = [];
  const midLat = (origin.lat + dest.lat) / 2;
  const midLng = (origin.lng + dest.lng) / 2;
  // Offset midpoint to create a curve
  const offset = 1.5; 
  const control = { lat: midLat + offset, lng: midLng + offset };
  
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const lat = (1-t)*(1-t)*origin.lat + 2*(1-t)*t*control.lat + t*t*dest.lat;
    const lng = (1-t)*(1-t)*origin.lng + 2*(1-t)*t*control.lng + t*t*dest.lng;
    points.push({ lat, lng });
  }
  return points;
};

// Helper: Generate a predictive contagion polygon around a zone
const getContagionSpread = (center, severity) => {
  const points = [];
  const radiusDegrees = (severity * 0.15); 
  for(let i=0; i<360; i+= 45) {
    // Add some noise for realism
    const noise = (Math.random() * 0.4) + 0.8; 
    const r = radiusDegrees * noise;
    points.push({
      lat: center.lat + (r * Math.cos(i * Math.PI / 180)),
      lng: center.lng + (r * Math.sin(i * Math.PI / 180))
    });
  }
  return points;
};

const GoogleIndiaMap = ({ onSelect, selected, predictionData }) => {
  const { zones, mapPolylines } = useStore();
  const [pulseRadius, setPulseRadius] = useState(1);
  const [particleOffset, setParticleOffset] = useState(0);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "", 
    libraries: ["visualization", "geometry"]
  });

  // Soft pulsing animation
  useEffect(() => {
    let phase = 0;
    const interval = setInterval(() => {
      phase += 0.05;
      setPulseRadius(1 + Math.sin(phase) * 0.15); // fluctuates between 0.85 and 1.15
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Particle flow animation
  useEffect(() => {
    const interval = setInterval(() => {
      setParticleOffset(prev => (prev + 1.5) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const mapOptions = useMemo(() => ({
    styles: darkMapStyle,
    disableDefaultUI: true,
    zoomControl: true,
    backgroundColor: '#0a0f18'
  }), []);

  if (!isLoaded) return <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>Initializing Map Engine...</div>;

  // Smart Simplification: Top 8 zones
  const sortedZones = [...zones].sort((a,b) => b.severity - a.severity);
  const topZones = sortedZones.slice(0, 8);
  const clusteredZones = sortedZones.slice(8);

  // Generate Contagion Spread if there's a selected critical zone
  const contagionPolygon = selected && selected.severity >= 8 ? getContagionSpread(selected, selected.severity) : null;

  // Check if prediction mode is active (array with actual data)
  const hasPredictions = predictionData && predictionData.length > 0;

  // Compute Heatmap Data
  const heatmapPoints = hasPredictions ? predictionData.map(p => ({
    location: new window.google.maps.LatLng(p.lat, p.lng),
    weight: p.overallRisk / 100
  })) : [];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={5}
        options={mapOptions}
      >
        {hasPredictions && heatmapPoints.length > 0 && (
          <HeatmapLayer
            data={heatmapPoints}
            options={{
              radius: 50,
              opacity: 0.7,
              gradient: [
                'rgba(0, 255, 0, 0)',
                'rgba(34, 197, 94, 1)',   // Green
                'rgba(234, 179, 8, 1)',   // Yellow
                'rgba(249, 115, 22, 1)',  // Orange
                'rgba(239, 68, 68, 1)'    // Red
              ]
            }}
          />
        )}

        {hasPredictions && predictionData.map(p => {
          let color = '#22c55e'; // Green
          if (p.riskLevel === 'CRITICAL') color = '#ef4444';
          else if (p.riskLevel === 'HIGH') color = '#f97316';
          else if (p.riskLevel === 'MODERATE') color = '#eab308';
          
          return (
            <Circle
              key={p.cityName}
              center={{ lat: p.lat, lng: p.lng }}
              radius={30000 + (p.overallRisk * 500)} // Proportional to risk
              options={{
                fillColor: color,
                fillOpacity: 0.3,
                strokeColor: color,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                clickable: true
              }}
              onClick={() => onSelect && onSelect(p)}
            />
          )
        })}

        {!hasPredictions && contagionPolygon && (
          <Polygon
            paths={contagionPolygon}
            options={{
              fillColor: '#ef4444',
              fillOpacity: 0.1 * pulseRadius,
              strokeColor: '#ef4444',
              strokeOpacity: 0.3,
              strokeWeight: 1,
              clickable: false
            }}
          />
        )}

        {!hasPredictions && topZones.map(z => {
          let color = '#3b82f6'; // Blue
          if (z.severity >= 8) color = '#ef4444'; // Red
          else if (z.severity >= 5) color = '#f97316'; // Orange

          const isSelected = selected?.id === z.id;
          const baseRadius = 50000 + (z.severity * 5000); // meters

          return (
            <div key={z.id}>
              <Circle
                center={{ lat: z.lat, lng: z.lng }}
                radius={baseRadius * (isSelected ? 1 : pulseRadius)} // Selected doesn't pulse the base
                options={{
                  fillColor: color,
                  fillOpacity: isSelected ? 0.4 : 0.2,
                  strokeColor: color,
                  strokeOpacity: isSelected ? 0.8 : 0.4,
                  strokeWeight: isSelected ? 2 : 1,
                  clickable: true
                }}
                onClick={() => onSelect && onSelect(z)}
              />
              {/* Focus Ring Wow Moment */}
              {isSelected && (
                <Circle
                  center={{ lat: z.lat, lng: z.lng }}
                  radius={baseRadius * 1.5 * pulseRadius}
                  options={{
                    fillColor: 'transparent',
                    strokeColor: color,
                    strokeOpacity: 0.8 - ((pulseRadius - 0.85) * 2), // fades as it expands
                    strokeWeight: 1,
                    clickable: false
                  }}
                />
              )}
            </div>
          );
        })}

        {!hasPredictions && clusteredZones.map(z => (
          <Marker
            key={z.id}
            position={{ lat: z.lat, lng: z.lng }}
            onClick={() => onSelect && onSelect(z)}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#64748b',
              fillOpacity: 0.6,
              strokeWeight: 0,
              scale: 4
            }}
          />
        ))}

        {!hasPredictions && mapPolylines.map((line, i) => {
          const path = getCurvedPath(line.origin, line.destination);
          return (
            <Polyline
              key={line.id}
              path={path}
              options={{
                strokeColor: '#06b6d4', // Cyan
                strokeOpacity: 0.4,
                strokeWeight: 2,
                geodesic: false,
                icons: [
                  { // Particle
                    icon: { path: window.google.maps.SymbolPath.CIRCLE, fillColor: '#22d3ee', fillOpacity: 1, scale: 2, strokeColor: '#fff', strokeWeight: 1 },
                    offset: `${(particleOffset + (i * 20)) % 100}%`,
                  },
                  { // Arrow head
                    icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, strokeColor: '#06b6d4', strokeOpacity: 0.8, scale: 2 },
                    offset: '100%',
                  }
                ]
              }}
            />
          );
        })}

        {selected && !hasPredictions && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => onSelect(null)}
            options={{ pixelOffset: new window.google.maps.Size(0, -20) }}
          >
            <div style={{ background: '#0a0f18', padding: '10px 14px', borderRadius: '8px', border: '1px solid #1e293b', minWidth: '180px', color: '#f8fafc', fontFamily: "'Rajdhani', sans-serif" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span>{selected.name}</span>
                <span style={{ color: selected.severity >= 8 ? '#ef4444' : '#f97316' }}>{selected.severity.toFixed(1)}</span>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>{selected.disaster_type.toUpperCase()}</div>
              
              <div style={{ background: '#1e293b', padding: '6px 8px', borderRadius: '4px', fontSize: 10 }}>
                <div style={{ color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span>T-Failure Est:</span>
                  <strong style={{ color: selected.resources / (selected.severity_growth_rate+1) < 2 ? '#ef4444' : '#22c55e' }}>
                    {(selected.resources / (selected.severity_growth_rate+1)).toFixed(1)} hrs
                  </strong>
                </div>
                <div style={{ color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Personnel:</span>
                  <strong>{selected.resources} active</strong>
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default GoogleIndiaMap;
