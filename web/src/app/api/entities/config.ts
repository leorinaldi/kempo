import { Prisma } from "@prisma/client"

// Entity configuration for consolidated CRUD routes
// Each entity defines its Prisma model, validation, includes, and relationships

export type EntityKey =
  | "people"
  | "organizations"
  | "brands"
  | "products"
  | "nations"
  | "states"
  | "cities"
  | "places"
  | "events"
  | "albums"

export type RelationKey =
  | "images"
  | "inspirations"
  | "brands"
  | "products"
  | "states"
  | "cities"
  | "places"
  | "tracks"
  | "people"
  | "locations"
  | "media"
  | "relations"

interface FieldValidation {
  required?: string[]
  enum?: Record<string, string[]>
}

interface EntityRelation {
  type: "images" | "inspirations" | "children" | "custom"
  itemType?: string // for polymorphic relations (images, inspirations)
  childModel?: string // for parent-child relations
  foreignKey?: string // for parent-child relations
}

export interface EntityConfig {
  model: string // Prisma model name (lowercase)
  labelSingular: string
  labelPlural: string
  orderBy: Record<string, "asc" | "desc">
  validation: FieldValidation
  articleType: string | null // article type filter for available-articles, null = any
  articleRelationField: string | null // field name on Article that links back (e.g., "person", "brand")
  include: Prisma.JsonValue // Prisma include for list queries
  dateFields: string[] // fields that should be converted to Date
  filters?: string[] // query params supported for filtering
  relations: Record<string, EntityRelation>
  uniqueArticleCheck?: boolean // whether to check for duplicate article links
}

