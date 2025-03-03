import { UEXPlanet, UEXPlanetObject } from "@uex/planets/types";
import { UEXStarSystem, UEXStarSystemObject } from "@uex/starSystems/types";
import { z } from "zod";
import { UEXPlatformDataExtractionObject } from ".";
import { UEXFaction } from "@uex/factions/types";
import { UEXJurisdiction } from "@uex/jurisdictions/types";
import { UEXCommodity } from "@uex/commodities/types";

export interface EnhancedPlanet extends UEXPlanet {
  moons?: any[];
  outposts?: any[];
  pois?: any[];
}

export const EnhancedPlanetObject = UEXPlanetObject.extend({
  moons: z.array(z.any()).optional(),
  outposts: z.array(z.any()).optional(),
  pois: z.array(z.any()).optional(),
});

export const LocationSystemDataObject = z.object({
  system: UEXStarSystemObject,
  planets: z.array(EnhancedPlanetObject),
  orbits: z.array(z.any()),
  spaceStations: z.array(z.any()),
  outposts: z.array(z.any()),
  poi: z.array(z.any()),
  cities: z.array(z.any()),
  orbitDistances: z.any().optional(),
});

export type LocationSystemData = z.infer<typeof LocationSystemDataObject>;

export type UEXPlatformDataExtraction = z.infer<
  typeof UEXPlatformDataExtractionObject
>;

export interface UEXPlatformDataExtractionMaps {
  factions: Map<number, UEXFaction>;
  jurisdictions: Map<number, UEXJurisdiction>;
  starSystems: Map<number, UEXStarSystem>;
  commodities: Map<number, UEXCommodity>;
}
