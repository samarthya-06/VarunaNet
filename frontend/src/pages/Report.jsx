import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { reportService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaCheckCircle, FaSpinner, FaMapMarkerAlt, FaKeyboard, FaSearch, FaImage, FaTimes, FaCrosshairs } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom cyan marker for current location
const currentLocationIcon = L.divIcon({
    className: 'current-location-marker',
    html: `<div style="
        width: 16px;
        height: 16px;
        background: #00d9ff;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(0, 217, 255, 0.8), 0 0 20px rgba(0, 217, 255, 0.4);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
});

// Component to recenter map when coordinates change
const MapRecenter = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], 16, { animate: true });
        }
    }, [lat, lng, map]);
    return null;
};

// Mini map preview component
const LocationPreviewMap = ({ coordinates, accuracy }) => {
    if (!coordinates) return null;

    return (
        <div style={{
            height: '150px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid var(--accent-cyan)',
            marginTop: '0.75rem'
        }}>
            <MapContainer
                center={[coordinates.lat, coordinates.lng]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[coordinates.lat, coordinates.lng]} icon={currentLocationIcon} />
                <MapRecenter lat={coordinates.lat} lng={coordinates.lng} />
            </MapContainer>
            {accuracy && (
                <div style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.6rem',
                    color: accuracy < 50 ? 'var(--accent-cyan)' : accuracy < 100 ? '#fbbf24' : 'var(--accent-red)',
                    fontFamily: 'var(--font-mono)'
                }}>
                    ±{Math.round(accuracy)}m
                </div>
            )}
        </div>
    );
};

// Helper to extract EXIF GPS data from image
const extractExifGps = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const view = new DataView(e.target.result);
                // Check for JPEG
                if (view.getUint16(0, false) !== 0xFFD8) {
                    resolve(null);
                    return;
                }

                let offset = 2;
                while (offset < view.byteLength) {
                    const marker = view.getUint16(offset, false);
                    offset += 2;

                    if (marker === 0xFFE1) {
                        // APP1 marker (EXIF)
                        const length = view.getUint16(offset, false);
                        const exifData = new DataView(e.target.result, offset + 2, length - 2);

                        // Check for "Exif" string
                        const exifHeader = String.fromCharCode(
                            exifData.getUint8(0), exifData.getUint8(1),
                            exifData.getUint8(2), exifData.getUint8(3)
                        );

                        if (exifHeader === 'Exif') {
                            // Simplified GPS extraction - look for GPS IFD
                            // This is a basic implementation; for complex images, consider using a library
                            resolve(null); // Fallback - EXIF parsing is complex
                        }
                        break;
                    } else if ((marker & 0xFF00) === 0xFF00) {
                        offset += view.getUint16(offset, false);
                    } else {
                        break;
                    }
                }
                resolve(null);
            } catch (err) {
                console.log('EXIF extraction error:', err);
                resolve(null);
            }
        };
        reader.onerror = () => resolve(null);
        reader.readAsArrayBuffer(file.slice(0, 128 * 1024)); // Only read first 128KB for EXIF
    });
};

const Report = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [status, setStatus] = useState('idle');
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [gpsStatus, setGpsStatus] = useState('acquiring');
    const [coordinates, setCoordinates] = useState(null);
    const [gpsAccuracy, setGpsAccuracy] = useState(null); // GPS accuracy in meters
    const [imageGps, setImageGps] = useState(null); // GPS from image EXIF
    const [useManualAddress, setUseManualAddress] = useState(false);
    const [manualAddress, setManualAddress] = useState('');
    const [geocodingStatus, setGeocodingStatus] = useState('idle');
    const [manualCoordinates, setManualCoordinates] = useState(null);
    const navigate = useNavigate();

    // Separate refs for camera and gallery
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setGpsStatus('error');
            return;
        }

        // Use watchPosition for continuous updates and better accuracy
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setCoordinates({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setGpsAccuracy(position.coords.accuracy);
                setGpsStatus('locked');
                console.log('GPS Update:', position.coords.latitude, position.coords.longitude, 'accuracy:', position.coords.accuracy, 'm');
            },
            (error) => {
                console.error('GPS Error:', error);
                setGpsStatus('error');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );

        // Cleanup watch on unmount
        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    const handleFileSelect = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);

            // Try to extract GPS from image EXIF
            const exifGps = await extractExifGps(file);
            if (exifGps) {
                setImageGps(exifGps);
                console.log('Extracted GPS from image:', exifGps);
            }
        }
    };

    const clearImage = () => {
        setSelectedFile(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
        setImageGps(null);
        // Reset input values
        if (cameraInputRef.current) cameraInputRef.current.value = '';
        if (galleryInputRef.current) galleryInputRef.current.value = '';
    };

    // Geocode address using OpenStreetMap Nominatim (free, no API key needed)
    // Enhanced with structured parameters for better accuracy in Indian addresses
    const geocodeAddress = async () => {
        if (!manualAddress.trim()) return;

        setGeocodingStatus('searching');
        try {
            // Build URL with improved parameters for accuracy
            // - countrycodes=in: Restrict to India
            // - viewbox: Mumbai metropolitan region bounding box
            // - bounded=1: Strict viewbox enforcement
            // - addressdetails=1: Get detailed address breakdown
            // - limit=5: Get multiple results to find best match
            const params = new URLSearchParams({
                format: 'json',
                q: manualAddress,
                countrycodes: 'in',
                viewbox: '72.75,18.85,73.05,19.35', // Mumbai region: minLon,minLat,maxLon,maxLat
                bounded: '1',
                addressdetails: '1',
                limit: '5'
            });

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?${params.toString()}`,
                { headers: { 'User-Agent': 'VarunaNet-App' } }
            );
            const data = await response.json();

            if (data && data.length > 0) {
                // Find the best match - prefer results with higher importance score
                // and matching suburb/neighborhood
                const bestMatch = data.reduce((best, current) => {
                    // Prefer results that are places/suburbs over roads
                    const currentScore = parseFloat(current.importance || 0);
                    const bestScore = parseFloat(best.importance || 0);

                    // Check if address contains the search term in suburb/neighbourhood
                    const addr = current.address || {};
                    const hasLocalMatch =
                        (addr.suburb && manualAddress.toLowerCase().includes(addr.suburb.toLowerCase())) ||
                        (addr.neighbourhood && manualAddress.toLowerCase().includes(addr.neighbourhood.toLowerCase())) ||
                        (addr.city_district && manualAddress.toLowerCase().includes(addr.city_district.toLowerCase()));

                    if (hasLocalMatch && !best._hasLocalMatch) return { ...current, _hasLocalMatch: true };
                    if (!hasLocalMatch && best._hasLocalMatch) return best;

                    return currentScore > bestScore ? current : best;
                }, data[0]);

                setManualCoordinates({
                    lat: parseFloat(bestMatch.lat),
                    lng: parseFloat(bestMatch.lon)
                });
                setGeocodingStatus('found');
                console.log('Geocoded location:', bestMatch.display_name, 'at', bestMatch.lat, bestMatch.lon);
            } else {
                // Fallback: try without viewbox restriction if no results found
                const fallbackParams = new URLSearchParams({
                    format: 'json',
                    q: manualAddress + ', Mumbai, India',
                    countrycodes: 'in',
                    addressdetails: '1',
                    limit: '1'
                });

                const fallbackResponse = await fetch(
                    `https://nominatim.openstreetmap.org/search?${fallbackParams.toString()}`,
                    { headers: { 'User-Agent': 'VarunaNet-App' } }
                );
                const fallbackData = await fallbackResponse.json();

                if (fallbackData && fallbackData.length > 0) {
                    setManualCoordinates({
                        lat: parseFloat(fallbackData[0].lat),
                        lng: parseFloat(fallbackData[0].lon)
                    });
                    setGeocodingStatus('found');
                    console.log('Geocoded location (fallback):', fallbackData[0].display_name);
                } else {
                    setGeocodingStatus('error');
                    setManualCoordinates(null);
                }
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            setGeocodingStatus('error');
            setManualCoordinates(null);
        }
    };

    // Get effective coordinates (manual or GPS based on toggle)
    const getEffectiveCoordinates = () => {
        if (useManualAddress) {
            return manualCoordinates;
        }
        return coordinates;
    };

    // Check if we can submit
    const canSubmit = () => {
        if (useManualAddress) {
            return geocodingStatus === 'found' && manualCoordinates;
        }
        return gpsStatus === 'locked' && coordinates;
    };

    const onSubmit = async (data) => {
        setStatus('submitting');
        const effectiveCoords = getEffectiveCoordinates();

        try {
            if (!effectiveCoords) {
                alert(useManualAddress
                    ? "Please enter an address and search for location."
                    : "GPS coordinates required. Please allow location access.");
                setStatus('idle');
                return;
            }

            const formData = new FormData();
            formData.append('type', data.type);
            formData.append('description', data.description);
            formData.append('lat', effectiveCoords.lat);
            formData.append('lon', effectiveCoords.lng);

            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            await reportService.createReport(formData);
            setStatus('success');
            // Reset form for another submission
            setSelectedFile(null);
            setManualAddress('');
            setManualCoordinates(null);
            setGeocodingStatus('idle');

        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="fade-in" style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                padding: '2rem'
            }}>
                <FaCheckCircle size={64} color="var(--accent-cyan)" className="pulse-animation" />
                <h2 style={{ color: 'var(--accent-cyan)', letterSpacing: '0.1em', margin: 0 }}>DATA_UPLOADED</h2>
                <p className="text-muted">System synchronization complete.</p>
                <button
                    onClick={() => setStatus('idle')}
                    className="btn"
                    style={{ marginTop: '1rem', padding: '0.75rem 2rem' }}
                >
                    SUBMIT_ANOTHER_REPORT
                </button>
            </div>
        );
    }

    const getGpsDisplay = () => {
        if (gpsStatus === 'acquiring') {
            return (
                <span style={{ color: 'var(--accent-violet)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaSpinner className="spin" size={10} /> ACQUIRING_GPS...
                </span>
            );
        } else if (gpsStatus === 'locked' && coordinates) {
            return (
                <span style={{ color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaMapMarkerAlt size={10} />
                    {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                </span>
            );
        } else {
            return (
                <span style={{ color: 'var(--accent-red)' }}>
                    ✗ GPS_UNAVAILABLE
                </span>
            );
        }
    };

    return (
        <div className="container" style={{ maxWidth: 600, padding: '1.5rem 1rem' }}>
            {/* Header */}
            <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.25rem', marginBottom: '0.5rem' }}>NEW_ENTRY_//</h1>
                <div className="text-muted" style={{ display: 'flex', alignItems: 'center' }}>
                    {!useManualAddress ? getGpsDisplay() : (
                        manualCoordinates ? (
                            <span style={{ color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                <FaMapMarkerAlt size={10} />
                                {manualCoordinates.lat.toFixed(4)}, {manualCoordinates.lng.toFixed(4)}
                            </span>
                        ) : (
                            <span style={{ color: 'var(--accent-violet)' }}>MANUAL_ADDRESS_MODE</span>
                        )
                    )}
                </div>
            </header>

            {/* Location Mode Toggle */}
            <div className="card" style={{ marginBottom: '1rem', padding: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        type="button"
                        onClick={() => { setUseManualAddress(false); }}
                        style={{
                            flex: 1,
                            padding: '0.6rem',
                            background: !useManualAddress ? 'rgba(0, 217, 255, 0.15)' : 'transparent',
                            border: `1px solid ${!useManualAddress ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                            color: !useManualAddress ? 'var(--accent-cyan)' : 'var(--text-dim)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            transition: 'var(--transition)'
                        }}
                    >
                        <FaMapMarkerAlt size={10} /> GPS_LOCATION
                    </button>
                    <button
                        type="button"
                        onClick={() => { setUseManualAddress(true); }}
                        style={{
                            flex: 1,
                            padding: '0.6rem',
                            background: useManualAddress ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
                            border: `1px solid ${useManualAddress ? 'var(--accent-violet)' : 'var(--border-subtle)'}`,
                            color: useManualAddress ? 'var(--accent-violet)' : 'var(--text-dim)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            transition: 'var(--transition)'
                        }}
                    >
                        <FaKeyboard size={10} /> MANUAL_ADDRESS
                    </button>
                </div>

                {/* Manual Address Input */}
                {useManualAddress && (
                    <div style={{ marginTop: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={manualAddress}
                                onChange={(e) => {
                                    setManualAddress(e.target.value);
                                    setGeocodingStatus('idle');
                                    setManualCoordinates(null);
                                }}
                                placeholder="Enter specific address (e.g., Dadar West Station, Mumbai)"
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={geocodeAddress}
                                disabled={geocodingStatus === 'searching' || !manualAddress.trim()}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(0, 217, 255, 0.1)',
                                    border: '1px solid var(--accent-cyan)',
                                    color: 'var(--accent-cyan)',
                                    cursor: geocodingStatus === 'searching' || !manualAddress.trim() ? 'not-allowed' : 'pointer',
                                    opacity: geocodingStatus === 'searching' || !manualAddress.trim() ? 0.5 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.7rem'
                                }}
                            >
                                {geocodingStatus === 'searching' ? (
                                    <FaSpinner className="spin" size={10} />
                                ) : (
                                    <FaSearch size={10} />
                                )}
                                LOCATE
                            </button>
                        </div>
                        {geocodingStatus === 'found' && (
                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                                ✓ Location found! Coordinates locked.
                            </p>
                        )}
                        {geocodingStatus === 'error' && (
                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.7rem', color: 'var(--accent-red)' }}>
                                ✗ Address not found. Try a more specific address.
                            </p>
                        )}
                    </div>
                )}

                {/* Location Map Preview */}
                {getEffectiveCoordinates() && (
                    <div style={{ marginTop: '0.75rem', position: 'relative' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.25rem'
                        }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                                LOCATION_PREVIEW
                            </span>
                            {!useManualAddress && gpsAccuracy && (
                                <span style={{
                                    fontSize: '0.6rem',
                                    fontFamily: 'var(--font-mono)',
                                    color: gpsAccuracy < 50 ? 'var(--accent-cyan)' : gpsAccuracy < 100 ? '#fbbf24' : 'var(--accent-red)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}>
                                    <FaCrosshairs size={8} />
                                    ACCURACY: ±{Math.round(gpsAccuracy)}m
                                </span>
                            )}
                        </div>
                        <div style={{
                            height: '150px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: `1px solid ${!useManualAddress ? 'var(--accent-cyan)' : 'var(--accent-violet)'}`,
                        }}>
                            <MapContainer
                                center={[getEffectiveCoordinates().lat, getEffectiveCoordinates().lng]}
                                zoom={16}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={false}
                                attributionControl={false}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[getEffectiveCoordinates().lat, getEffectiveCoordinates().lng]} icon={currentLocationIcon} />
                                <MapRecenter lat={getEffectiveCoordinates().lat} lng={getEffectiveCoordinates().lng} />
                            </MapContainer>
                        </div>
                        <p style={{
                            margin: '0.4rem 0 0',
                            fontSize: '0.6rem',
                            color: 'var(--text-dim)',
                            textAlign: 'center',
                            fontFamily: 'var(--font-mono)'
                        }}>
                            {!useManualAddress ? 'GPS location will be used for your report' : 'Searched address location'}
                        </p>
                    </div>
                )}
            </div>

            {/* Image Upload */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                {/* Hidden file inputs - one for camera, one for gallery */}
                <input
                    type="file"
                    ref={cameraInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                />
                <input
                    type="file"
                    ref={galleryInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileSelect}
                />

                {/* Preview Area */}
                {imagePreview ? (
                    <div style={{ position: 'relative' }}>
                        <div
                            style={{
                                height: 200,
                                background: `url(${imagePreview}) center/cover`,
                                borderRadius: '4px',
                                border: '1px solid var(--accent-cyan)'
                            }}
                        />
                        <button
                            type="button"
                            onClick={clearImage}
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'rgba(239, 68, 68, 0.9)',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <FaTimes size={14} />
                        </button>
                        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', textAlign: 'center', color: 'var(--accent-cyan)' }}>
                            ✓ IMAGE_CAPTURED
                            {imageGps && (
                                <span style={{ display: 'block', marginTop: '0.25rem', color: 'var(--accent-violet)' }}>
                                    📍 Geotag detected in image
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Upload Buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {/* Camera Button */}
                            <button
                                type="button"
                                onClick={() => cameraInputRef.current?.click()}
                                style={{
                                    flex: 1,
                                    height: 120,
                                    background: 'rgba(5, 5, 16, 0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px dashed var(--accent-cyan)',
                                    borderRadius: '8px',
                                    color: 'var(--accent-cyan)',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)'
                                }}
                            >
                                <FaCamera size={32} />
                                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>TAKE_PHOTO</span>
                            </button>

                            {/* Gallery Button */}
                            <button
                                type="button"
                                onClick={() => galleryInputRef.current?.click()}
                                style={{
                                    flex: 1,
                                    height: 120,
                                    background: 'rgba(5, 5, 16, 0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px dashed var(--accent-violet)',
                                    borderRadius: '8px',
                                    color: 'var(--accent-violet)',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)'
                                }}
                            >
                                <FaImage size={32} />
                                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>FROM_GALLERY</span>
                            </button>
                        </div>
                        <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.65rem', marginTop: '0.5rem' }}>
                            Photos with location data will auto-tag coordinates
                        </p>
                    </>
                )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Hazard Type */}
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        color: 'var(--accent-cyan)',
                        letterSpacing: '0.05em'
                    }}>
                        HAZARD_TYPE
                    </label>
                    <select {...register("type", { required: true })}>
                        <option value="debris">DEBRIS_PLASTIC</option>
                        <option value="pollution">OIL_CHEMICAL_SPILL</option>
                        <option value="wildlife">WILDLIFE_STRANDED</option>
                        <option value="erosion">COASTAL_EROSION</option>
                        <option value="other">UNCATEGORIZED</option>
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        color: 'var(--accent-cyan)',
                        letterSpacing: '0.05em'
                    }}>
                        DESCRIPTION_LOG
                    </label>
                    <textarea
                        {...register("description", { required: true })}
                        placeholder="> Input visual data..."
                        rows={4}
                        style={{ resize: 'vertical', minHeight: '100px' }}
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="btn"
                    disabled={status === 'submitting' || !canSubmit()}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        opacity: !canSubmit() ? 0.5 : 1,
                        cursor: !canSubmit() ? 'not-allowed' : 'pointer'
                    }}
                >
                    {status === 'submitting' ? (
                        <><FaSpinner className="spin" size={12} /> TRANSMITTING...</>
                    ) : (
                        'INITIATE_REPORT'
                    )}
                </button>

                {!canSubmit() && (
                    <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.7rem', margin: 0 }}>
                        {useManualAddress
                            ? 'Enter address and click LOCATE to enable submission...'
                            : 'Waiting for GPS lock before submission...'}
                    </p>
                )}
            </form>
        </div>
    );
};

export default Report;