export const entityConfig: Record<EntityKey, EntityConfig> = {
  people: {
    model: "person",
    labelSingular: "person",
    labelPlural: "people",
    orderBy: { lastName: "asc" },
    validation: {
      required: ["firstName", "lastName", "gender"],
      enum: { gender: ["male", "female"] },
    },
    articleType: "person",
    articleRelationField: "person",
    include: {
      article: { select: { id: true, title: true } },
    },
    dateFields: ["dateBorn", "dateDied"],
    relations: {
      images: { type: "images", itemType: "person" },
      inspirations: { type: "inspirations", itemType: "person" },
    },
    uniqueArticleCheck: true,
  },

  organizations: {
    model: "organization",
    labelSingular: "organization",
    labelPlural: "organizations",
    orderBy: { name: "asc" },
    validation: {
      required: ["name", "orgType"],
    },
    articleType: null, // any article type allowed
    articleRelationField: "organization",
    include: {
      article: { select: { id: true, title: true } },
    },
    dateFields: ["dateFounded", "dateDissolved"],
    filters: ["orgType"],
    relations: {
      images: { type: "images", itemType: "organization" },
      inspirations: { type: "inspirations", itemType: "organization" },
      brands: { type: "children", childModel: "brand", foreignKey: "organizationId" },
    },
    uniqueArticleCheck: true,
  },

  brands: {
    model: "brand",
    labelSingular: "brand",
    labelPlural: "brands",
    orderBy: { name: "asc" },
    validation: {
      required: ["name"],
    },
    articleType: null,
    articleRelationField: "brand",
    include: {
      article: { select: { id: true, title: true } },
      organization: { select: { id: true, name: true } },
    },
    dateFields: ["dateFounded", "dateDiscontinued"],
    relations: {
      images: { type: "images", itemType: "brand" },
      inspirations: { type: "inspirations", itemType: "brand" },
      products: { type: "children", childModel: "product", foreignKey: "brandId" },
    },
    uniqueArticleCheck: true,
  },

  products: {
    model: "product",
    labelSingular: "product",
    labelPlural: "products",
    orderBy: { name: "asc" },
    validation: {
      required: ["name", "productType"],
    },
    articleType: null,
    articleRelationField: "product",
    include: {
      article: { select: { id: true, title: true } },
      brand: { select: { id: true, name: true } },
    },
    dateFields: ["dateIntroduced", "dateDiscontinued"],
    relations: {
      images: { type: "images", itemType: "product" },
      inspirations: { type: "inspirations", itemType: "product" },
    },
    uniqueArticleCheck: true,
  },

  nations: {
    model: "nation",
    labelSingular: "nation",
    labelPlural: "nations",
    orderBy: { name: "asc" },
    validation: {
      required: ["name"],
    },
    articleType: null,
    articleRelationField: "nation",
    include: {
      article: { select: { id: true, title: true } },
      _count: { select: { states: true } },
    },
    dateFields: ["dateFounded", "dateDissolved"],
    relations: {
      images: { type: "images", itemType: "nation" },
      inspirations: { type: "inspirations", itemType: "nation" },
      states: { type: "children", childModel: "state", foreignKey: "nationId" },
    },
    uniqueArticleCheck: true,
  },

  states: {
    model: "state",
    labelSingular: "state",
    labelPlural: "states",
    orderBy: { name: "asc" },
    validation: {
      required: ["name", "stateType", "nationId"],
    },
    articleType: null,
    articleRelationField: "state",
    include: {
      article: { select: { id: true, title: true } },
      nation: { select: { id: true, name: true } },
      _count: { select: { cities: true } },
    },
    dateFields: ["dateFounded", "dateDisbanded"],
    relations: {
      images: { type: "images", itemType: "state" },
      inspirations: { type: "inspirations", itemType: "state" },
      cities: { type: "children", childModel: "city", foreignKey: "stateId" },
    },
    uniqueArticleCheck: true,
  },

  cities: {
    model: "city",
    labelSingular: "city",
    labelPlural: "cities",
    orderBy: { name: "asc" },
    validation: {
      required: ["name", "cityType", "stateId"],
    },
    articleType: null,
    articleRelationField: "city",
    include: {
      article: { select: { id: true, title: true } },
      state: {
        select: {
          id: true,
          name: true,
          nation: { select: { id: true, name: true } },
        },
      },
      _count: { select: { places: true } },
    },
    dateFields: ["dateFounded", "dateDisbanded"],
    relations: {
      images: { type: "images", itemType: "city" },
      inspirations: { type: "inspirations", itemType: "city" },
      places: { type: "children", childModel: "place", foreignKey: "cityId" },
    },
    uniqueArticleCheck: true,
  },

  places: {
    model: "place",
    labelSingular: "place",
    labelPlural: "places",
    orderBy: { name: "asc" },
    validation: {
      required: ["name", "placeType", "cityId"],
    },
    articleType: null,
    articleRelationField: "place",
    include: {
      article: { select: { id: true, title: true } },
      city: {
        select: {
          id: true,
          name: true,
          state: {
            select: {
              id: true,
              name: true,
              nation: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
    dateFields: ["dateOpened", "dateClosed"],
    relations: {
      images: { type: "images", itemType: "place" },
      inspirations: { type: "inspirations", itemType: "place" },
    },
    uniqueArticleCheck: true,
  },

  events: {
    model: "event",
    labelSingular: "event",
    labelPlural: "events",
    orderBy: { kyDateBegin: "desc" },
    validation: {
      required: ["title", "kyDateBegin", "eventType"],
    },
    articleType: null,
    articleRelationField: null, // events don't have article links
    include: {
      parent: { select: { id: true, title: true } },
      _count: { select: { children: true, people: true, locations: true } },
    },
    dateFields: ["kyDateBegin", "kyDateEnd"],
    filters: ["eventType", "parentId"],
    relations: {
      people: { type: "custom" },
      locations: { type: "custom" },
      media: { type: "custom" },
      relations: { type: "custom" },
    },
    uniqueArticleCheck: false,
  },

  albums: {
    model: "album",
    labelSingular: "album",
    labelPlural: "albums",
    orderBy: { name: "asc" },
    validation: {
      required: ["name"],
    },
    articleType: null,
    articleRelationField: "album",
    include: {
      article: { select: { id: true, title: true } },
      artist: { select: { id: true, firstName: true, lastName: true, stageName: true } },
      label: { select: { id: true, name: true } },
    },
    dateFields: ["kyDate"],
    relations: {
      tracks: { type: "custom" }, // AudioElement join table
    },
    uniqueArticleCheck: true,
  },
}

// Helper to get config or throw
export function getEntityConfig(entity: string): EntityConfig {
  const config = entityConfig[entity as EntityKey]
  if (!config) {
    throw new Error(`Unknown entity: ${entity}`)
  }
  return config
}

// Validate entity key
export function isValidEntity(entity: string): entity is EntityKey {
  return entity in entityConfig
}

// Validate relation for an entity
export function isValidRelation(entity: EntityKey, relation: string): boolean {
  const config = entityConfig[entity]
  return relation in config.relations
}
