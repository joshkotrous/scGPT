import { z } from "zod";
import { queryUEX, getValidationObject } from "../core";
import { UEXEndpoint } from "../core";

// 1. Define schema for refineries audits
const UEXRefineryAuditObject = z.object({
  id: z.number(),
  id_commodity: z.number(),
  id_star_system: z.number(),
  id_planet: z.number(),
  id_orbit: z.number(),
  id_moon: z.number(),
  id_city: z.number(),
  id_outpost: z.number(),
  id_poi: z.number(),
  id_faction: z.number(),
  id_terminal: z.number(),
  yield: z.number(), // percentage of material specialization yield at refinery
  capacity: z.number(), // refinery capacity in percent
  method: z.number(), // refining method
  quantity: z.number(), // amount to be refined
  quantity_yield: z.number(), // amount yield
  quantity_inert: z.number(), // amount of inert materials
  total_cost: z.number(), // refining total cost
  total_time: z.number(), // refining total time in minutes
  date_added: z.number(), // timestamp
  date_reported: z.number(), // timestamp
  game_version: z.string(),
  datarunner: z.string(), // datarunner ign
  commodity_name: z.string(),
  star_system_name: z.string(),
  planet_name: z.string(),
  orbit_name: z.string(),
  moon_name: z.string(),
  space_station_name: z.string(),
  city_name: z.string(),
  outpost_name: z.string(),
  terminal_name: z.string(),
});

export type UEXRefineryAudit = z.infer<typeof UEXRefineryAuditObject>;

const UEXRefineryAuditsResponseObject = getValidationObject(
  UEXRefineryAuditObject
);

export type UEXRefineryAuditsResponse = z.infer<
  typeof UEXRefineryAuditsResponseObject
>;

// 2. Define schema for refineries capacities
const UEXRefineryCapacityObject = z.object({
  id: z.number(),
  id_commodity: z.number(),
  id_star_system: z.number(),
  id_planet: z.number(),
  id_orbit: z.number(),
  id_moon: z.number(),
  id_city: z.number(),
  id_outpost: z.number(),
  id_poi: z.number(),
  id_faction: z.number(),
  id_terminal: z.number(),
  value: z.number(), // percentage of yield bonus at refinery
  value_week: z.number(), // percentage of yield bonus at refinery in the last 7 days
  value_month: z.number(), // percentage of yield bonus at refinery in the last 30 days
  date_added: z.number(), // timestamp
  date_modified: z.number(), // timestamp
  star_system_name: z.string(),
  planet_name: z.string(),
  orbit_name: z.string(),
  moon_name: z.string(),
  space_station_name: z.string(),
  city_name: z.string(),
  outpost_name: z.string(),
  terminal_name: z.string(),
});

export type UEXRefineryCapacity = z.infer<typeof UEXRefineryCapacityObject>;

const UEXRefineryCapacitiesResponseObject = getValidationObject(
  UEXRefineryCapacityObject
);

export type UEXRefineryCapacitiesResponse = z.infer<
  typeof UEXRefineryCapacitiesResponseObject
>;

// 3. Define schema for refineries methods
const UEXRefineryMethodObject = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  rating_yield: z.number(), // '1' to low, '2' to medium, '3' to high
  rating_cost: z.number(), // '1' to low, '2' to medium, '3' to high
  rating_speed: z.number(), // '1' to slow, '2' to medium, '3' to fast
  date_added: z.number(), // timestamp
  date_modified: z.number(), // timestamp
});

export type UEXRefineryMethod = z.infer<typeof UEXRefineryMethodObject>;

const UEXRefineryMethodsResponseObject = getValidationObject(
  UEXRefineryMethodObject
);

export type UEXRefineryMethodsResponse = z.infer<
  typeof UEXRefineryMethodsResponseObject
>;

// 4. Define schema for refineries yields
const UEXRefineryYieldObject = z.object({
  id: z.number(),
  id_commodity: z.number(),
  id_star_system: z.number(),
  id_planet: z.number(),
  id_orbit: z.number(),
  id_moon: z.number(),
  id_city: z.number(),
  id_outpost: z.number(),
  id_poi: z.number(),
  id_faction: z.number(),
  id_terminal: z.number(),
  value: z.number(), // percentage of yield bonus at refinery
  value_week: z.number(), // percentage of yield bonus at refinery (last 7 days)
  value_month: z.number(), // percentage of yield bonus at refinery (last 30 days)
  date_added: z.number(), // timestamp
  date_modified: z.number(), // timestamp
  commodity_name: z.string(),
  star_system_name: z.string(),
  planet_name: z.string(),
  orbit_name: z.string(),
  moon_name: z.string(),
  space_station_name: z.string(),
  city_name: z.string(),
  outpost_name: z.string(),
  terminal_name: z.string(),
});

export type UEXRefineryYield = z.infer<typeof UEXRefineryYieldObject>;

const UEXRefineryYieldsResponseObject = getValidationObject(
  UEXRefineryYieldObject
);

export type UEXRefineryYieldsResponse = z.infer<
  typeof UEXRefineryYieldsResponseObject
>;

/**
 * Get refinery audits information from the UEX API
 * Retrieves historical data about refinery operations
 * @returns Refinery audits data (maximum 500 rows)
 */
export async function listRefineryAudits(): Promise<UEXRefineryAuditsResponse> {
  const endpoint: UEXEndpoint = "refineries_audits";

  const result = await queryUEX({
    endpoint,
    validationObject: UEXRefineryAuditsResponseObject,
  });

  return result;
}

/**
 * Get refinery capacities information from the UEX API
 * Retrieves a list of the estimated capacity percentages for all refineries
 * @returns Refinery capacities data (maximum 500 rows)
 */
export async function listRefineryCapacities(): Promise<UEXRefineryCapacitiesResponse> {
  const endpoint: UEXEndpoint = "refineries_capacities";

  const result = await queryUEX({
    endpoint,
    validationObject: UEXRefineryCapacitiesResponseObject,
  });

  return result;
}

/**
 * Get refining methods information from the UEX API
 * Retrieves a list of the refining methods used by all in-game refineries
 * @returns Refining methods data (maximum 500 rows)
 */
export async function listRefineryMethods(): Promise<UEXRefineryMethodsResponse> {
  const endpoint: UEXEndpoint = "refineries_methods";

  const result = await queryUEX({
    endpoint,
    validationObject: UEXRefineryMethodsResponseObject,
  });

  return result;
}

/**
 * Get refinery yields information from the UEX API
 * Retrieves a list of all refineries yields bonuses per commodity
 * @returns Refinery yields data (maximum 500 rows)
 */
export async function listRefineryYields(): Promise<UEXRefineryYieldsResponse> {
  const endpoint: UEXEndpoint = "refineries_yields";

  const result = await queryUEX({
    endpoint,
    validationObject: UEXRefineryYieldsResponseObject,
  });

  return result;
}
