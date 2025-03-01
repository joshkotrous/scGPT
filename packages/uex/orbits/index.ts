import { z } from "zod";
import { queryUEX, getValidationObject } from "../core";
import { UEXEndpoint } from "../core";

// 1. Define the schema for orbit information
const UEXOrbitObject = z.object({
  id: z.number(),
  id_star_system: z.number(),
  id_faction: z.number(),
  id_jurisdiction: z.number(),
  name: z.string(),
  name_origin: z.string(), // discovery name
  code: z.string(), // UEX code
  is_available: z.number(), // UEX website
  is_available_live: z.number(), // Star Citizen (LIVE servers)
  is_visible: z.number(), // UEX website (visible to everyone)
  is_default: z.number(),
  is_lagrange: z.number(),
  is_man_made: z.number(),
  is_asteroid: z.number(),
  is_planet: z.number(),
  is_star: z.number(),
  date_added: z.number(), // timestamp
  date_modified: z.number(), // timestamp
  star_system_name: z.string(),
  faction_name: z.string().nullable(),
  jurisdiction_name: z.string().nullable(),
});

export type UEXOrbit = z.infer<typeof UEXOrbitObject>;

const UEXOrbitsResponseObject = getValidationObject(UEXOrbitObject);

export type UEXOrbitsResponse = z.infer<typeof UEXOrbitsResponseObject>;
export type UEXOrbitsList = z.infer<typeof UEXOrbitObject>[];

// 2. Define the schema for orbit distances
const UEXOrbitDistanceObject = z.object({
  id: z.number(),
  // id_star_system field removed as noted in documentation (deprecated)
  id_star_system_origin: z.number(),
  id_star_system_destination: z.number(),
  id_orbit_origin: z.number(),
  id_orbit_destination: z.number(),
  distance: z.number(), // value in Giga Meters (GM)
  game_version: z.string(),
  date_added: z.number(), // timestamp
  date_modified: z.number(), // timestamp
  star_system_name: z.string(),
  orbit_origin_name: z.string(),
  orbit_destination_name: z.string(),
});

export type UEXOrbitDistance = z.infer<typeof UEXOrbitDistanceObject>;

const UEXOrbitDistancesResponseObject = getValidationObject(
  UEXOrbitDistanceObject
);

export type UEXOrbitDistancesResponse = z.infer<
  typeof UEXOrbitDistancesResponseObject
>;
export type UEXOrbitDistancesList = z.infer<typeof UEXOrbitDistanceObject>[];

// Filter types for the orbits endpoint
export type OrbitsFilter = {
  id_star_system?: number;
  id_faction?: number;
  id_jurisdiction?: number;
  is_lagrange?: number;
};

// Filter types for the orbits_distances endpoint
export type OrbitDistancesFilter = {
  id_star_system_origin: number;
  id_star_system_destination: number;
  id_orbit_origin?: number;
  id_orbit_destination?: number;
};

/**
 * Get orbits information from the UEX API
 * Retrieves a list of orbits in the Star Citizen universe with optional filtering
 * @param filter Optional filter parameters to narrow results
 * @returns Orbits data
 */
export async function listOrbits({
  filter = {},
}: {
  filter?: OrbitsFilter;
} = {}): Promise<UEXOrbitsList> {
  const endpoint: UEXEndpoint = "orbits";

  const result = await queryUEX({
    endpoint,
    queryParams: filter,
    validationObject: UEXOrbitsResponseObject,
  });

  return result.data;
}

/**
 * Get orbit distances information from the UEX API
 * Obtain the last orbital distances reported by Datarunners
 * @param filter Filter parameters for the API call
 * @returns Orbit distances data
 */
export async function listOrbitDistances({
  filter,
}: {
  filter: OrbitDistancesFilter;
}): Promise<UEXOrbitDistancesResponse> {
  const endpoint: UEXEndpoint = "orbits_distances";

  if (!filter.id_star_system_origin || !filter.id_star_system_destination) {
    throw new Error(
      "Both star system origin and destination IDs are required for the orbits_distances endpoint"
    );
  }

  const result = await queryUEX({
    endpoint,
    queryParams: filter,
    validationObject: UEXOrbitDistancesResponseObject,
  });

  return result.data;
}
