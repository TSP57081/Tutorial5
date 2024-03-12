const express = require("express");

const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
const fileSystem = require("fs");

let users = [];
try {
  // Getting the json file
  const userData = fileSystem.readFileSync("./users.json");
  // Parsing the json file
  users = JSON.parse(userData);
} catch (err) {
  // Log the error received
  console.error("JSON Parsing error:", err);
}

function validateEmail(email) {
  const userIndex = users.findIndex((user) => user.email === email);
  // Making sure it does not exist already
  if (userIndex !== -1) {
    return false;
  }

  // Making sure it is not null
  console.log(email);
  if (!email) {
    return false;
  }

  // Making sure it is of format a@b.c
  if (email.length < 5) {
    return false;
  }

  // Making sure it has an @ as well as it is not at the beginning
  const atIndex = email.indexOf("@");
  if (atIndex === -1 && atIndex == 0) {
    return false;
  }

  // Making sure it has a . as well as it does not occur right after the @
  const dotIndex = email.indexOf(".");
  if (dotIndex === -1 || dotIndex === atIndex + 1) {
    return false;
  }

  // Making sure that the dot is not at the end
  if (dotIndex === email.length - 1) {
    return false;
  }

  return true;
}

function validateName(name) {
  // Iterating the characters of the name
  for (let i = 0; i < name.length; i++) {
    // Checking if the characters are actually just alphabets
    if (
      (name[i].charCodeAt(0) <= 64 && name[i].charCodeAt(0) >= 91) ||
      (name[i].charCodeAt(0) <= 96 && name[i].charCodeAt(0) >= 123)
    ) {
      return false;
    }
  }
  return true;
}

// Storing the users array in the json file
function saveUsers() {
  fileSystem.writeFileSync("./users.json", JSON.stringify(users, null, 2));
}

// GET API
app.get("/users", (req, res) => {
  if (!users) {
    // Send 500 response if database does not exist
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  } else {
    res.status(200).json({
      message: "Users retrieved",
      success: true,
      users: users,
    });
  }
});

// POST API
app.post("/add", (req, res) => {
  let newUser = req.body;
  if (!validateEmail(newUser["email"])) {
    // Set 400 status code for invalid input
    res.status(400).json({
      message: "User NOT added.",
      reason: "Invalid / Existing Email",
      success: false,
    });
    return;
  }
  if (!validateName(newUser["firstName"])) {
    // Set 400 status code for invalid input
    res.status(400).json({
      message: "User NOT added.",
      reason: "Invalid Name",
      success: false,
    });
    return;
  }

  if (!users) {
    // Send 500 response if database does not exist
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  } else {
    newUser.id = Date.now().toString();
    users.push(newUser);
    saveUsers();
    res.status(200).json({
      message: "User added",
      success: true,
    });
  }
});

// PUT API
app.put("/update/:id", (req, res) => {
  const userId = req.params.id;
  if (!users) {
    // Send 500 response if database does not exist
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  } else {
    const userData = req.body;
    if (!validateEmail(userData["email"])) {
      // Set 400 status code for invalid input
      res.status(400).json({
        message: "User NOT added.",
        reason: "Invalid / Existing Email",
        success: false,
      });
      return;
    }
    if (!validateName(userData["firstName"])) {
      // Set 400 status code for invalid input
      res.status(400).json({
        message: "User NOT added.",
        reason: "Invalid Name",
        success: false,
      });
      return;
    }

    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...userData };
      saveUsers();
      res.status(200).json({
        message: "User updated",
        success: true,
      });
    } else {
      // Set 404 status code for value not found
      res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
  }
});

// GET ID API
app.get("/user/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  if (!users) {
    // Send 500 response if database does not exist
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  } else {
    const user = users.find((user) => user.id === userId);
    console.log;
    if (user) {
      res.status(200).json({
        success: true,
        user: user,
      });
    } else {
      // Set 404 status code for value not found
      res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
  }
});

module.exports = app;
