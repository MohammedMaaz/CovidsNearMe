import {bboxes, decode_bbox} from 'ngeohash';

const get_circle_box = (cLat, cLng, r) => {
  let coords = get_destination(cLat, cLng, 1.41421356237 * r, 225);
  coords.push(...get_destination(cLat, cLng, 1.41421356237 * r, 45));
  return coords;
};

const get_distance = (lat1, lng1, lat2, lng2) => {
  const p = 0.017453292519943295;
  const c = Math.cos;
  const a =
    0.5 -
    c((lat2 - lat1) * p) / 2 +
    (c(lat1 * p) * c(lat2 * p) * (1 - c((lng2 - lng1) * p))) / 2;

  return 12742000 * Math.asin(Math.sqrt(a));
};

const get_destination = (lat, lng, d, b) => {
  const R = 6371;
  d = d / 1000;
  b = (b * Math.PI) / 180;
  lat = (lat * Math.PI) / 180;
  lng = (lng * Math.PI) / 180;

  const finalLat = Math.asin(
    Math.sin(lat) * Math.cos(d / R) +
      Math.cos(lat) * Math.sin(d / R) * Math.cos(b),
  );
  const finalLng =
    lng +
    Math.atan2(
      Math.sin(b) * Math.sin(d / R) * Math.cos(lat),
      Math.cos(d / R) - Math.sin(lat) * Math.sin(finalLat),
    );

  return [(finalLat * 180) / Math.PI, (finalLng * 180) / Math.PI];
};

const is_hash_outside_circle = (hash, cLat, cLng, r, e) => {
  const coords = decode_bbox(hash); //get 4 bounding coords of this hash
  const minLat = Math.max(coords[0], Math.min(cLat, coords[2]));
  const minLng = Math.max(coords[1], Math.min(cLng, coords[3]));
  let minDistance = get_distance(cLat, cLng, minLat, minLng);
  //provision for percentage error
  if (e > 0) minDistance = minDistance + (e / 100) * r;
  return minDistance >= r;
};

const get_circle_hashes = (lat, lng, radius, precision, error = 0) => {
  const circleBox = get_circle_box(lat, lng, radius);
  return bboxes(
    circleBox[0],
    circleBox[1],
    circleBox[2],
    circleBox[3],
    precision,
  ).filter(hash => !is_hash_outside_circle(hash, lat, lng, radius, error));
};

const Geo = {
  get_destination,
  get_distance,
  get_circle_hashes,
  get_circle_box,
};

export default Geo;
