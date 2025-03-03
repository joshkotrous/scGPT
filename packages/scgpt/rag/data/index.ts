import { z } from "zod";
import { uex } from "../../../uex";
import { UEXFactionObject, UEXFactionsList } from "../../../uex/factions/types";
import {
  UEXGameVersions,
  UEXGameVersionsObject,
} from "../../../uex/gameVersions/types";
import {
  UEXItemAttributeObject,
  UEXItemAttributesList,
  UEXItemObject,
  UEXItemPriceAllObject,
  UEXItemsList,
} from "../../../uex/items/types";
import {
  UEXJurisdictionObject,
  UEXJurisdictionsList,
} from "../../../uex/jurisdictions/types";
import {
  UEXRefineryAuditObject,
  UEXRefineryCapacityObject,
  UEXRefineryMethodObject,
  UEXRefineryMethodsList,
  UEXRefineryYieldObject,
} from "../../../uex/refineries/types";
import {
  UEXStarSystemObject,
  UEXStarSystemsList,
} from "../../../uex/starSystems/types";
import {
  UEXTerminalDistance,
  UEXTerminalDistanceObject,
  UEXTerminalObject,
  UEXTerminalsList,
} from "../../../uex/terminals/types";
import {
  UEXVehicleLoanersList,
  UEXVehicleLoanersObject,
  UEXVehicleObject,
  UEXVehiclePriceObject,
  UEXVehiclePurchasePriceAllObject,
  UEXVehicleRentalPriceAllObject,
} from "../../../uex/vehicles/types";
import { UEXFuelPriceAllObject } from "@uex/fuelPrices/types";
import {
  EnhancedPlanet,
  LocationSystemData,
  LocationSystemDataObject,
  UEXPlatformDataExtraction,
  UEXPlatformDataExtractionMaps,
} from "./types";
import { UEXCategoryObject } from "@uex/categories/types";
import {
  UEXCommodityAverageList,
  UEXCommodityAverageObject,
  UEXCommodityObject,
  UEXCommodityPriceAllObject,
  UEXCommodityPriceHistoryObject,
  UEXCommodityPricesHistoryList,
  UEXCommodityRankingObject,
  UEXCommodityRawPriceAllObject,
  UEXCommodityStatus,
  UEXCommodityStatusObject,
} from "@uex/commodities/types";
import { UEXCompaniesList, UEXCompanyObject } from "@uex/companies/types";
import { DataExtractType } from "@uex/data/types";

export async function getCoreReferenceData(): Promise<{
  gameVersions: UEXGameVersions;
  starSystems: UEXStarSystemsList;
  factions: UEXFactionsList;
  jurisdictions: UEXJurisdictionsList;
  companies: UEXCompaniesList;
  commodityStatus: UEXCommodityStatus;
  refineryMethods: UEXRefineryMethodsList;
}> {
  const [
    gameVersions,
    starSystems,
    factions,
    jurisdictions,
    companies,
    commodityStatus,
    refineryMethods,
  ] = await Promise.all([
    await uex.gameVersions.listGameVersions(),
    await uex.starSystems.listStarSystems(),
    await uex.factions.listAllFactions(),
    await uex.jurisdictions.listAllJurisdictions(),
    await uex.companies.listAllCompanies(),
    await uex.commodities.listCommoditiesStatus(),
    await uex.refineries.listRefineryMethods(),
  ]);
  return {
    gameVersions,
    starSystems,
    factions,
    jurisdictions,
    companies,
    commodityStatus,
    refineryMethods,
  };
}

