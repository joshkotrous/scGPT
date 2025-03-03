import { z } from "zod";
import { queryUEX, getValidationObject } from "../core";
import { UEXEndpoint } from "../core";

// Define the schema for terminal information based on the API documentation
export const UEXTerminalObject = z.object({
  id: z.number(),
  id_star_system: z.number(),
  id_planet: z.number(),
  id_orbit: z.number(),
  id_moon: z.number(),
  id_space_station: z.number(),
  id_outpost: z.number(),
  id_poi: z.number(),
  id_city: z.number(),
  id_faction: z.number(),
  id_company: z.number(),
  name: z.string(),
  nickname: z.string(),
  code: z.string(), // UEX code
  type: z.string(), // UEX type
  // screenshot fields are removed as noted in documentation (suspended due to server costs)
  mcs: z.number(), // max container size in SCU (deprecated, replaced by 'max_container_size')
  is_available: z.number(), // available in-game
  is_available_live: z.number(), // available in-game (LIVE)
  is_visible: z.number(), // visible on UEX website
  is_default_system: z.number(), // default terminal in a star system (UEX website)
  is_affinity_influenceable: z.number(), // if terminal data is faction affinity influenced
  is_habitation: z.number(),
  is_refinery: z.number(),
  is_cargo_center: z.number(),
  is_medical: z.number(),
  is_food: z.number(),
  is_shop_fps: z.number(), // shop trading FPS items
  is_shop_vehicle: z.number(), // shop trading vehicle components
  is_refuel: z.number(),
  is_repair: z.number(),
  is_nqa: z.number(), // no questions asked terminal
  is_player_owned: z.number(),
  is_auto_load: z.number(),
  has_loading_dock: z.number(),
  has_docking_port: z.number(),
  has_freight_elevator: z.number(),
  date_added: z.number(), // timestamp
  date_modified: z.number(), // timestamp
  star_system_name: z.string(),
  planet_name: z.string().nullable(),
  orbit_name: z.string().nullable(),
  moon_name: z.string().nullable(),
  space_station_name: z.string().nullable(),
  outpost_name: z.string().nullable(),
  city_name: z.string().nullable(),
  faction_name: z.string().nullable(),
  company_name: z.string().nullable(),
  max_container_size: z.number(), // max container size in SCU
});

export type UEXTerminal = z.infer<typeof UEXTerminalObject>;

const UEXTerminalsResponseObject = getValidationObject(UEXTerminalObject);

export type UEXTerminalsResponse = z.infer<typeof UEXTerminalsResponseObject>;
export type UEXTerminalsList = z.infer<typeof UEXTerminalObject>[];

// Define the schema for terminal distances based on the API documentation
export const UEXTerminalDistanceObject = z.object({
  orbit_name_origin: z.string(),
  terminal_name_origin: z.string(),
  terminal_nickname_origin: z.string(),
  terminal_code_origin: z.string(),
  orbit_name_destination: z.string(),
  terminal_name_destination: z.string(),
  terminal_nickname_destination: z.string(),
  terminal_code_destination: z.string(),
  distance: z.number(), // gigameters
});

export type UEXTerminalDistance = z.infer<typeof UEXTerminalDistanceObject>;

// Filter type for terminals endpoint
export type TerminalsFilter = {
  id_star_system?: number;
  id_planet?: number;
  id_orbit?: number;
  id_moon?: number;
  id_space_station?: number;
  id_city?: number;
  id_outpost?: number;
  id_poi?: number;
  id_faction?: number;
  id_company?: number;
  type?: string;
  name?: string;
  code?: string;
};

// Filter type for terminal distances endpoint
export type TerminalDistancesFilter = {
  id_terminal_origin: number;
  id_terminal_destination: number;
};

/**
 * Get terminals information from the UEX API
 * Retrieves a list of trading terminals in the Star Citizen universe with optional filtering
 * @param filter Optional filter parameters to narrow results
 * @returns Terminals data
 */
export async function listTerminals({
  filter = {},
}: {
  filter?: TerminalsFilter;
} = {}): Promise<UEXTerminalsList> {
  const endpoint: UEXEndpoint = "terminals";

  const result = await queryUEX({
    endpoint,
    queryParams: filter,
    validationObject: UEXTerminalsResponseObject,
  });

  return result.data;
}

/**
 * Get terminal distance information from the UEX API
 * Estimates the distance (in gigameters) between two terminals within the Star Citizen universe
 * @param filter Required parameters specifying origin and destination terminals
 * @returns Terminal distance data
 */
export async function getTerminalDistance({
  filter,
}: {
  filter: TerminalDistancesFilter;
}): Promise<UEXTerminalDistance> {
  const endpoint: UEXEndpoint = "terminals_distances";

  if (!filter.id_terminal_origin) {
    throw new Error("Origin terminal ID (id_terminal_origin) is required");
  }

  if (!filter.id_terminal_destination) {
    throw new Error(
      "Destination terminal ID (id_terminal_destination) is required"
    );
  }

  const result = await queryUEX({
    endpoint,
    queryParams: filter,
    validationObject: UEXTerminalDistanceObject,
  });

  return result;
}
