import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/events/browse?parentId=xxx
 *
 * Returns hierarchy data for the Event Hierarchy browser.
 * - If no parentId: returns top-level parents + unclassified count
 * - If parentId provided: returns that event's children (sub-groups and leaf events)
 */
export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get("parentId")

    // Special case: unclassified events
    if (parentId === "unclassified") {
      const unclassifiedEvents = await prisma.event.findMany({
        where: {
          parentId: null,
          children: { none: {} },
        },
        select: {
          id: true,
          title: true,
          eventType: true,
          kyDateBegin: true,
          significance: true,
        },
        orderBy: { kyDateBegin: "asc" },
      })

      return NextResponse.json({
        parentId: "unclassified",
        parentTitle: "Unclassified",
        breadcrumbs: [{ id: "unclassified", title: "Unclassified" }],
        groups: [],
        events: unclassifiedEvents,
        unclassifiedCount: 0,
      })
    }

    if (!parentId) {
      // Top level: get all events with no parent that have children (parent groups)
      const parentGroups = await prisma.event.findMany({
        where: {
          parentId: null,
          children: { some: {} },
        },
        select: {
          id: true,
          title: true,
          eventType: true,
          kyDateBegin: true,
          kyDateEnd: true,
          _count: {
            select: { children: true },
          },
        },
        orderBy: { title: "asc" },
      })

      // Count total descendants and sub-groups for each parent group
      const groupsWithTotals = await Promise.all(
        parentGroups.map(async (group) => {
          const totalDescendants = await countDescendants(group.id)
          const subGroupCount = await countSubGroups(group.id)
          return {
            ...group,
            subGroupCount,
            totalEventCount: totalDescendants,
          }
        })
      )

      // Count unclassified (no parent, no children)
      const unclassifiedCount = await prisma.event.count({
        where: {
          parentId: null,
          children: { none: {} },
        },
      })

      return NextResponse.json({
        parentId: null,
        parentTitle: null,
        breadcrumbs: [],
        groups: groupsWithTotals,
        events: [],
        unclassifiedCount,
      })
    }

    // Get the current parent event
    const parentEvent = await prisma.event.findUnique({
      where: { id: parentId },
      select: {
        id: true,
        title: true,
        parentId: true,
      },
    })

    if (!parentEvent) {
      return NextResponse.json({ error: "Parent event not found" }, { status: 404 })
    }

    // Build breadcrumbs by traversing up
    const breadcrumbs: { id: string; title: string }[] = []
    let current = parentEvent
    while (current) {
      breadcrumbs.unshift({ id: current.id, title: current.title })
      if (current.parentId) {
        const parent = await prisma.event.findUnique({
          where: { id: current.parentId },
          select: { id: true, title: true, parentId: true },
        })
        current = parent as typeof current
      } else {
        break
      }
    }

    // Get children that have their own children (sub-groups)
    const childGroups = await prisma.event.findMany({
      where: {
        parentId: parentId,
        children: { some: {} },
      },
      select: {
        id: true,
        title: true,
        eventType: true,
        kyDateBegin: true,
        kyDateEnd: true,
        _count: {
          select: { children: true },
        },
      },
      orderBy: { title: "asc" },
    })

    const groupsWithTotals = await Promise.all(
      childGroups.map(async (group) => {
        const totalDescendants = await countDescendants(group.id)
        const subGroupCount = await countSubGroups(group.id)
        return {
          ...group,
          subGroupCount,
          totalEventCount: totalDescendants,
        }
      })
    )

    // Get children that are leaf events (no children of their own)
    const leafEvents = await prisma.event.findMany({
      where: {
        parentId: parentId,
        children: { none: {} },
      },
      select: {
        id: true,
        title: true,
        eventType: true,
        kyDateBegin: true,
        significance: true,
      },
      orderBy: { kyDateBegin: "asc" },
    })

    return NextResponse.json({
      parentId: parentEvent.id,
      parentTitle: parentEvent.title,
      breadcrumbs,
      groups: groupsWithTotals,
      events: leafEvents,
      unclassifiedCount: 0,
    })
  } catch (error) {
    console.error("Failed to browse events:", error)
    return NextResponse.json({ error: "Failed to browse events" }, { status: 500 })
  }
}

/**
 * Recursively count all descendants of an event
 */
async function countDescendants(eventId: string): Promise<number> {
  const children = await prisma.event.findMany({
    where: { parentId: eventId },
    select: { id: true },
  })

  let count = children.length

  for (const child of children) {
    count += await countDescendants(child.id)
  }

  return count
}

/**
 * Count direct children that are themselves parents (sub-groups)
 */
async function countSubGroups(eventId: string): Promise<number> {
  const subGroups = await prisma.event.count({
    where: {
      parentId: eventId,
      children: { some: {} },
    },
  })
  return subGroups
}
