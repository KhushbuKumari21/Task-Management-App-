import { useEffect, useState } from "react";
import API from "../utils/api";
import Layout from "../components/Layout";
import TaskItem, { Task } from "../components/TaskItem";
import { toast } from "react-toastify";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "pending"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  /* ============================= */
  /* Debounced Search */
  /* ============================= */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  /* ============================= */
  /* Fetch Tasks */
  /* ============================= */
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await API.get(
        `/tasks?page=${page}&pageSize=${pageSize}&status=${statusFilter}&search=${search}`
      );
      setTasks(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch {
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, pageSize, statusFilter, search]);

  /* ============================= */
  /* Handlers */
  /* ============================= */
  const handleAdd = async () => {
    if (!title.trim()) return;
    try {
      await API.post("/tasks", { title });
      setTitle("");
      fetchTasks();
      toast.success("Task added");
    } catch {
      toast.error("Failed to add task");
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await API.patch(`/tasks/${id}/toggle`);
      fetchTasks();
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTitle("");
  };

  const saveEditing = async (id: number) => {
    if (!editingTitle.trim()) return;
    try {
      await API.put(`/tasks/${id}`, { title: editingTitle });
      setEditingTaskId(null);
      setEditingTitle("");
      fetchTasks();
      toast.success("Task updated");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleLogout = () => {
    if (!confirm("Are you sure you want to logout?")) return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/";
  };

  /* ============================= */
  /* UI */
  /* ============================= */
  return (
    <Layout>
      {/* Title */}
      <h1 className="title">Dashboard</h1>

      {/* Add Task */}
      <div className="task-add">
        <input
          placeholder="New task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button onClick={handleAdd} disabled={!title.trim() || loading}>
          Add
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <input
          placeholder="Search tasks"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>

        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="spinner"></div>
      ) : tasks.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "20px" }}>No tasks found</p>
      ) : (
        tasks.map((task) =>
          editingTaskId === task.id ? (
            <div key={task.id} className="task-edit">
              <input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
              />
              <button className="save-btn" onClick={() => saveEditing(task.id)}>
                Save
              </button>
              <button className="cancel-btn" onClick={cancelEditing}>
                Cancel
              </button>
            </div>
          ) : (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onDelete={handleDelete}
            >
              <button className="btn-edit" onClick={() => startEditing(task)}>
                Edit
              </button>
            </TaskItem>
          )
        )
      )}

      {/* Pagination */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      {/* Logout – Bottom */}
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </Layout>
  );
}
