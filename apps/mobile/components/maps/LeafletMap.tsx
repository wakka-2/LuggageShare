import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { V2_COLORS, themed } from '@/providers/ThemeProvider';
import { isDarkScheme } from '@/lib/colorScheme';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface LeafletMapHandle {
  /** Move the pin (and optionally recenter the map on it). */
  setMarker: (point: LatLng, recenter?: boolean) => void;
  /** Recenter without moving the pin. */
  flyTo: (point: LatLng, zoom?: number) => void;
}

interface LeafletMapProps {
  center: LatLng;
  zoom?: number;
  marker?: LatLng | null;
  /** When true the user can pan/zoom and tap to drop the pin. */
  interactive?: boolean;
  onPick?: (point: LatLng) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * OpenStreetMap via Leaflet inside a WebView.
 *
 * Chosen over react-native-maps because it needs no Google Maps API key or
 * billing account. OSM tiles require visible attribution, which Leaflet renders.
 * For high traffic, swap TILE_URL for a commercial tile provider.
 */
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

function buildHtml({
  center,
  zoom,
  marker,
  interactive,
}: Required<Omit<LeafletMapProps, 'onPick' | 'style'>>) {
  const pin = V2_COLORS.primary;
  return `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html,body,#map{margin:0;padding:0;height:100%;width:100%;background:${V2_COLORS.surface};}
  ${isDarkScheme() ? '.leaflet-tile-pane{filter:invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9);}' : ''}
  .leaflet-control-attribution{font-size:9px;}
  .pin{width:26px;height:26px;border-radius:50% 50% 50% 0;background:${pin};transform:rotate(-45deg);
       border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);}
</style></head><body><div id="map"></div><script>
  var post=function(m){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify(m));};
  var map=L.map('map',{zoomControl:${interactive},dragging:${interactive},touchZoom:${interactive},
    scrollWheelZoom:false,doubleClickZoom:${interactive},boxZoom:false,keyboard:false,tap:${interactive}})
    .setView([${center.lat},${center.lng}],${zoom});
  L.tileLayer('${TILE_URL}',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
  var icon=L.divIcon({className:'',html:'<div class="pin"></div>',iconSize:[26,26],iconAnchor:[13,26]});
  var marker=null;
  window.setMarker=function(lat,lng,recenter){
    if(marker){marker.setLatLng([lat,lng]);}else{
      marker=L.marker([lat,lng],{icon:icon,draggable:${interactive}}).addTo(map);
      marker.on('dragend',function(e){var p=e.target.getLatLng();post({type:'pick',lat:p.lat,lng:p.lng});});
    }
    if(recenter){map.setView([lat,lng],Math.max(map.getZoom(),15));}
  };
  window.flyTo=function(lat,lng,z){map.setView([lat,lng],z||map.getZoom());};
  ${marker ? `window.setMarker(${marker.lat},${marker.lng},false);` : ''}
  ${interactive ? "map.on('click',function(e){window.setMarker(e.latlng.lat,e.latlng.lng,false);post({type:'pick',lat:e.latlng.lat,lng:e.latlng.lng});});" : ''}
  post({type:'ready'});
</script></body></html>`;
}

export const LeafletMap = forwardRef<LeafletMapHandle, LeafletMapProps>(function LeafletMap(
  { center, zoom = 12, marker = null, interactive = true, onPick, style },
  ref
) {
  const webRef = useRef<WebView>(null);

  // Build the page once; later changes go through injectJavaScript so the map
  // keeps its pan/zoom state instead of reloading.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const html = useMemo(() => buildHtml({ center, zoom, marker, interactive }), [interactive]);

  useImperativeHandle(ref, () => ({
    setMarker: ({ lat, lng }, recenter = true) => {
      webRef.current?.injectJavaScript(`window.setMarker(${lat},${lng},${recenter});true;`);
    },
    flyTo: ({ lat, lng }, z) => {
      webRef.current?.injectJavaScript(`window.flyTo(${lat},${lng},${z ?? 'undefined'});true;`);
    },
  }));

  const handleMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'pick' && onPick) onPick({ lat: msg.lat, lng: msg.lng });
    } catch {
      // Ignore messages that are not ours.
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        nestedScrollEnabled
        setSupportMultipleWindows={false}
        style={styles.web}
        // Non-interactive previews must not swallow the parent ScrollView's gestures.
        pointerEvents={interactive ? 'auto' : 'none'}
      />
    </View>
  );
});

const styles = themed(() =>
  StyleSheet.create({
    container: { overflow: 'hidden', backgroundColor: V2_COLORS.surface },
    web: { flex: 1, backgroundColor: 'transparent' },
  })
);