export async function getLocationHierarchyData(
  starSystems: UEXStarSystemsList
) {
  const systemPromises = starSystems.map(async (system) => {
    const locationData: LocationSystemData = {
      system,
      planets: [],
      orbits: [],
      spaceStations: [],
      outposts: [],
      poi: [],
      cities: [],
    };

    // Get planets, orbits, and space stations in parallel
    const [planets, orbits, spaceStations] = await Promise.all([
      uex.planets.listPlanets({
        filter: { id_star_system: system.id },
      }),
      uex.orbits.listOrbits({
        filter: { id_star_system: system.id },
      }),
      uex.spaceStations.listSpaceStations({
        filter: { id_star_system: system.id },
      }),
    ]);

    // Create enhanced planets with additional properties
    const enhancedPlanets: EnhancedPlanet[] = planets.map((planet) => ({
      ...planet,
      moons: [],
      outposts: [],
      pois: [],
    }));

    locationData.planets = enhancedPlanets;
    locationData.orbits = orbits;
    locationData.spaceStations = spaceStations;

    // For each planet, get its moons, outposts, and POIs in parallel
    const planetDataPromises = enhancedPlanets.map(async (planet) => {
      // Get all three types of data for each planet in parallel
      const [moons, planetOutposts, planetPOIs] = await Promise.all([
        uex.moons.listMoons({
          filter: { id_planet: planet.id },
        }),
        uex.outposts.listOutposts({
          filter: { id_planet: planet.id },
        }),
        uex.poi.listPointsOfInterest({
          filter: { id_planet: planet.id },
        }),
      ]);

      // Assign the results to the planet
      planet.moons = moons;
      planet.outposts = planetOutposts;
      planet.pois = planetPOIs;

      return planet;
    });

    // Wait for all planet data to be populated
    await Promise.all(planetDataPromises);

    // Get orbital distances within the system
    try {
      locationData.orbitDistances = await uex.orbits.listOrbitDistances({
        filter: {
          id_star_system_origin: system.id,
          id_star_system_destination: system.id,
        },
      });
    } catch (error: any) {
      console.warn(
        `Couldn't get orbit distances for system ${system.id}: ${error.message}`
      );
    }

    return { systemId: system.id, locationData };
  });

  // Wait for all star systems to be processed
  const results = await Promise.all(systemPromises);

  // Convert array of results back to the expected object structure
  const locationsBySystem: Record<number, LocationSystemData> = {};
  for (const { systemId, locationData } of results) {
    locationsBySystem[systemId] = locationData;
  }

  return locationsBySystem;
}

export async function getTradingTerminalData(starSystems: UEXStarSystemsList) {
  // Get all terminals (may take multiple requests if result count is large)
  const allTerminals: UEXTerminalsList = [];
  for (const system of starSystems) {
    const systemTerminals = await uex.terminals.listTerminals({
      filter: { id_star_system: system.id },
    });
    if (systemTerminals) {
      allTerminals.push(...systemTerminals);
    }
  }

  // Get terminal distances for important routes
  const terminalDistances: UEXTerminalDistance[] = [];
  console.log(
    "Terminals with default system === 0 ",
    allTerminals.filter((t) => t.is_default_system !== 1).length
  );
  const majorTerminals = allTerminals.filter((t) => t.is_default_system === 1);
  for (const origin of majorTerminals) {
    for (const destination of majorTerminals) {
      if (origin.id !== destination.id) {
        try {
          const distance = await uex.terminals.getTerminalDistance({
            filter: {
              id_terminal_origin: origin.id,
              id_terminal_destination: destination.id,
            },
          });
          terminalDistances.push(distance);
        } catch (error) {
          console.warn(
            `Couldn't get distance between terminals ${origin.id} and ${destination.id}`
          );
        }
      }
    }
  }
  return { allTerminals, terminalDistances, majorTerminals };
}

export async function getCommodityTradingData(
  majorTerminals: UEXTerminalsList
) {
  // Get all commodities
  const commodities = await uex.commodities.listCommodities();

  // Get commodity averages and rankings
  const commodityAverages: UEXCommodityAverageList = [];
  const commodityRanking = await uex.commodities.listCommoditiesRanking();

  for (const commodity of commodities) {
    try {
      const averages = await uex.commodities.listCommoditiesAverages({
        filter: { commodityId: commodity.id },
      });
      commodityAverages.push(...averages);
    } catch (error) {
      console.warn(`Couldn't get averages for commodity ${commodity.id}`);
    }
  }

  // Get all commodity prices
  const allCommodityPrices = await uex.commodities.listAllCommoditiesPrices();
  const allRawCommodityPrices =
    await uex.commodities.listAllCommoditiesRawPrices();

  // Get commodity price history for major terminals and commodities
  const commodityPriceHistory: UEXCommodityPricesHistoryList = [];
  for (const terminal of majorTerminals) {
    for (const commodity of commodities.filter((c) => c.is_available === 1)) {
      try {
        const history = await uex.commodities.listCommoditiesPricesHistory({
          filter: {
            id_terminal: terminal.id,
            id_commodity: commodity.id,
          },
        });
        commodityPriceHistory.push(...history);
      } catch (error) {
        // Skip - not all terminals trade all commodities
      }
    }
  }
  return {
    commodities,
    commodityAverages,
    commodityRanking,
    allCommodityPrices,
    allRawCommodityPrices,
    commodityPriceHistory,
  };
}

export async function getFuelData() {
  const allFuelPrices = await uex.fuelPrices.listAllFuelPrices();
  return allFuelPrices;
}

