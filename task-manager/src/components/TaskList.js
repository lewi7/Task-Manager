import React, { useState, useEffect } from "react";
import axios from "axios";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";

const TaskList = ({ setIsAuthenticated, isAuthenticated }) => {
  const [tasks, setTasks] = useState([]);
  const [showLogin, setShowLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Fetch tasks from the backend
  const fetchTasks = () => {
    axios
      .get("http://localhost:5000/tasks")
      .then((response) => setTasks(response.data))
      .catch((error) => console.error("Error fetching tasks:", error));
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Register user
  const handleRegister = () => {
    axios
      .post("http://localhost:5000/register", formData)
      .then((response) => {
        console.log("User registered:", response.data);
        handleLogin();
      })
      .catch((error) => console.error("Error registering user:", error));
  };

  // Login user
  const handleLogin = () => {
    axios
      .post("http://localhost:5000/login", formData)
      .then((response) => {
        console.log("User logged in:", response.data);
        setIsAuthenticated(true);
      })
      .catch((error) => console.error("Error logging in user:", error));
  };

  // Toggle between login and registration forms
  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div>
      {!isAuthenticated ? (
        <div>
          <h2>{showLogin ? "Login" : "Register"}</h2>
          <form>
            {!showLogin && (
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            )}
            <div>
              <label>Username:</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <button
              type="button"
              onClick={showLogin ? handleLogin : handleRegister}
            >
              {showLogin ? "Login" : "Register"}
            </button>
            <p onClick={toggleForm}>
              {showLogin
                ? "Don't have an account? Register"
                : "Already have an account? Login"}
            </p>
          </form>
        </div>
      ) : (
        <div>
          <h2>Your Tasks</h2>
          <TaskForm fetchTasks={fetchTasks} />
          {tasks.map((task) => (
            // @ts-ignore
            <TaskItem key={task.id} task={task} fetchTasks={fetchTasks} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
