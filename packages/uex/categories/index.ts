import { z } from "zod";
import { queryUEX, getValidationObject } from "../core";
import { UEXEndpoint } from "../core";

const UEXCategoryObject = z.object({
  id: z.number(),
  type: z.string(),
  section: z.string(),
  name: z.string(),
  is_game_related: z.number(),
  is_mining: z.number(),
  date_added: z.number(),
  date_modified: z.number(),
});

const UEXCategoryAttributesObject = z.object({
  id: z.number(),
  id_category: z.number(),
  name: z.string(),
  category_name: z.string(),
  date_added: z.number(),
  date_modified: z.number(),
});

const UEXCategoryResponseObject = getValidationObject(UEXCategoryObject);

const UEXCategoryAttributesResponseObject = getValidationObject(
  UEXCategoryAttributesObject
);

export type UEXCategoryResponse = z.infer<typeof UEXCategoryResponseObject>;
export type UEXCategoryList = z.infer<typeof UEXCategoryObject>[];
export type UEXCategoryAttributesResponse = z.infer<
  typeof UEXCategoryAttributesResponseObject
>;
export type UEXCategoryAttributesList = z.infer<
  typeof UEXCategoryAttributesObject
>[];

export async function listCategories({
  filter,
}: {
  filter?: { type?: string; section?: string };
} = {}): Promise<UEXCategoryList> {
  const endpoint: UEXEndpoint = "categories";

  const queryParams: Record<string, string> = {};

  if (filter?.type) {
    queryParams.type = filter.type;
  }

  if (filter?.section) {
    queryParams.section = filter.section;
  }

  const result = await queryUEX({
    endpoint,
    queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    validationObject: UEXCategoryObject,
  });

  return result.data;
}

export async function listCategoriesAttributes({
  filter,
}: {
  filter?: { categoryId?: number };
} = {}): Promise<UEXCategoryAttributesResponse> {
  const endpoint: UEXEndpoint = "categories_attributes";

  const queryParams: Record<string, string> = {};

  if (filter?.categoryId !== undefined) {
    queryParams.id_category = String(filter.categoryId);
  }

  const result = await queryUEX({
    endpoint,
    queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    validationObject: UEXCategoryAttributesResponseObject,
  });

  return result.data;
}