export async function getVehicleData() {
  // Get all vehicles
  const vehicles = await uex.vehicles.listVehicles();

  // Get vehicle purchase and rental prices
  const allVehiclePurchasePrices =
    await uex.vehicles.listAllVehiclePurchasePrices();
  const allVehicleRentalPrices =
    await uex.vehicles.listAllVehicleRentalPrices();

  // Get pledge store prices
  const vehiclePledgePrices = await uex.vehicles.listVehiclePrices();

  // Get vehicle loaners for concept ships
  let vehicleLoaners: UEXVehicleLoanersList = [];
  for (const vehicle of vehicles.filter((v) => v.is_concept === 1)) {
    try {
      const loaners = await uex.vehicles.getVehicleLoaners({
        filter: { id_vehicle: vehicle.id },
      });
      vehicleLoaners = [...vehicleLoaners, ...loaners];
    } catch (error) {
      console.warn(`Couldn't get loaners for vehicle ${vehicle.id}`);
    }
  }
  return {
    vehicles,
    allVehiclePurchasePrices,
    allVehicleRentalPrices,
    vehiclePledgePrices,
    vehicleLoaners,
  };
}

export async function getItemsData() {
  // Get items by category (weapons, armor, components, etc.)
  // First get categories
  const categories = await uex.categories.listCategories();
  const items: UEXItemsList = [];
  console.log(`Getting ${categories.length} categories...`);
  for (const category of categories) {
    try {
      const categoryItems = await uex.items.listItems({
        filter: { id_category: category.id },
      });
      items.push(...categoryItems);
    } catch (error) {
      console.warn(
        `Couldn't get items for category ${category.id}:${category.name}`
      );
    }
  }

  // Get all item prices
  const allItemPrices = await uex.items.listAllItemPrices();

  // Get item attributes for each item
  // const itemAttributes: UEXItemAttributesList = [];
  console.log(`Getting ${items.length} items...`);

  const itemAttributes = await processBatchedAttributes(items, 50);

  return {
    categories,
    items,
    allItemPrices,
    itemAttributes,
  };
}
async function processBatchedAttributes(items: UEXItemsList, batchSize = 50) {
  let allAttributes: UEXItemAttributesList = [];

  // Calculate how many batches we'll need
  const batchCount = Math.ceil(items.length / batchSize);

  for (let i = 0; i < batchCount; i++) {
    // Get the current batch of items
    const batchStart = i * batchSize;
    const batchItems = items.slice(batchStart, batchStart + batchSize);

    console.log(
      `Processing batch ${i + 1}/${batchCount} (${batchItems.length} items)`
    );

    // Create promises for this batch
    const batchPromises = batchItems.map((item) => {
      return new Promise(async (resolve) => {
        try {
          const attributes = await uex.items.listItemAttributes({
            filter: { id_item: item.id },
          });
          resolve(attributes);
        } catch (error) {
          console.warn(
            `Couldn't get attributes for item ${item.id}:${item.name}`
          );
          resolve([]); // Return empty array on error instead of rejecting
        }
      });
    });

    // Wait for current batch to complete
    const batchResults: UEXItemAttributesList = (await Promise.all(
      batchPromises
    )) as UEXItemAttributesList;

    // Add this batch's results to our collection
    allAttributes = [...allAttributes, ...batchResults];

    // Optional: Add a small delay between batches to be gentle on the API
    if (i < batchCount - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return allAttributes;
}

export async function getRefineryData() {
  const [refineryCapacities, refineryYields, refineryAudits] =
    await Promise.all([
      await uex.refineries.listRefineryCapacities(),
      await uex.refineries.listRefineryYields(),
      await uex.refineries.listRefineryAudits(),
    ]);
  return { refineryCapacities, refineryYields, refineryAudits };
}

export async function getDataExtracts() {
  const [topRoutes, commodityPricesText, recentReports] = await Promise.all([
    await uex.data.getDataExtract(DataExtractType.COMMODITIES_ROUTES),
    await uex.data.getDataExtract(DataExtractType.COMMODITIES_PRICES),
    await uex.data.getDataExtract(DataExtractType.LAST_COMMODITY_DATA_REPORTS),
  ]);
  return { topRoutes, commodityPricesText, recentReports };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract all UEX data for embedding into Pinecone
 * @returns A structured object containing all UEX data
 */
export async function extractUEXData(): Promise<UEXPlatformDataExtraction> {
  console.log("Starting UEX data extraction process...");

  // Step 1: Get core reference data
  console.log("Extracting core reference data...");
  const coreData = await getCoreReferenceData();
  console.log(
    `Retrieved core data: ${coreData.starSystems.length} star systems, ${coreData.factions.length} factions, etc.`
  );

  // // Step 2: Get location hierarchy data
  console.log("Extracting location hierarchy data...");
  const locationData = await getLocationHierarchyData(coreData.starSystems);
  console.log(
    `Retrieved location data for ${
      Object.keys(locationData).length
    } star systems`
  );

  // Step 3: Get trading terminal data
  console.log("Extracting trading terminal data...");
  const terminalData = await getTradingTerminalData(coreData.starSystems);
  console.log(
    `Retrieved ${terminalData.allTerminals.length} terminals and ${terminalData.terminalDistances.length} terminal distances`
  );

  // Step 4: Get commodity trading data
  console.log("Extracting commodity trading data...");
  const commodityData = await getCommodityTradingData(
    terminalData.majorTerminals
  );
  console.log(
    `Retrieved ${commodityData.commodities.length} commodities and ${commodityData.allCommodityPrices.length} price entries`
  );

  // Step 5: Get fuel data
  console.log("Extracting fuel data...");
  const fuelData = await getFuelData();
  console.log(`Retrieved fuel prices data`);

  // Step 6: Get vehicle data
  console.log("Extracting vehicle data...");
  const vehicleData = await getVehicleData();
  console.log(
    `Retrieved ${vehicleData.vehicles.length} vehicles and ${vehicleData.vehicleLoaners.length} loaner entries`
  );

  // Step 7: Get items data
  console.log("Extracting items data...");
  const itemsData = await getItemsData();
  console.log(
    `Retrieved ${itemsData.items.length} items across ${itemsData.categories.length} categories`
  );

  // Step 8: Get refinery data
  console.log("Extracting refinery data...");
  const refineryData = await getRefineryData();
  console.log(`Retrieved refinery data`);

  // Step 9: Get data extracts
  console.log("Extracting special data extracts...");
  const dataExtracts = await getDataExtracts();
  console.log(`Retrieved special data extracts`);

  // Step 10: Assemble the complete dataset
  const completeData = {
    metadata: {
      extractionDate: new Date().toISOString(),
      gameVersion: coreData.gameVersions.live,
    },
    core: coreData,
    locations: locationData,
    terminals: terminalData,
    commodities: commodityData,
    fuel: fuelData,
    vehicles: vehicleData,
    items: itemsData,
    refineries: refineryData,
    extracts: dataExtracts,
  };

  console.log("UEX data extraction complete!");
  return completeData;
}

export const UEXPlatformDataExtractionObject = z.object({
  metadata: z.object({
    extractionDate: z.string(),
    gameVersion: z.string(),
  }),
  core: z.object({
    gameVersions: UEXGameVersionsObject,
    starSystems: z.array(UEXStarSystemObject),
    factions: z.array(UEXFactionObject),
    jurisdictions: z.array(UEXJurisdictionObject),
    companies: z.array(UEXCompanyObject),
    commodityStatus: UEXCommodityStatusObject,
    refineryMethods: z.array(UEXRefineryMethodObject),
  }),
  locations: z.record(z.string(), LocationSystemDataObject),
  terminals: z.object({
    allTerminals: z.array(UEXTerminalObject),
    terminalDistances: z.array(UEXTerminalDistanceObject),
    majorTerminals: z.array(UEXTerminalObject),
  }),
  commodities: z.object({
    commodities: z.array(UEXCommodityObject),
    commodityAverages: z.array(UEXCommodityAverageObject),
    commodityRanking: z.array(UEXCommodityRankingObject),
    allCommodityPrices: z.array(UEXCommodityPriceAllObject),
    allRawCommodityPrices: z.array(UEXCommodityRawPriceAllObject),
    commodityPriceHistory: z.array(UEXCommodityPriceHistoryObject),
  }),
  fuel: z.array(UEXFuelPriceAllObject),
  vehicles: z.object({
    vehicles: z.array(UEXVehicleObject),
    allVehiclePurchasePrices: z.array(UEXVehiclePurchasePriceAllObject),
    allVehicleRentalPrices: z.array(UEXVehicleRentalPriceAllObject),
    vehiclePledgePrices: z.array(UEXVehiclePriceObject),
    vehicleLoaners: z.array(UEXVehicleLoanersObject),
  }),
  items: z.object({
    categories: z.array(UEXCategoryObject),
    items: z.array(UEXItemObject),
    allItemPrices: z.array(UEXItemPriceAllObject),
    itemAttributes: z.array(
      z.union([UEXItemAttributeObject, z.array(UEXItemAttributeObject)])
    ),
  }),
  refineries: z.object({
    refineryCapacities: z.array(UEXRefineryCapacityObject),
    refineryYields: z.array(UEXRefineryYieldObject),
    refineryAudits: z.array(UEXRefineryAuditObject),
  }),
  extracts: z.object({
    topRoutes: z.string(),
    commodityPricesText: z.string(),
    recentReports: z.string(),
  }),
});

export async function processDataForEmbedding(
  extractedData: UEXPlatformDataExtraction
) {
  console.log("Starting data enrichment for embeddings...");

  // Create lookup maps for frequently referenced entities only
  // This avoids excessive memory usage while still allowing fast lookups
  console.log("Building reference maps...");
  const maps = {
    factions: new Map(extractedData.core.factions.map((f) => [f.id, f])),
    jurisdictions: new Map(
      extractedData.core.jurisdictions.map((j) => [j.id, j])
    ),
    starSystems: new Map(extractedData.core.starSystems.map((s) => [s.id, s])),
    commodities: new Map(
      extractedData.commodities.commodities.map((c) => [c.id, c])
    ),
  };

  // Generate chunks by category to avoid holding the entire enriched dataset in memory
  console.log("Generating star system chunks...");
  const systemChunks = generateStarSystemChunks(extractedData, maps);

  // console.log("Generating location chunks...");
  // const locationChunks = generateLocationChunks(extractedData, maps);

  // console.log("Generating terminal chunks...");
  // const terminalChunks = generateTerminalChunks(extractedData, maps);

  // console.log("Generating commodity chunks...");
  // const commodityChunks = generateCommodityChunks(extractedData, maps);

  // console.log("Generating vehicle chunks...");
  // const vehicleChunks = generateVehicleChunks(extractedData, maps);

  // Combine all chunks
  const allChunks = [
    ...systemChunks,
    // ...locationChunks,
    // ...terminalChunks,
    // ...commodityChunks,
    // ...vehicleChunks,
    // Add more categories as needed
  ];

  console.log(`Generated ${allChunks.length} total chunks for embedding`);

  // Save chunks to a file before embedding (in case of issues)

  return allChunks;
}

export function getExtractionMaps(
  extractedData: UEXPlatformDataExtraction
): UEXPlatformDataExtractionMaps {
  const maps = {
    factions: new Map(extractedData.core.factions.map((f) => [f.id, f])),
    jurisdictions: new Map(
      extractedData.core.jurisdictions.map((j) => [j.id, j])
    ),
    starSystems: new Map(extractedData.core.starSystems.map((s) => [s.id, s])),
    commodities: new Map(
      extractedData.commodities.commodities.map((c) => [c.id, c])
    ),
  };
  return maps;
}

// Example of one chunk generation function
export function generateStarSystemChunks(
  extractedData: UEXPlatformDataExtraction,
  maps: UEXPlatformDataExtractionMaps
) {
  const chunks = [];

  for (const system of extractedData.core.starSystems) {
    // Get related data
    const faction = maps.factions.get(system.id_faction);
    const jurisdiction = maps.jurisdictions.get(system.id_jurisdiction);
    const planets = extractedData.locations[system.id]?.planets || [];
    const terminals = extractedData.terminals.allTerminals.filter(
      (t) => t.id_star_system === system.id
    );

    // Create detailed text that includes the relationships
    const text = `Star System: ${system.name}
Location: ${system.name} system in the Star Citizen universe
Faction Control: ${faction?.name || "None"}
Legal Jurisdiction: ${jurisdiction?.name || "None"}
Status: ${
      system.is_available_live
        ? "Available in Star Citizen LIVE servers"
        : "Not yet available in game"
    }

Description:
The ${system.name} system contains ${planets.length} planets: ${planets
      .map((p) => p.name)
      .join(", ")}.
${
  terminals.length > 0
    ? `It has ${terminals.length} trading terminals, including: ${terminals
        .map((t) => t.name)
        .slice(0, 5)
        .join(", ")}${terminals.length > 5 ? "..." : ""}`
    : "It has no known trading terminals."
}
${system.wiki ? `More information available at: ${system.wiki}` : ""}`;

    chunks.push({
      id: `system-${system.id}`,
      text,
      metadata: {
        type: "star_system",
        gameVersion: extractedData.metadata.gameVersion,
        entityId: system.id,
        name: system.name,
        factionId: system.id_faction,
        factionName: faction?.name,
        jurisdictionId: system.id_jurisdiction,
        jurisdictionName: jurisdiction?.name,
        isAvailableLive: system.is_available_live === 1,
        dateAdded: system.date_added,
        dateModified: system.date_modified,
      },
    });
  }

  return chunks;
}
