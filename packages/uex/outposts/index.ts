import { z } from "zod";
import { uex } from "..";
import { UEXEndpoint } from "../core";

// Define the schema for outpost information based on the API documentation
const UEXOutpostObject = z.object({
  id: z.number(),
  id_star_system: z.number(),
  id_planet: z.number(),
  id_orbit: z.number(),
  id_moon: z.number(),
  id_faction: z.number(),
  id_jurisdiction: z.number(),
  name: z.string(),
  nickname: z.string(),
  is_available: z.number(), // UEX website
  is_available_live: z.number(), // Star Citizen (LIVE servers)
  is_visible: z.number(), // UEX website (visible to everyone)
  is_default: z.number(),
  is_monitored: z.number(),
  is_armistice: z.number(),
  is_landable: z.number(),
  is_decommissioned: z.number(),
  has_quantum_marker: z.number(),
  has_trade_terminal: z.number(),
  has_habitation: z.number(),
  has_refinery: z.number(),
  has_cargo_center: z.number(),
  has_clinic: z.number(),
  has_food: z.number(),
  has_shops: z.number(),
  has_refuel: z.number(),
  has_repair: z.number(),
  has_gravity: z.number(),
  has_loading_dock: z.number(),
  has_docking_port: z.number(),
  has_freight_elevator: z.number(),
  pad_types: z.string(), // XS, S, M, L, XL
  date_added: z.number(), // timestamp
  date_modified: z.number(), // timestamp
  star_system_name: z.string(),
  planet_name: z.string(),
  orbit_name: z.string(),
  moon_name: z.string(),
  faction_name: z.string(),
  jurisdiction_name: z.string(),
});

export type UEXOutpost = z.infer<typeof UEXOutpostObject>;

const UEXOutpostsResponseObject =
  uex.core.getValidationObject(UEXOutpostObject);

export type UEXOutpostsResponse = z.infer<typeof UEXOutpostsResponseObject>;
export type UEXOutpostsList = z.infer<typeof UEXOutpostObject>[];

// Filter type for outposts endpoint
export type OutpostsFilter = {
  id_star_system?: number;
  id_faction?: number;
  id_jurisdiction?: number;
  id_planet?: number;
  id_orbit?: number;
  id_moon?: number;
};

/**
 * Get outposts information from the UEX API
 * Retrieves a list of outposts in the Star Citizen universe with optional filtering
 * @param filter Optional filter parameters to narrow results
 * @returns Outposts data
 */
export async function listOutposts({
  filter = {},
}: {
  filter?: OutpostsFilter;
} = {}): Promise<UEXOutpostsList> {
  const endpoint: UEXEndpoint = "outposts";

  const result = await uex.core.queryUEX({
    endpoint,
    queryParams: filter,
    validationObject: UEXOutpostsResponseObject,
  });

  return result.data;
}
