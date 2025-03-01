import { uex } from "../../../uex";
import {
  UEXCommodityAverageList,
  UEXCommodityPricesHistoryList,
  UEXCommodityStatusResponse,
} from "../../../uex/commodities";
import { UEXCompaniesResponse } from "../../../uex/companies";
import { UEXFactionsList } from "../../../uex/factions";
import { UEXGameVersions } from "../../../uex/gameVersions";
import { UEXItemAttributesList, UEXItemsList } from "../../../uex/items";
import { UEXJurisdictionsResponse } from "../../../uex/jurisdictions";
import { UEXPlanet } from "../../../uex/planets";
import { UEXRefineryMethodsResponse } from "../../../uex/refineries";
import { UEXStarSystem, UEXStarSystemsList } from "../../../uex/starSystems";
import { UEXTerminalDistance, UEXTerminalsList } from "../../../uex/terminals";
import { UEXVehicleLoanersResponse } from "../../../uex/vehicles";

export async function getCoreReferenceData(): Promise<{
  gameVersions: UEXGameVersions;
  starSystems: UEXStarSystemsList;
  factions: UEXFactionsList;
  jurisdictions: UEXJurisdictionsResponse;
  companies: UEXCompaniesResponse;
  commodityStatus: UEXCommodityStatusResponse;
  refineryMethods: UEXRefineryMethodsResponse;
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
  // Define a proper type for our planet objects with the added properties
  interface EnhancedPlanet extends UEXPlanet {
    moons?: any[];
    outposts?: any[];
    pois?: any[];
  }

  // Define the type for our structure
  interface LocationSystemData {
    system: UEXStarSystem;
    planets: EnhancedPlanet[];
    orbits: any[];
    spaceStations: any[];
    outposts: any[];
    poi: any[];
    cities: any[];
    orbitDistances?: any;
  }

  const locationsBySystem: Record<number, LocationSystemData> = {};

  for (const system of starSystems) {
    locationsBySystem[system.id] = {
      system,
      planets: [],
      orbits: [],
      spaceStations: [],
      outposts: [],
      poi: [],
      cities: [],
    };

    // Get planets in this system
    const planets = await uex.planets.listPlanets({
      filter: { id_star_system: system.id },
    });

    // Create enhanced planets with additional properties
    const enhancedPlanets: EnhancedPlanet[] = planets.map((planet) => ({
      ...planet,
      moons: [],
      outposts: [],
      pois: [],
    }));

    locationsBySystem[system.id].planets = enhancedPlanets;

    // Get orbits in this system
    const orbits = await uex.orbits.listOrbits({
      filter: { id_star_system: system.id },
    });
    locationsBySystem[system.id].orbits = orbits;

    // Get space stations in this system
    const spaceStations = await uex.spaceStations.listSpaceStations({
      filter: { id_star_system: system.id },
    });
    locationsBySystem[system.id].spaceStations = spaceStations;

    // For each planet, get its moons, outposts, and POIs
    for (const planet of enhancedPlanets) {
      const moons = await uex.moons.listMoons({
        filter: { id_planet: planet.id },
      });
      planet.moons = moons;

      // Get outposts on this planet
      const planetOutposts = await uex.outposts.listOutposts({
        filter: { id_planet: planet.id },
      });
      planet.outposts = planetOutposts;

      // Get POIs on this planet
      const planetPOIs = await uex.poi.listPointsOfInterest({
        filter: { id_planet: planet.id },
      });
      planet.pois = planetPOIs;
    }

    // Get orbital distances within the system
    try {
      const orbitDistances = await uex.orbits.listOrbitDistances({
        filter: {
          id_star_system_origin: system.id,
          id_star_system_destination: system.id,
        },
      });
      locationsBySystem[system.id].orbitDistances = orbitDistances;
    } catch (error: any) {
      console.warn(
        `Couldn't get orbit distances for system ${system.id}: ${error.message}`
      );
    }
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
    allTerminals.push(...systemTerminals);
  }

  // Get terminal distances for important routes
  const terminalDistances: UEXTerminalDistance[] = [];
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
  const vehicleLoaners: UEXVehicleLoanersResponse[] = [];
  for (const vehicle of vehicles.filter((v) => v.is_concept === 1)) {
    try {
      const loaners = await uex.vehicles.getVehicleLoaners({
        filter: { id_vehicle: vehicle.id },
      });
      vehicleLoaners.push(loaners);
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

  for (const category of categories) {
    try {
      const categoryItems = await uex.items.listItems({
        filter: { id_category: category.id },
      });
      items.push(...categoryItems);
    } catch (error) {
      console.warn(`Couldn't get items for category ${category.id}`);
    }
  }

  // Get all item prices
  const allItemPrices = await uex.items.listAllItemPrices();

  // Get item attributes for each item
  const itemAttributes: UEXItemAttributesList = [];
  for (const item of items) {
    try {
      const attributes = await uex.items.listItemAttributes({
        filter: { id_item: item.id },
      });
      itemAttributes.push(...attributes);
    } catch (error) {
      console.warn(`Couldn't get attributes for item ${item.id}`);
    }
  }
  return {
    categories,
    items,
    allItemPrices,
    itemAttributes,
  };
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
    await uex.data.getDataExtract(uex.data.DataExtractType.COMMODITIES_ROUTES),
    await uex.data.getDataExtract(uex.data.DataExtractType.COMMODITIES_PRICES),
    await uex.data.getDataExtract(
      uex.data.DataExtractType.LAST_COMMODITY_DATA_REPORTS
    ),
  ]);
}

