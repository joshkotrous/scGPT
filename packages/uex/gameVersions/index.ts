import { z } from "zod";
import { queryUEX, getValidationObject } from "../core";
import { UEXEndpoint } from "@uex/core";

// Define the schema for game versions information based on the API documentation
const UEXGameVersionsObject = z.object({
  live: z.string(), // current live version, e.g. '4.0.2'
  ptu: z.string(), // current ptu versions, e.g. '4.0.2' or empty if there is no PTU set
});

export type UEXGameVersions = z.infer<typeof UEXGameVersionsObject>;

/**
 * Get current game versions information from the UEX API
 * Retrieves information about current live and PTU versions of Star Citizen
 * @returns Game versions data
 */
export async function listGameVersions(): Promise<UEXGameVersions> {
  const endpoint: UEXEndpoint = "game_versions";

  const result = await queryUEX({
    endpoint,
    validationObject: UEXGameVersionsObject,
  });

  return result.data;
}
