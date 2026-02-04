const express = require("express");
const app = express();

const morgan = require("morgan");
morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});

app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body"),
); // Logs https requests to console

// List of users
let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

// Get test
app.get("/", (req, res) => {
  res.send("hello");
});

// Get list of persons
app.get("/api/persons", (req, res) => {
  res.json(persons);
});

// Get information about how many people are in the list, and when was the request made
app.get("/info", (req, res) => {
  const numOfPeople = persons.length;
  const timeReceived = new Date();
  res.send(`
    <p>Phonebook has info for ${numOfPeople}</p>
    <p>${timeReceived}</p>
    `);
});

// Fetch single user and display it based on the request
const selectedUser = (id) => {
  return persons.find((person) => person.id === id);
};

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const person = selectedUser(id);
  if (person) {
    res.send(person);
  } else {
    res.status(404).end();
  }
});

// Delete a user
app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const oldLength = persons.length;

  persons = persons.filter((person) => person.id !== id);

  if (persons.length < oldLength) {
    res.status(204).end();
  } else {
    res.status(404).end();
    console.log("User was already deleted");
  }
});

// Add a user
const generatedId = () => {
  return Math.floor(Math.random() * 1000000).toString();
};

app.post("/api/persons", (req, res) => {
  const body = req.body;

  // Missing name or number
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "Name or number is missing",
    });
  }

  // Already existing name
  const nameExists = persons.some((person) => person.name === body.name);
  if (nameExists) {
    return res.status(400).json({
      error: "Name already exists",
    });
  }

  // If all previous conditions are satisfied, create a new person
  const newPerson = {
    id: generatedId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(newPerson);
  res.json(newPerson);
});

// Listen to server requests
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Listening on localhost:${PORT}`);
});