/**
 * Extract all UEX data for embedding into Pinecone
 * @returns A structured object containing all UEX data
 */
export async function extractUEXData() {
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

  // // Step 3: Get trading terminal data
  // console.log("Extracting trading terminal data...");
  // const terminalData = await getTradingTerminalData(coreData.starSystems);
  // console.log(
  //   `Retrieved ${terminalData.allTerminals.length} terminals and ${terminalData.terminalDistances.length} terminal distances`
  // );

  // // Step 4: Get commodity trading data
  // console.log("Extracting commodity trading data...");
  // const commodityData = await getCommodityTradingData(
  //   terminalData.majorTerminals
  // );
  // console.log(
  //   `Retrieved ${commodityData.commodities.length} commodities and ${commodityData.allCommodityPrices.length} price entries`
  // );

  // // Step 5: Get fuel data
  // console.log("Extracting fuel data...");
  // const fuelData = await getFuelData();
  // console.log(`Retrieved fuel prices data`);

  // // Step 6: Get vehicle data
  // console.log("Extracting vehicle data...");
  // const vehicleData = await getVehicleData();
  // console.log(
  //   `Retrieved ${vehicleData.vehicles.length} vehicles and ${vehicleData.vehicleLoaners.length} loaner entries`
  // );

  // // Step 7: Get items data
  // console.log("Extracting items data...");
  // const itemsData = await getItemsData();
  // console.log(
  //   `Retrieved ${itemsData.items.length} items across ${itemsData.categories.length} categories`
  // );

  // // Step 8: Get refinery data
  // console.log("Extracting refinery data...");
  // const refineryData = await getRefineryData();
  // console.log(`Retrieved refinery data`);

  // // Step 9: Get data extracts
  // console.log("Extracting special data extracts...");
  // const dataExtracts = await getDataExtracts();
  // console.log(`Retrieved special data extracts`);

  // // Step 10: Assemble the complete dataset
  // const completeData = {
  //   metadata: {
  //     extractionDate: new Date().toISOString(),
  //     gameVersion: coreData.gameVersions.live,
  //   },
  //   core: coreData,
  //   locations: locationData,
  //   terminals: terminalData,
  //   commodities: commodityData,
  //   fuel: fuelData,
  //   vehicles: vehicleData,
  //   items: itemsData,
  //   refineries: refineryData,
  //   extracts: dataExtracts,
  // };

  // console.log("UEX data extraction complete!");
  // return completeData;
}
