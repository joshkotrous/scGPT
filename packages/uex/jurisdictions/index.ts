import { z } from "zod";
import { queryUEX, getValidationObject } from "../core";
import { UEXEndpoint } from "../core";

// Define the schema for jurisdiction information based on the API documentation
export const UEXJurisdictionObject = z.object({
  id: z.number(),
  id_faction: z.number(), // comma separated
  name: z.string(),
  nickname: z.string(),
  is_available: z.number(), // UEX website
  is_available_live: z.number(), // Star Citizen (LIVE servers)
  is_visible: z.number(), // UEX website (visible to everyone)
  is_default: z.number(),
  wiki: z.string(), // wiki page
  date_added: z.number(), // timestamp
  date_modified: z.number(), // timestamp
  faction_name: z.string().nullable(),
});

export type UEXJurisdiction = z.infer<typeof UEXJurisdictionObject>;

const UEXJurisdictionsResponseObject = getValidationObject(
  UEXJurisdictionObject
);

export type UEXJurisdictionsResponse = z.infer<
  typeof UEXJurisdictionsResponseObject
>;
export type UEXJurisdictionsList = z.infer<typeof UEXJurisdictionObject>[];

/**
 * Get all jurisdictions information from the UEX API
 * Retrieves a list of all jurisdictions in the Star Citizen universe
 * @returns Jurisdictions data
 */
export async function listAllJurisdictions(): Promise<UEXJurisdictionsList> {
  const endpoint: UEXEndpoint = "jurisdictions";

  const result = await queryUEX({
    endpoint,
    validationObject: UEXJurisdictionsResponseObject,
  });

  return result.data;
}
