import { z } from "zod";
import { queryUEX, getValidationObject } from "../core";
import { UEXEndpoint } from "../core";

const UEXCityObject = z.object({
  id: z.number(),
  id_star_system: z.number(),
  id_planet: z.number(),
  id_orbit: z.number(),
  id_moon: z.number(),
  id_faction: z.number(),
  id_jurisdiction: z.number(),
  name: z.string(),
  code: z.string(),
  is_available: z.number(),
  is_available_live: z.number(),
  is_visible: z.number(),
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
  has_gravity: z.number(),
  has_loading_dock: z.number(),
  has_docking_port: z.number(),
  has_freight_elevator: z.number(),
  pad_types: z.null(),
  wiki: z.string(),
  date_added: z.number(),
  date_modified: z.number(),
  star_system_name: z.string(),
  planet_name: z.string(),
  orbit_name: z.string(),
  moon_name: z.string().nullable(),
  faction_name: z.string().nullable(),
  jurisdiction_name: z.string().nullable(),
});

const UEXCityResponseObject = getValidationObject(UEXCityObject);
export type UEXCityResponse = z.infer<typeof UEXCityResponseObject>;

export async function listCities({
  filter,
}: {
  filter?: {
    starSystemId?: number;
    factionId?: number;
    jurisdictionId?: number;
    planetId?: number;
    orbitId?: number;
    moonId?: number;
  };
} = {}): Promise<UEXCityResponse> {
  const endpoint: UEXEndpoint = "cities";

  const queryParams: Record<string, string> = {};

  if (filter?.starSystemId !== undefined) {
    queryParams.id_star_system = String(filter.starSystemId);
  }

  if (filter?.factionId !== undefined) {
    queryParams.id_faction = String(filter.factionId);
  }

  if (filter?.jurisdictionId !== undefined) {
    queryParams.id_jurisdiction = String(filter.jurisdictionId);
  }

  if (filter?.planetId !== undefined) {
    queryParams.id_planet = String(filter.planetId);
  }

  if (filter?.orbitId !== undefined) {
    queryParams.id_orbit = String(filter.orbitId);
  }

  if (filter?.moonId !== undefined) {
    queryParams.id_moon = String(filter.moonId);
  }

  const result = await queryUEX({
    endpoint,
    queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    validationObject: UEXCityResponseObject,
  });

  return result;
}
