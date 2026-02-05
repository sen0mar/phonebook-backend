require("dotenv").config();
const express = require("express");
const app = express();
// Database
const Person = require("./models/person");
// Morgan
const morgan = require("morgan");
morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});

app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body"),
); // Logs https requests to console

app.use(express.static("dist")); // Make express show static content (for linking front with back end)

// Get test
app.get("/", (req, res) => {
  res.send("hello");
});

// Get list of persons
app.get("/api/persons", (req, res) => {
  Person.find({}).then((people) => {
    res.json(people);
  });
});

// Get information about how many people are in the list, and when was the request made
app.get("/info", (req, res) => {
  Person.countDocuments({}).then((count) => {
    res.send(`
      <p>Phonebook has info for ${count} people</p>
      <p>${new Date()}</p>
    `);
  });
});

// Fetch single user and display it based on the request
app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// Delete a user
app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

// Add a user
app.post("/api/persons", (req, res) => {
  const { name, number } = req.body;

  // Missing name or number
  if (!name || !number) {
    return res.status(400).json({
      error: "Name or number is missing",
    });
  }

  const person = new Person({ name, number });

  person.save().then((savedPerson) => {
    res.json(savedPerson);
  });
});

// Update a user
app.put("/api/persons/:id", (req, res, next) => {
  const { name, number } = req.body;

  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" },
  )
    .then((updatedPerson) => res.json(updatedPerson))
    .catch((error) => next(error));
});

// Handler of requests with unknown endpoint
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

// Error handler middleware
const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "Malformed id" });
  }
  if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  if (error.name === "MongoServerError" && error.code === 11000) {
    return response.status(400).json({ error: "name must be unique" });
  }

  next(error);
};
app.use(errorHandler);

// Listen to server requests
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listening on localhost:${PORT}`);
});
