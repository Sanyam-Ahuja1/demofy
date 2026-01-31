'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/ui/primitives/Input';

export interface AddressComponents {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressComponents) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

// Extend window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

export function AddressAutocomplete({
  onAddressSelect,
  placeholder = 'Start typing your address...',
  label = 'Address',
  required = false,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null); // For manual fallback and standard autocomplete
  // const autocompleteRef = useRef<HTMLDivElement>(null); // REMOVED: Custom web component implementation
  const mapRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Maps references
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<any>(null); // Type as any for AdvancedMarkerElement
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      setError('Google Maps API key not configured. Using manual entry only.');
      return;
    }

    // Wait for Google Maps to load and initialize autocomplete
    const checkGoogle = setInterval(() => {
      if (window.google?.maps?.places) {
        clearInterval(checkGoogle);
        setIsLoaded(true);
        
        // Initialize Autocomplete for the input field
        if (inputRef.current) {
          initializeAutocomplete();
        }
      }
    }, 100);

    // Clean up after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkGoogle);
    }, 10000);

    return () => {
      clearInterval(checkGoogle);
      clearTimeout(timeout);
    };
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current) return;

    try {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        return;
      }

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'in' },
        fields: ['address_components', 'geometry', 'formatted_address'],
      });

      (inputRef.current as any)._autocomplete = autocomplete;

      autocomplete.addListener('place_changed', () => {
        try {
          const place = autocomplete.getPlace();

          if (!place.geometry || !place.geometry.location) {
            setError('Please select an address from the dropdown');
            return;
          }

          // Update Map
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setCenter(place.geometry.location);
            mapInstanceRef.current.setZoom(17);
            
            // Update marker position and visibility (standard Marker API)
            markerRef.current.setPosition(place.geometry.location);
            markerRef.current.setMap(mapInstanceRef.current);
            
            // Ensure map is visible
            if (mapRef.current) {
             mapRef.current.style.display = 'block';
             const tip = mapRef.current.nextElementSibling as HTMLElement;
             if (tip) tip.style.display = 'block';
            }
          }

          const components = extractAddressComponents(place, 'geocoder-api'); // Use standard format
          if (components) {
            onAddressSelect(components);
            setInputValue(components.line1);
            setError('');
          }
        } catch (err) {
          console.error('Error processing place selection:', err);
        }
      });
    } catch (err) {
      console.error('Error initializing autocomplete:', err);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    try {
      geocoderRef.current = new window.google.maps.Geocoder();
    } catch (e) {
      console.error('Error initializing geocoder:', e);
    }

    try {
      const defaultLocation = { lat: 20.5937, lng: 78.9629 };

      // Use standard Map without mapId (no AdvancedMarkerElement requirement)
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 5,
        streetViewControl: false,
        mapTypeControl: false,
        // Removed mapId - not needed for standard Marker
      });

      if (mapRef.current) {
        mapRef.current.style.display = 'block';
        const tip = mapRef.current.nextElementSibling as HTMLElement;
        if (tip) tip.style.display = 'block';
      }

      // Use standard Marker instead of AdvancedMarkerElement
      markerRef.current = new window.google.maps.Marker({
        map: null,
        position: defaultLocation,
        draggable: true,
        title: 'Drag to select location',
      });

      if (markerRef.current) {
        markerRef.current.addListener('dragend', () => {
          const position = markerRef.current.getPosition();
          if (position) {
            reverseGeocode(position);
          }
        });
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng && markerRef.current) {
            markerRef.current.setPosition(e.latLng);
            markerRef.current.setMap(mapInstanceRef.current);
            reverseGeocode(e.latLng);
          }
        });
      }

    } catch (err) {
      console.error('Error initializing map:', err);
      if (mapRef.current) mapRef.current.style.display = 'none';
    }
  };

  const reverseGeocode = (latLng: google.maps.LatLng | google.maps.LatLngLiteral) => {
    if (!geocoderRef.current) return;

    geocoderRef.current.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        // Geocoder returns "GeocoderResult" (old format), not "Place" (new format)
        // We pass 'geocoder-api' to tell our extractor how to parse it
        const components = extractAddressComponents(results[0], 'geocoder-api');
        
        if (components) {
          // If using the new autocomplete element, we might want to update its value visually
          // But direct value manipulation of the web component is limited.
          setInputValue(components.line1); 
          onAddressSelect(components);
          setError('');
        }
      } else {
        console.error('Geocoder failed due to: ' + status);
      }
    });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setError('');

    // CRITICAL: Call getCurrentPosition IMMEDIATELY to preserve Safari iOS user gesture
    // Any operation before this call can break Safari's gesture chain
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Now we can safely initialize map and do other operations
        // Initialize Map if not already initialized and Google Maps is loaded
        if (isLoaded && mapRef.current && !mapInstanceRef.current) {
          initializeMap();
        }
        
        // Check if Google Maps is available
        if (!window.google?.maps) {
          setError('Google Maps is not available. Please enter address manually.');
          setIsLocating(false);
          return;
        }
        
        const latLng = new google.maps.LatLng(latitude, longitude);

        // Initialize map if it wasn't initialized before
        if (!mapInstanceRef.current && mapRef.current) {
          initializeMap();
        }

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setCenter(latLng);
          mapInstanceRef.current.setZoom(17);
          markerRef.current.setPosition(latLng);
          markerRef.current.setMap(mapInstanceRef.current);
          
          if (mapRef.current) {
            mapRef.current.style.display = 'block';
            const tip = mapRef.current.nextElementSibling as HTMLElement;
            if (tip) tip.style.display = 'block';
          }
        }

        reverseGeocode(latLng);
        setIsLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Unable to retrieve your location. Please check permissions.');
        setIsLocating(false);
      }
    );
  };

  /**
   * Helper to extract components from either the Old Geocoder API or the New Place API
   */
  const extractAddressComponents = (
    result: any, 
    source: 'place-api' | 'geocoder-api' = 'geocoder-api'
  ): AddressComponents | null => {
    
    // 1. Normalize the inputs based on source
    // New Place API uses camelCase (addressComponents) and `longText`
    // Old Geocoder API uses snake_case (address_components) and `long_name`
    const componentsList = source === 'place-api' ? result.addressComponents : result.address_components;
    const location = source === 'place-api' ? result.location : result.geometry?.location;

    if (!componentsList || !location) return null;

    let streetNumber = '';
    let route = '';
    let city = '';
    let state = '';
    let pincode = '';
    let country = '';

    for (const component of componentsList) {
      const types = component.types;
      // Handle property name difference
      const value = source === 'place-api' ? component.longText : component.long_name;

      if (types.includes('street_number')) streetNumber = value;
      if (types.includes('route')) route = value;
      if (types.includes('locality') || types.includes('administrative_area_level_2')) city = value;
      if (types.includes('administrative_area_level_1')) state = value;
      if (types.includes('postal_code')) pincode = value;
      if (types.includes('country')) country = value;
    }

    const formattedAddress = source === 'place-api' ? result.formattedAddress : result.formatted_address;
    const line1 = `${streetNumber} ${route}`.trim() || formattedAddress || '';
    
    // Handle lat/lng: In new API they are numbers or functions? 
    // Usually Place API returns a LatLng object which has methods.
    const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
    const lng = typeof location.lng === 'function' ? location.lng() : location.lng;

    return {
      line1,
      city,
      state,
      pincode,
      country,
      latitude: lat,
      longitude: lng,
    };
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          ref={inputRef}
          label={label}
          value={inputValue}
          onChangeText={(text) => {
            setInputValue(text);
          }}
          placeholder={placeholder}
          required={required}
          error={error}
        />
      </div>
      
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={isLocating}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLocating ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        )}
        <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
      </button>
      
      {/* Visual Map Container */}
      <div 
        ref={mapRef} 
        style={{
             width: '100%',
             height: '300px',
             borderRadius: '0.5rem',
             overflow: 'hidden',
             border: '1px solid #e5e5e5',
             display: 'none'
        }}
        className="bg-neutral-50"
      />
      <p className="text-xs text-neutral-500" style={{ display: 'none' }} ref={(el) => { if(el && mapRef.current && mapRef.current.style.display !== 'none') el.style.display = 'block'; }}>
        Tip: You can drag the marker on the map to pinpoint your exact location.
      </p>

      {error && !error.includes('manual') && (
        <p className="text-xs text-neutral-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}