import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all backlog projects and items
export async function GET() {
  try {
    // Get projects with their items
    const projects = await prisma.backlogProject.findMany({
      where: { status: { not: 'archived' } },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Get unassigned items
    const unassigned = await prisma.backlog.findMany({
      where: { projectId: null },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ projects, unassigned });
  } catch (error) {
    console.error('Failed to fetch backlog:', error);
    return NextResponse.json({ error: 'Failed to fetch backlog' }, { status: 500 });
  }
}

// POST - Create new backlog item or project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'project') {
      const { name, description } = body;
      if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }

      const project = await prisma.backlogProject.create({
        data: {
          name,
          description,
          status: 'active',
        },
      });

      return NextResponse.json(project);
    } else {
      // Create item
      const { title, context, priority, effort, tags, projectId, sortOrder } = body;

      if (!title) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
      }

      const item = await prisma.backlog.create({
        data: {
          title,
          context,
          priority: priority || 'medium',
          effort,
          tags,
          projectId,
          sortOrder: sortOrder || 0,
          status: 'pending',
        },
      });

      return NextResponse.json(item);
    }
  } catch (error) {
    console.error('Failed to create backlog item:', error);
    return NextResponse.json({ error: 'Failed to create backlog item' }, { status: 500 });
  }
}

// PATCH - Update backlog item or project
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, status, title, context, priority, effort, tags, sortOrder, projectId, name, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (type === 'project') {
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
      if (status !== undefined) {
        updateData.status = status;
        if (status === 'completed') updateData.completedAt = new Date();
      }

      const project = await prisma.backlogProject.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json(project);
    } else {
      const updateData: Record<string, unknown> = {};

      if (status !== undefined) {
        updateData.status = status;
        if (status === 'in_progress' && !body.startedAt) {
          updateData.startedAt = new Date();
        }
        if (status === 'completed' && !body.completedAt) {
          updateData.completedAt = new Date();
        }
        if (status === 'pending') {
          updateData.startedAt = null;
          updateData.completedAt = null;
        }
      }
      if (title !== undefined) updateData.title = title;
      if (context !== undefined) updateData.context = context;
      if (priority !== undefined) updateData.priority = priority;
      if (effort !== undefined) updateData.effort = effort;
      if (tags !== undefined) updateData.tags = tags;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
      if (projectId !== undefined) updateData.projectId = projectId;

      const item = await prisma.backlog.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json(item);
    }
  } catch (error) {
    console.error('Failed to update backlog item:', error);
    return NextResponse.json({ error: 'Failed to update backlog item' }, { status: 500 });
  }
}

// PUT - Reorder projects or tasks
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectOrder, taskOrder, projectId } = body;

    // Reorder projects
    if (projectOrder && Array.isArray(projectOrder)) {
      await Promise.all(
        projectOrder.map((id: string, index: number) =>
          prisma.backlogProject.update({
            where: { id },
            data: { sortOrder: index },
          })
        )
      );
      return NextResponse.json({ success: true });
    }

    // Reorder tasks within a project
    if (taskOrder && Array.isArray(taskOrder) && projectId) {
      await Promise.all(
        taskOrder.map((id: string, index: number) =>
          prisma.backlog.update({
            where: { id },
            data: { sortOrder: index },
          })
        )
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'projectOrder or (taskOrder + projectId) required' }, { status: 400 });
  } catch (error) {
    console.error('Failed to reorder:', error);
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}

// DELETE - Delete backlog item or project
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (type === 'project') {
      // First unlink all items
      await prisma.backlog.updateMany({
        where: { projectId: id },
        data: { projectId: null },
      });

      await prisma.backlogProject.delete({
        where: { id },
      });
    } else {
      await prisma.backlog.delete({
        where: { id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete backlog item:', error);
    return NextResponse.json({ error: 'Failed to delete backlog item' }, { status: 500 });
  }
}
