import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// Fix for default marker icon in react-leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { reportService } from '../../services/api';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapEvents = ({ onBoundsChange }) => {
    const map = useMapEvents({
        moveend: () => {
            onBoundsChange(map.getBounds());
        },
        load: () => {
            onBoundsChange(map.getBounds());
        }
    });

    // Trigger initial load
    useEffect(() => {
        onBoundsChange(map.getBounds());
    }, [map]);

    return null;
};

const MapView = ({ showHotspots }) => {
    const [reports, setReports] = useState([]);
    const [hotspots, setHotspots] = useState([]);

    // Fetch Hotspots when toggled
    useEffect(() => {
        if (showHotspots) {
            const fetchHotspots = async () => {
                try {
                    const result = await reportService.getHotspots('2025-01-01T00:00:00Z'); // Demo date for hotspots
                    if (result && result.data) {
                        setHotspots(result.data);
                    }
                } catch (error) {
                    console.error("Failed hotspots", error);
                }
            };
            fetchHotspots();
        }
    }, [showHotspots]);

    const fetchReports = async (bounds) => {
        if (!bounds) return;

        // Convert Leaflet bounds to api format: minLon,minLat,maxLon,maxLat
        const minLon = bounds.getWest();
        const minLat = bounds.getSouth();
        const maxLon = bounds.getEast();
        const maxLat = bounds.getNorth();

        const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;

        try {
            const result = await reportService.getReports(bbox);
            if (result && result.data) {
                setReports(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch reports", error);
        }
    };

    return (
        <MapContainer center={[19.076, 72.877]} zoom={11} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Individual Reports */}
            {!showHotspots && reports.map((report) => (
                <Marker key={report.id} position={[report.latitude, report.longitude]}>
                    <Popup className="varunanet-popup">
                        <div style={{
                            background: 'rgba(10, 14, 39, 0.95)',
                            color: '#e8e8e8',
                            padding: '0.75rem',
                            minWidth: '200px',
                            fontFamily: "'JetBrains Mono', monospace"
                        }}>
                            {/* Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.5rem',
                                borderBottom: '1px solid rgba(100, 150, 200, 0.2)',
                                paddingBottom: '0.5rem'
                            }}>
                                <strong style={{
                                    color: '#00d9ff',
                                    fontSize: '0.75rem',
                                    letterSpacing: '0.05em',
                                    textShadow: '0 0 8px rgba(0, 217, 255, 0.5)'
                                }}>
                                    {(report.hazard_type || 'UNKNOWN').toUpperCase()}
                                </strong>
                                <span style={{
                                    fontSize: '0.6rem',
                                    padding: '2px 6px',
                                    border: `1px solid ${report.status === 'verified' ? '#00d9ff' : '#a78bfa'}`,
                                    color: report.status === 'verified' ? '#00d9ff' : '#a78bfa',
                                    letterSpacing: '0.03em'
                                }}>
                                    [{(report.status || 'PENDING').toUpperCase()}]
                                </span>
                            </div>

                            {/* Image Thumbnail */}
                            {report.image_url && (
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <a
                                        href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000'}${report.image_url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'block' }}
                                    >
                                        <img
                                            src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000'}${report.image_url}`}
                                            alt="Report evidence"
                                            style={{
                                                width: '100%',
                                                height: '80px',
                                                objectFit: 'cover',
                                                border: '1px solid rgba(100, 150, 200, 0.3)',
                                                cursor: 'pointer'
                                            }}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </a>
                                </div>
                            )}

                            {/* Description */}
                            <p style={{
                                fontSize: '0.75rem',
                                margin: '0 0 0.5rem 0',
                                color: '#a0a0a0',
                                lineHeight: 1.4
                            }}>
                                {report.description || 'No description provided'}
                            </p>

                            {/* Timestamp */}
                            <div style={{
                                fontSize: '0.6rem',
                                color: '#666',
                                borderTop: '1px dashed rgba(100, 150, 200, 0.2)',
                                paddingTop: '0.4rem',
                                marginTop: '0.4rem'
                            }}>
                                📅 {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Unknown date'}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Hotspots Layer */}
            {showHotspots && hotspots.map((spot, idx) => (
                <Circle
                    key={idx}
                    center={[spot.latitude, spot.longitude]}
                    radius={spot.count * 100}
                    pathOptions={{
                        color: '#FF5252',
                        fillColor: '#FFB74D',
                        fillOpacity: 0.5
                    }}
                >
                    <Popup>
                        <strong>Hotspot</strong><br />
                        Intensity: {(spot.intensity || 0).toFixed(2)}<br />
                        Count: {spot.count}
                    </Popup>
                </Circle>
            ))}

            <MapEvents onBoundsChange={fetchReports} />
        </MapContainer>
    );
};

export default MapView;
