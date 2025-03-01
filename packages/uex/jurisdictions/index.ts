import { z } from "zod";
import { uex } from "..";
import { UEXEndpoint } from "../core";

// Define the schema for jurisdiction information based on the API documentation
const UEXJurisdictionObject = z.object({
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
  faction_name: z.string(),
});

export type UEXJurisdiction = z.infer<typeof UEXJurisdictionObject>;

const UEXJurisdictionsResponseObject = uex.core.getValidationObject(
  UEXJurisdictionObject
);

export type UEXJurisdictionsResponse = z.infer<
  typeof UEXJurisdictionsResponseObject
>;

/**
 * Get all jurisdictions information from the UEX API
 * Retrieves a list of all jurisdictions in the Star Citizen universe
 * @returns Jurisdictions data
 */
export async function listAllJurisdictions(): Promise<UEXJurisdictionsResponse> {
  const endpoint: UEXEndpoint = "jurisdictions";

  const result = await uex.core.queryUEX({
    endpoint,
    validationObject: UEXJurisdictionsResponseObject,
  });

  return result;
}
