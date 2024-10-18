import React, { useState } from "react";
import axios from "axios";

const TaskForm = ({ fetchTasks }) => {
  // Accept fetchTasks as a prop
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("low");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .post("http://localhost:5000/tasks", {
        title,
        description,
        priority,
        due_date: dueDate,
      })
      .then(() => {
        fetchTasks(); // Refresh tasks after adding a new task
        setTitle("");
        setDescription("");
        setPriority("low");
        setDueDate("");
      })
      .catch((error) => console.error("Error creating task:", error));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create a Task</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <button type="submit">Add Task</button>
    </form>
  );
};

export default TaskForm;
