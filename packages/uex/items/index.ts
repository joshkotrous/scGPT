import { z } from "zod";
import { uex } from "..";
import { UEXEndpoint } from "../core";

// 1. /items endpoint schema
const UEXItemObject = z.object({
  id: z.number(), // route ID, may change during website updates
  id_parent: z.number(),
  id_category: z.number(),
  id_company: z.number(),
  id_vehicle: z.number(), // if linked to a vehicle
  name: z.string(),
  section: z.string(), // coming from categories
  category: z.string(), // coming from categories
  company_name: z.string(), // coming from companies
  vehicle_name: z.string(), // coming from vehicles
  slug: z.string(), // UEX URLs
  uuid: z.string(), // star citizen uuid
  url_store: z.string(), // pledge store URL
  is_exclusive_pledge: z.number(),
  is_exclusive_subscriber: z.number(),
  is_exclusive_concierge: z.number(),
  // screenshot field removed as noted in documentation (suspended due to server costs)
  // attributes field removed as noted in documentation (deprecated)
  notification: z.any().optional(), // heads up about an item, such as known bugs, etc.
  date_added: z.number(), // timestamp
  date_modified: z.number(), // timestamp
});

export type UEXItem = z.infer<typeof UEXItemObject>;

const UEXItemsResponseObject = uex.core.getValidationObject(UEXItemObject);

export type UEXItemsResponse = z.infer<typeof UEXItemsResponseObject>;
export type UEXItemsList = z.infer<typeof UEXItemObject>[];

// 2. /items_attributes endpoint schema
const UEXItemAttributeObject = z.object({
  id: z.number(),
  id_item: z.number(),
  id_category: z.number(),
  id_category_attribute: z.number(),
  category_name: z.string(),
  item_name: z.string(),
  item_uuid: z.string(),
  attribute_name: z.string(),
  value: z.string(),
  unit: z.string(),
  date_added: z.number(), // timestamp, first time added
  date_modified: z.number(), // timestamp, last price update
});

export type UEXItemAttribute = z.infer<typeof UEXItemAttributeObject>;

const UEXItemAttributesResponseObject = uex.core.getValidationObject(
  UEXItemAttributeObject
);

export type UEXItemAttributesResponse = z.infer<
  typeof UEXItemAttributesResponseObject
>;
export type UEXItemAttributesList = z.infer<typeof UEXItemAttributeObject>[];

// 3. /items_prices endpoint schema
const UEXItemPriceObject = z.object({
  id: z.number(),
  id_item: z.number(),
  id_parent: z.number(),
  id_category: z.number(),
  id_vehicle: z.number(),
  id_star_system: z.number(),
  id_planet: z.number(),
  id_orbit: z.number(),
  id_moon: z.number(),
  id_city: z.number(),
  id_outpost: z.number(),
  id_poi: z.number(),
  id_faction: z.number(),
  id_terminal: z.number(),

  // Buy prices
  price_buy: z.number(), // last reported price
  price_buy_min: z.number(),
  price_buy_min_week: z.number(),
  price_buy_min_month: z.number(),
  price_buy_max: z.number(),
  price_buy_max_week: z.number(),
  price_buy_max_month: z.number(),
  price_buy_avg: z.number(),
  price_buy_avg_week: z.number(),
  price_buy_avg_month: z.number(),

  // Sell prices
  price_sell: z.number(), // last reported price
  price_sell_min: z.number(),
  price_sell_min_week: z.number(),
  price_sell_min_month: z.number(),
  price_sell_max: z.number(),
  price_sell_max_week: z.number(),
  price_sell_max_month: z.number(),
  price_sell_avg: z.number(),
  price_sell_avg_week: z.number(),
  price_sell_avg_month: z.number(),

  // Durability
  durability: z.number(), // last reported durability (%)
  durability_min: z.number(),
  durability_min_week: z.number(),
  durability_min_month: z.number(),
  durability_max: z.number(),
  durability_max_week: z.number(),
  durability_max_month: z.number(),
  durability_avg: z.number(),
  durability_avg_week: z.number(),
  durability_avg_month: z.number(),

  // Faction
  faction_affinity: z.number().optional(), // datarunner's affinity average at a location (from -100 to 100)

  // Other
  game_version: z.string(),
  date_added: z.number(), // timestamp, first time added
  date_modified: z.number(), // timestamp, last price update
  item_name: z.string(),
  star_system_name: z.string(),
  planet_name: z.string(),
  orbit_name: z.string(),
  moon_name: z.string(),
  space_station_name: z.string(),
  outpost_name: z.string(),
  city_name: z.string(),
  terminal_name: z.string(),
  terminal_code: z.string(),
  terminal_is_player_owned: z.number(),
});

