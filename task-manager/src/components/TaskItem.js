import React from "react";
import axios from "axios";

const TaskItem = ({ task, fetchTasks }) => {
  const handleDelete = () => {
    axios
      .delete(`http://localhost:5000/tasks/${task.id}`)
      .then(() => {
        fetchTasks();
      })
      .catch((error) => console.error("Error deleting task:", error));
  };

  const handleComplete = () => {
    axios
      .put(`http://localhost:5000/tasks/${task.id}`, {
        ...task,
        completed: !task.completed,
      })
      .then(() => {
        fetchTasks();
      })
      .catch((error) => console.error("Error updating task:", error));
  };

  return (
    <div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <p>Priority: {task.priority}</p>
      <p>Due Date: {task.due_date}</p>
      <p>Completed: {task.completed ? "Yes" : "No"}</p>
      <button onClick={handleComplete}>
        {task.completed ? "Mark as Incomplete" : "Mark as Completed"}
      </button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default TaskItem;
