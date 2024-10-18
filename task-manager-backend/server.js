const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const session = require("express-session");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(
  session({
    // @ts-ignore
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

// User authentication (passport local strategy)
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      const user = result.rows[0];

      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return done(null, false, { message: "Incorrect password." });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  // @ts-ignore
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = result.rows[0];
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Middleware to check if the user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "You need to log in first." });
};

// Register new user
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
      [username, email, hashedPassword]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login user
// @ts-ignore
app.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({ message: "Logged in successfully" });
});

// Logout user
app.post("/logout", (req, res) => {
  // @ts-ignore
  req.logout();
  res.json({ message: "Logged out successfully" });
});

// GET all tasks (protected route)
app.get("/tasks", ensureAuthenticated, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks WHERE user_id = $1", [
      // @ts-ignore
      req.user.id,
    ]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// POST create a task
app.post("/tasks", ensureAuthenticated, async (req, res) => {
  try {
    const { title, description, priority, due_date } = req.body;
    const newTask = await pool.query(
      "INSERT INTO tasks (title, description, priority, due_date, user_id) VALUES($1, $2, $3, $4, $5) RETURNING *",
      // @ts-ignore
      [title, description, priority, due_date, req.user.id]
    );
    res.json(newTask.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// PUT update a task
app.put("/tasks/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, due_date, completed } = req.body;
    const updatedTask = await pool.query(
      "UPDATE tasks SET title = $1, description = $2, priority = $3, due_date = $4, completed = $5 WHERE id = $6 AND user_id = $7 RETURNING *",
      // @ts-ignore
      [title, description, priority, due_date, completed, id, req.user.id]
    );
    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// DELETE a task
app.delete("/tasks/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2", [
      id,
      // @ts-ignore
      req.user.id,
    ]);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err.message);
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
