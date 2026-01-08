import { FC, ReactNode } from "react";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

type Props = {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  children?: ReactNode;
};

const TaskItem: FC<Props> = ({ task, onToggle, onDelete, children }) => {
  return (
    <div className="task-item">
      <div
        className={task.completed ? "completed" : ""}
        onClick={() => onToggle(task.id)}
      >
        {task.title}
      </div>
      <div className="task-buttons">
        {children}
        <button className="delete-btn" onClick={() => onDelete(task.id)}>Delete</button>
      </div>
    </div>
  );
};

export default TaskItem;
