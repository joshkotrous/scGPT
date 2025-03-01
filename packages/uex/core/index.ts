import { z } from "zod";

const UEX_API_URL = "https://api.uexcorp.space/2.0/";

const UEXEndpointObject = z.enum([
  "categories",
  "categories_attributes",
  "cities",
  "commodities",
  "commodities_alerts",
  "commodities_averages",
  "commodities_prices",
  "commodities_prices_history",
  "commodities_ranking",
  "commodities_prices_all",
  "commodities_raw_prices",
  "commodities_raw_prices_all",
  "commodities_routes",
  "commodities_status",
  "companies",
  "crew",
  "data_extract",
  "data_parameters",
  "factions",
  "fleet",
  "fuel_prices",
  "fuel_prices_all",
  "game_versions",
  "items",
  "items_attributes",
  "items_prices",
  "items_prices_all",
  "jurisdictions",
  "marketplace_favorites",
  "marketplace_listings",
  "moons",
  "orbits",
  "orbits_distances",
  "organizations",
  "outposts",
  "planets",
  "poi",
  "refineries_audits",
  "refineries_capacities",
  "refineries_methods",
  "refineries_yields",
  "space_stations",
  "star_systems",
  "terminals",
  "terminals_distances",
  "user",
  "user_refineries_jobs",
  "user_trades",
  "vehicles",
  "vehicles_loaners",
  "vehicles_prices",
  "vehicles_purchases_prices",
  "vehicles_purchases_prices_all",
  "vehicles_rentals_prices",
  "vehicles_rentals_prices_all",
  "wallet_balance",
  "data_submit",
  "marketplace_advertise",
  "user_refineries_jobs_add",
  "user_trades_add",
  "user_trades_edit",
  "wallet_add",
  "user_refineries_jobs_remove",
  "user_trades_remove",
]);

export type UEXEndpoint = z.infer<typeof UEXEndpointObject>;

export async function queryUEX({
  endpoint,
  queryParams,
  body,
  validationObject,
  method = "GET",
  logResult = false,
}: {
  endpoint: UEXEndpoint;
  queryParams?: Record<string, string | number | undefined>;
  body?: any;
  validationObject: z.ZodType<any>;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  logResult?: boolean;
}) {
  try {
    let url = `${UEX_API_URL}${endpoint}`;

    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams();

      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === "string") {
            params.append(key, value);
          }
          if (typeof value === "number") {
            params.append(key, value.toString());
          }
        }
      });

      if (params.toString()) {
        url = `${url}?${params.toString()}`;
      }
    }

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    if (body && method !== "GET") {
      options.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    const resp = await fetch(url, options);
    const json = await resp.json();

    if (!resp.ok) {
      throw new Error(
        `Error querying UEX: ${resp.status} ${
          resp.statusText
        }\n${JSON.stringify(json, null, 2)}`
      );
    }
    if (logResult) {
      console.log(`[RESULT] ${endpoint} \n\n`, JSON.stringify(json, null, 2));
    }

    return validationObject.parse(json);
  } catch (error) {
    console.error(
      `Could not query UEX API: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

export function getValidationObject(validationObject: z.ZodType<any>) {
  return z.object({
    status: z.string(),
    http_code: z.number(),
    data: z.union([z.array(validationObject), validationObject]),
  });
}