export type UEXItemPrice = z.infer<typeof UEXItemPriceObject>;

const UEXItemPricesResponseObject =
  uex.core.getValidationObject(UEXItemPriceObject);

export type UEXItemPricesResponse = z.infer<typeof UEXItemPricesResponseObject>;
export type UEXItemPricesList = z.infer<typeof UEXItemPriceObject>[];

// 4. /items_prices_all endpoint schema
const UEXItemPriceAllObject = z.object({
  id: z.number(),
  id_item: z.number(),
  id_terminal: z.number(),
  id_category: z.number(),
  price_buy: z.number(), // last reported price in UEC, per unit
  price_sell: z.number(), // last reported price in UEC, per unit
  date_added: z.number(), // timestamp, first time added
  date_modified: z.number(), // timestamp, last price update
  item_name: z.string(),
  item_uuid: z.string(), // star citizen uuid
  terminal_name: z.string(),
});

export type UEXItemPriceAll = z.infer<typeof UEXItemPriceAllObject>;

const UEXItemPricesAllResponseObject = uex.core.getValidationObject(
  UEXItemPriceAllObject
);

export type UEXItemPricesAllResponse = z.infer<
  typeof UEXItemPricesAllResponseObject
>;

export type UEXItemPricesAllList = z.infer<typeof UEXItemPriceAllObject>[];

// Filter types for the various endpoints
export type ItemsFilter = {
  id_category?: number;
  id_company?: number;
  uuid?: string;
};

export type ItemAttributesFilter = {
  id_item?: number;
  id_category?: number;
  uuid?: string;
};

export type ItemPricesFilter = {
  id_terminal?: number | string; // Supports comma-separated list of up to 10 ids
  id_item?: number;
  id_category?: number;
  uuid?: string;
};

/**
 * Get items information from the UEX API
 * Retrieve a comprehensive list of Star Citizen items, including ship components, weapons, and more
 * @param filter Filter parameters for the API call (at least one is required)
 * @returns Items data
 */
export async function listItems({
  filter,
}: {
  filter: ItemsFilter;
}): Promise<UEXItemsList> {
  const endpoint: UEXEndpoint = "items";

  if (!filter || Object.keys(filter).length === 0) {
    throw new Error(
      "At least one filter parameter is required for the items endpoint"
    );
  }

  const result = await uex.core.queryUEX({
    endpoint,
    queryParams: filter,
    validationObject: UEXItemsResponseObject,
  });

  return result.data;
}

/**
 * Get item attributes information from the UEX API
 * Obtain a list of attributes of a specific item
 * @param filter Filter parameters for the API call (at least one is required)
 * @returns Item attributes data
 */
export async function listItemAttributes({
  filter,
}: {
  filter: ItemAttributesFilter;
}): Promise<UEXItemAttributesList> {
  const endpoint: UEXEndpoint = "items_attributes";

  if (!filter || Object.keys(filter).length === 0) {
    throw new Error(
      "At least one filter parameter is required for the items_attributes endpoint"
    );
  }

  const result = await uex.core.queryUEX({
    endpoint,
    queryParams: filter,
    validationObject: UEXItemAttributesResponseObject,
  });

  return result.data;
}

/**
 * Get item prices information from the UEX API
 * Retrieve a comprehensive list of prices for all items, including armor, ship components, weapons, and more
 * @param filter Filter parameters for the API call (at least one is required)
 * @returns Item prices data
 */
export async function listItemPrices({
  filter,
}: {
  filter: ItemPricesFilter;
}): Promise<UEXItemPricesList> {
  const endpoint: UEXEndpoint = "items_prices";

  if (!filter || Object.keys(filter).length === 0) {
    throw new Error(
      "At least one filter parameter is required for the items_prices endpoint"
    );
  }

  const result = await uex.core.queryUEX({
    endpoint,
    queryParams: filter,
    validationObject: UEXItemPricesResponseObject,
  });

  return result.data;
}

/**
 * Get all item prices from the UEX API
 * Retrieve a list of prices for all items in all terminals, all at once
 * @returns All item prices data
 */
export async function listAllItemPrices(): Promise<UEXItemPricesAllResponse> {
  const endpoint: UEXEndpoint = "items_prices_all";

  const result = await uex.core.queryUEX({
    endpoint,
    validationObject: UEXItemPricesAllResponseObject,
  });

  return result.data;
}
