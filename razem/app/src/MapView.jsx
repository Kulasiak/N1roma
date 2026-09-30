// Map of Rome — port of the prototype's map.html (position, hotel, POIs, crowd layer, route) as a bundled Leaflet view.
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const DEMO_POS = [41.90085, 12.48325];
export const HOTEL = [41.90135, 12.49385];
const ROUTE = [DEMO_POS, [41.9016, 12.4838], [41.9024, 12.4852], [41.9019, 12.4866], [41.9004, 12.4884], [41.8999, 12.4893], [41.9004, 12.4912], [41.9009, 12.4926], HOTEL];
const POIS = [['Koloseum', 41.8902, 12.4922], ['Pantheon', 41.8986, 12.4769], ['Bazylika św. Piotra', 41.9022, 12.4539], ['Termini', 41.9010, 12.5018], ['Schody Hiszpańskie', 41.9059, 12.4823], ['Piazza Navona', 41.8992, 12.4731]];
const CROWD = [[41.90090, 12.48330, 'high', 70], [41.89020, 12.49220, 'high', 160], [41.90100, 12.50180, 'high', 140], [41.90220, 12.45390, 'mid', 170], [41.89860, 12.47690, 'mid', 60], [41.90590, 12.48230, 'mid', 70], [41.89920, 12.47310, 'low', 110]];
const CC = { high: '#C8102E', mid: '#E0A21F', low: '#1F8A5B' };

const MapView = forwardRef(function MapView({ route, crowd, pos }, ref) {
  const el = useRef(null);
  const m = useRef(null);

  useEffect(() => {
    const map = L.map(el.current, { zoomControl: false, attributionControl: true }).setView(pos.ll, 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' }).addTo(map);
    const acc = L.circle(pos.ll, { radius: pos.acc, color: '#1C5FB8', weight: 1, fillOpacity: 0.08 }).addTo(map);
    const me = L.marker(pos.ll, { icon: L.divIcon({ className: '', html: '<div class="rz-me"><b></b><i></i></div>', iconSize: [22, 22], iconAnchor: [11, 11] }), zIndexOffset: 1000 }).addTo(map);
    L.marker(HOTEL, { icon: L.divIcon({ className: '', html: '<div class="rz-htl"><span>HTL</span>Artemide</div>', iconSize: [0, 0] }), zIndexOffset: 900 }).addTo(map);
    POIS.forEach(([n, a, b]) => L.marker([a, b], { icon: L.divIcon({ className: '', html: '<div class="rz-poi">' + n + '</div>', iconSize: [0, 0] }) }).addTo(map));
    const crowdLayer = L.layerGroup(CROWD.map(([a, b, lvl, r]) => L.circle([a, b], { radius: r, color: CC[lvl], weight: 2, fillColor: CC[lvl], fillOpacity: 0.22, interactive: false })));
    m.current = { map, acc, me, crowdLayer, casing: null, line: null };
    return () => { map.remove(); m.current = null; };
  }, []);

  // live position
  useEffect(() => {
    const c = m.current; if (!c) return;
    c.me.setLatLng(pos.ll); c.acc.setLatLng(pos.ll).setRadius(pos.acc);
  }, [pos.ll[0], pos.ll[1], pos.acc]);

  useEffect(() => {
    const c = m.current; if (!c) return;
    if (crowd) c.crowdLayer.addTo(c.map); else c.map.removeLayer(c.crowdLayer);
  }, [crowd]);

  useEffect(() => {
    const c = m.current; if (!c) return;
    if (c.casing) { c.map.removeLayer(c.casing); c.map.removeLayer(c.line); c.casing = c.line = null; }
    if (route) {
      // Hand-drawn walking route from the demo position; from a live GPS fix we draw a direct line and hand off to native navigation.
      const pts = pos.real ? [pos.ll, HOTEL] : ROUTE;
      c.casing = L.polyline(pts, { color: '#fff', weight: 10, opacity: 0.95, lineJoin: 'round' }).addTo(c.map);
      c.line = L.polyline(pts, { color: '#16181D', weight: 5, lineJoin: 'round', dashArray: pos.real ? '2 10' : null }).addTo(c.map);
      c.map.fitBounds(c.line.getBounds(), { paddingTopLeft: [40, 110], paddingBottomRight: [40, 330] });
    } else c.map.setView(pos.ll, 15);
  }, [route, pos.real]);

  useImperativeHandle(ref, () => ({
    recenter: () => m.current && m.current.map.setView(pos.ll, 16),
    invalidate: () => m.current && m.current.map.invalidateSize(),
  }), [pos.ll[0], pos.ll[1]]);

  return <div ref={el} style={{ position: 'absolute', inset: 0, zIndex: 0, isolation: 'isolate', background: '#EDE9E0' }} />;
});

export default MapView;
