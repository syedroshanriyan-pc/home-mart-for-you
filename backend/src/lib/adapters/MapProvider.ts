/**
 * Map, Geocoding, and Routing Provider Abstraction
 */

import { calculateDistanceMeters, DEFAULT_SHOP_COORDINATES } from "../delivery";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  formattedAddress: string;
  locality: string;
  city: string;
  postalCode?: string;
  coordinates: Coordinates;
}

export interface IMapProvider {
  reverseGeocode(coords: Coordinates): Promise<GeocodeResult>;
  calculateDistance(from: Coordinates, to: Coordinates): Promise<number>;
}

export class ModularMapProvider implements IMapProvider {
  async reverseGeocode(coords: Coordinates): Promise<GeocodeResult> {
    // If coords are in Mulbagal region (~13.16, ~78.39)
    return {
      formattedAddress: `Near Main Road, Mulbagal, Karnataka (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
      locality: "Mulbagal Town",
      city: "Mulbagal",
      postalCode: "563131",
      coordinates: coords,
    };
  }

  async calculateDistance(from: Coordinates, to: Coordinates): Promise<number> {
    // Accurate Haversine distance in meters
    return calculateDistanceMeters(from.lat, from.lng, to.lat, to.lng);
  }
}

export const mapProvider = new ModularMapProvider();
export { DEFAULT_SHOP_COORDINATES };
