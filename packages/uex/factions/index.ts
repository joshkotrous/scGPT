import { z } from "zod";
import { queryUEX, getValidationObject } from "../core";
import { UEXEndpoint } from "../core";

// Define the schema for faction information based on the API documentation
const UEXFactionObject = z.object({
  id: z.number(),
  ids_star_systems: z.string(), // comma separated
  ids_factions_friendly: z.string(), // comma separated
  ids_factions_hostile: z.string(), // comma separated
  name: z.string(),
  wiki: z.string(), // wiki page
  is_piracy: z.number(), // is related to piracy
  is_bounty_hunting: z.number(), // is related to bounty hunting
  date_added: z.number(), // timestamp
  date_modified: z.number(), // timestamp
});

export type UEXFaction = z.infer<typeof UEXFactionObject>;

const UEXFactionsResponseObject = getValidationObject(UEXFactionObject);

export type UEXFactionsResponse = z.infer<typeof UEXFactionsResponseObject>;
export type UEXFactionsList = z.infer<typeof UEXFactionObject>[];

/**
 * Get all factions information from the UEX API
 * Retrieves a list of all factions in the Star Citizen universe
 * @returns Factions data
 */
export async function listAllFactions(): Promise<UEXFactionsList> {
  const endpoint: UEXEndpoint = "factions";

  const result = await queryUEX({
    endpoint,
    validationObject: UEXFactionsResponseObject,
  });

  return result.data;
}
