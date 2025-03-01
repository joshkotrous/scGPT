import { z } from "zod";
import { queryUEX, getValidationObject } from "../core";
import { UEXEndpoint } from "../core";

// Define valid data extract types
export enum DataExtractType {
  COMMODITIES_ROUTES = "commodities_routes", // top 30 commodities routes according to UEX
  COMMODITIES_PRICES = "commodities_prices", // last commodities average prices
  LAST_COMMODITY_DATA_REPORTS = "last_commodity_data_reports", // last 30 commodities reports sent by Datarunners
}

// For data extract, we expect a plain text response
const UEXDataExtractResponseObject = z.string();

export type UEXDataExtractResponse = z.infer<
  typeof UEXDataExtractResponseObject
>;

/**
 * Get data extract information from the UEX API
 * Retrieves formatted text data for different data types
 *
 * @param dataType Type of data to extract
 * @returns Formatted text data as a string
 */
export async function getDataExtract(
  dataType: DataExtractType
): Promise<UEXDataExtractResponse> {
  const endpoint: UEXEndpoint = "data_extract";

  const result = await queryUEX({
    endpoint,
    queryParams: { data: dataType },
    validationObject: UEXDataExtractResponseObject,
  });

  return result;
}
