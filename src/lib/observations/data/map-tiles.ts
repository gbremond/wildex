export const MAP_TILE_HOST = 'tile.openstreetmap.org';

export const MAP_TILE_URL = `https://${MAP_TILE_HOST}/{z}/{x}/{y}.png`;

// The name is part of the on-device contract: changing it orphans the tiles an
// installed app has already cached, so it stays as first shipped.
export const MAP_TILE_CACHE = 'map-tiles-v1';
