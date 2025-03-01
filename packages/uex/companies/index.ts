import { z } from "zod";
import { queryUEX, getValidationObject } from "../core";
import { UEXEndpoint } from "../core";

const UEXCompanyObject = z.object({
  id: z.number(),
  id_faction: z.number(),
  name: z.string(),
  nickname: z.string(),
  wiki: z.string(),
  industry: z.string(), // main activity
  is_item_manufacturer: z.number(),
  is_vehicle_manufacturer: z.number(),
  date_added: z.number(), // timestamp
  date_modified: z.number(), // timestamp
});

export type UEXCompany = z.infer<typeof UEXCompanyObject>;

const UEXCompaniesResponseObject = getValidationObject(UEXCompanyObject);

export type UEXCompaniesResponse = z.infer<typeof UEXCompaniesResponseObject>;

export type CompaniesFilter = {
  is_item_manufacturer?: number; // show only item manufacturers
  is_vehicle_manufacturer?: number; // show only vehicle manufacturers
};

/**
 * Get companies information from the UEX API
 * Retrieves a list of all companies in the Star Citizen universe
 * @param filter Optional filter parameters to narrow results
 * @returns Companies data
 */
export async function listAllCompanies({
  filter = {},
}: {
  filter?: CompaniesFilter;
} = {}): Promise<UEXCompaniesResponse> {
  const endpoint: UEXEndpoint = "companies";

  const result = await queryUEX({
    endpoint,
    queryParams: filter,
    validationObject: UEXCompaniesResponseObject,
  });

  return result;
}
