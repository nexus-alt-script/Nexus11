const express = require('express');
const app = express();
const login = require('fca-unofficial');
const fs = require('fs/promises'); // Using promises for non-blocking file operations

let api; // Variable for API instance

// Asynchronously load the database and worldchat JSON files at startup
let database, worldchat;

async function loadFiles() {
  try {
    database = JSON.parse(await fs.readFile("./db/db/db.json", 'utf8'));
    worldchat = JSON.parse(await fs.readFile('./worldchat.json', 'utf8'));
  } catch (err) {
    console.error("Error loading files:", err);
    process.exit(1); // Exit if files can't be loaded
  }
}

// Function to initialize the API and set up listeners
async function initializeApi() {
  try {
    const appState = JSON.parse(await fs.readFile('appstate.json', 'utf8'));
    login({ appState }, (err, fbApi) => {
      if (err) {
        console.error(err);
        process.exit(1); // Exit if login fails
      }
      api = fbApi;
      api.listenMqtt((err, event) => {
        if (err) {
          console.error(err);
          return;
        }
        if (event.isGroup) {
          if (event.body === "/getID") {
            api.sendMessage("Hello User!,\nYour ID is: " + event.senderID, (err) => {
              if (err) console.error(err);
            });
          }
        } else {
          api.sendMessage("Hello User!,\nThis bot is only made for groups.", event.messageID, (err) => {
            if (err) console.error(err);
          });
        }
      });
    });
  } catch (err) {
    console.error("Error initializing API:", err);
    process.exit(1); // Exit if API initialization fails
  }
}

app.get('/nexus', (req, res) => {
  const path = req.query.path;
  if (!path) return res.send("Invalid Parameter.");
  if (path === "verification") {
    res.redirect('/verify');
  } else if (path === "script") {
    res.redirect("/script");
  }
});

app.get('/verify', async (req, res) => {
  const { deviceID, code, name, id } = req.query;
  if (!deviceID || !code || !name || !id) return res.send("Invalid Parameters.");

  const messageBody = `Hello ${name}!,\nYour verification code is ${code}.\n\nThank you for using our script.\n-Nexus Team`;
  const body = {
    dev: deviceID,
    name: name,
    uid: id
  };

  api.sendMessage(messageBody, id, (err) => {
    if (err) {
      console.error("Error sending verification message:", err);
      return res.status(500).send("An error occurred during verification.");
    }
    database.push(body);
    fs.writeFile("./db/db/db.json", JSON.stringify(database))
      .then(() => res.send("Verification message sent successfully."))
      .catch((err) => {
        console.error("Error writing to database:", err);
        res.status(500).send("An error occurred during verification.");
      });
  });
});
app.get('/', (req, res) => {
  res.send("Nexus powered by: Hexa")
})
app.get('/worldchat', (req, res) => {
  const show = req.query.show === "true";
  if (show) {
    res.send(worldchat);
  } else {
    const { name, message } = req.query;
    if (!name || !message) return res.send("Invalid Parameters.");

    const body = {
      name: name,
      message: message
    };
    worldchat.push(body);
    fs.writeFile('./worldchat.json', JSON.stringify(worldchat))
      .then(() => res.send("Message posted to worldchat."))
      .catch((err) => {
        console.error("Error writing to worldchat file:", err);
        res.status(500).send("An error occurred while posting to worldchat.");
      });
  }
});
app.get('/scriptWorld', (req, res) => {
  try {
    res.sendFile('./worldchat.lua');
  } catch (err) {
    console.error("Error sending Lua file:", err);
    res.status(500).send("An error occurred while sending the Lua file.");
  }
});
// Start the server only after loading files and initializing the API
(async () => {
  try {
    await loadFiles();
    await initializeApi();
    app.listen(5000, () => {
      console.log('Server is running on port 5000');
    });
  } catch (err) {
    console.error("Error during startup:", err);
    process.exit(1); // Exit if initialization fails
  }
})();
