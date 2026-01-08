import { Response } from "express";
import { prisma } from "../prisma"; // Prisma client to interact with DB
import { AuthRequest } from "../middleware/auth.middleware"; // Custom request type with userId
import { createTaskSchema } from "./validators/task.schema"; // Zod schema to validate task creation

// Define TypeScript interface for a Task
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

/* ===================== GET /tasks ===================== */
export const getTasks = async (req: AuthRequest, res: Response) => {
  // Extract query parameters for pagination, filtering, and search
  const { page = 1, pageSize = 5, status, search = "" } = req.query;
  const currentPage = Number(page);
  const currentPageSize = Math.min(Number(pageSize), 50); // Max page size 50

  // Build the query condition based on user and filters
  const whereCondition: any = { userId: req.userId! };
  if (status === "completed") whereCondition.completed = true;
  if (status === "pending") whereCondition.completed = false;
  if (search) whereCondition.title = { contains: search as string };

  try {
    // Count total tasks for pagination
    const totalTasks = await prisma.task.count({ where: whereCondition });

    // Fetch tasks with pagination
    const tasks: Task[] = await prisma.task.findMany({
      where: whereCondition,
      skip: (currentPage - 1) * currentPageSize,
      take: currentPageSize,
      orderBy: { createdAt: "desc" }, // Latest tasks first
    });

    // Send response with tasks and meta info
    res.json({
      meta: {
        totalTasks,
        currentPage,
        pageSize: currentPageSize,
        totalPages: Math.ceil(totalTasks / currentPageSize),
      },
      data: tasks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

/* ===================== POST /tasks ===================== */
export const createTask = async (req: AuthRequest, res: Response) => {
  // Validate input with Zod schema
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    const firstError =
      Object.values(parsed.error.flatten().fieldErrors)
        .flat()
        .filter(Boolean)[0] || "Invalid input";
    return res.status(400).json({ message: firstError });
  }

  try {
    // Create new task linked to authenticated user
    const task = await prisma.task.create({
      data: { title: parsed.data.title, userId: req.userId! },
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create task" });
  }
};

/* ===================== PUT /tasks/:id ===================== */
export const updateTask = async (req: AuthRequest, res: Response) => {
  const { title } = req.body; // New title
  const taskId = Number(req.params.id);

  try {
    // Check if task exists and belongs to user
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.userId !== req.userId)
      return res.status(404).json({ message: "Task not found" });

    // Update task title
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { title },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update task" });
  }
};

/* ===================== PATCH /tasks/:id/toggle ===================== */
export const toggleTask = async (req: AuthRequest, res: Response) => {
  const taskId = Number(req.params.id);

  try {
    // Find task
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.userId !== req.userId)
      return res.status(404).json({ message: "Task not found" });

    // Toggle completion status
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { completed: !task.completed },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle task" });
  }
};

/* ===================== DELETE /tasks/:id ===================== */
export const deleteTask = async (req: AuthRequest, res: Response) => {
  const taskId = Number(req.params.id);

  try {
    // Find task
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.userId !== req.userId)
      return res.status(404).json({ message: "Task not found" });

    // Delete task
    await prisma.task.delete({ where: { id: taskId } });

    res.sendStatus(204); // No content
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete task" });
  }
};
