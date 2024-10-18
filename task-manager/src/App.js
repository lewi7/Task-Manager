import React, { useState } from "react";
import TaskList from "./components/TaskList";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div>
      <TaskList
        setIsAuthenticated={setIsAuthenticated}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export default App;
