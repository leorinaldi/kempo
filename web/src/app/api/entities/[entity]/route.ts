import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getEntityConfig, isValidEntity, EntityConfig } from "../config"

type RouteParams = { params: Promise<{ entity: string }> }

// GET: List all entities
export async function GET(request: Request, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { entity } = await params
    if (!isValidEntity(entity)) {
      return NextResponse.json({ error: `Unknown entity: ${entity}` }, { status: 400 })
    }

    const config = getEntityConfig(entity)
    const { searchParams } = new URL(request.url)

    // Build where clause from supported filters
    const where: Record<string, unknown> = {}
    if (config.filters) {
      for (const filter of config.filters) {
        const value = searchParams.get(filter)
        if (value) {
          where[filter] = value
        }
      }
    }

    // @ts-expect-error - dynamic model access
    const items = await prisma[config.model].findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: config.include,
      orderBy: config.orderBy,
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("Failed to list entities:", error)
    return NextResponse.json({ error: "Failed to list entities" }, { status: 500 })
  }
}

// POST: Create new entity
export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { entity } = await params
    if (!isValidEntity(entity)) {
      return NextResponse.json({ error: `Unknown entity: ${entity}` }, { status: 400 })
    }

    const config = getEntityConfig(entity)
    const body = await request.json()

    // Validate required fields
    const validationError = validateRequired(body, config)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    // Validate enum fields
    const enumError = validateEnums(body, config)
    if (enumError) {
      return NextResponse.json({ error: enumError }, { status: 400 })
    }

    // Check for duplicate article link if applicable
    if (config.uniqueArticleCheck && body.articleId) {
      const duplicateError = await checkDuplicateArticle(body.articleId, config, null)
      if (duplicateError) {
        return NextResponse.json({ error: duplicateError }, { status: 400 })
      }
    }

    // Prepare data with date conversions
    const data = prepareData(body, config)

    // @ts-expect-error - dynamic model access
    const item = await prisma[config.model].create({ data })

    return NextResponse.json(item)
  } catch (error) {
    console.error("Failed to create entity:", error)
    return NextResponse.json({ error: "Failed to create entity" }, { status: 500 })
  }
}

// PUT: Update existing entity
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { entity } = await params
    if (!isValidEntity(entity)) {
      return NextResponse.json({ error: `Unknown entity: ${entity}` }, { status: 400 })
    }

    const config = getEntityConfig(entity)
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: `${config.labelSingular} ID is required` }, { status: 400 })
    }

    // Validate required fields
    const validationError = validateRequired(updateData, config)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    // Validate enum fields
    const enumError = validateEnums(updateData, config)
    if (enumError) {
      return NextResponse.json({ error: enumError }, { status: 400 })
    }

    // Check for duplicate article link if applicable (excluding current record)
    if (config.uniqueArticleCheck && updateData.articleId) {
      const duplicateError = await checkDuplicateArticle(updateData.articleId, config, id)
      if (duplicateError) {
        return NextResponse.json({ error: duplicateError }, { status: 400 })
      }
    }

    // Prepare data with date conversions
    const data = prepareData(updateData, config)

    // @ts-expect-error - dynamic model access
    const item = await prisma[config.model].update({
      where: { id },
      data,
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error("Failed to update entity:", error)
    return NextResponse.json({ error: "Failed to update entity" }, { status: 500 })
  }
}

// Helper: Validate required fields
function validateRequired(data: Record<string, unknown>, config: EntityConfig): string | null {
  const required = config.validation.required || []
  for (const field of required) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      // Convert camelCase to readable format
      const readableField = field.replace(/([A-Z])/g, " $1").toLowerCase()
      return `${readableField.charAt(0).toUpperCase() + readableField.slice(1)} is required`
    }
  }
  return null
}

// Helper: Validate enum fields
function validateEnums(data: Record<string, unknown>, config: EntityConfig): string | null {
  const enums = config.validation.enum || {}
  for (const [field, allowedValues] of Object.entries(enums)) {
    if (data[field] !== undefined && !allowedValues.includes(data[field] as string)) {
      return `${field} must be one of: ${allowedValues.join(", ")}`
    }
  }
  return null
}

// Helper: Check for duplicate article link
async function checkDuplicateArticle(
  articleId: string,
  config: EntityConfig,
  excludeId: string | null
): Promise<string | null> {
  // @ts-expect-error - dynamic model access
  const existing = await prisma[config.model].findFirst({
    where: {
      articleId,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  })

  if (existing) {
    return `This article is already linked to another ${config.labelSingular}`
  }
  return null
}

// Helper: Prepare data with date conversions and null handling
function prepareData(body: Record<string, unknown>, config: EntityConfig): Record<string, unknown> {
  const data: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(body)) {
    if (config.dateFields.includes(key)) {
      // Convert date strings to Date objects, or null
      data[key] = value ? new Date(value as string) : null
    } else if (value === "" || value === undefined) {
      // Convert empty strings to null
      data[key] = null
    } else {
      data[key] = value
    }
  }

  return data
}
