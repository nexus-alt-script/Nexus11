const express = require('express');
const app = express();
const login = require('fca-unofficial');
const fs = require('fs');

let api; // Variable for API instance
const database = JSON.parse(fs.readFileSync("./db/db/db.json", 'utf8'));
const worldchat = JSON.parse(fs.readFileSync('./worldchat.json', 'utf8'));

login({ appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8')) }, (err, fbApi) => {
  if (err) {
    console.error(err);
    return;
  }
  api = fbApi;
  api.listenMqtt((err, event) => {
    if (err) {
      console.error(err);
      return;
    }
    if (event.isGroup) {
      if (event.body === "/getID") {
        api.sendMessage("Hello User!,\nYour ID is: " + event.senderID);
      }
    } else {
      api.sendMessage("Hello User!,\nThis bot is only made for groups.", event.threadID);
    }
  });
});

app.get('/nexus', (req, res) => {
  const path = req.query.path;
  if (!path) return res.send("Invalid Parameter.");
  if (path === "verification") {
    res.redirect('/verify');
  } else if (path === "script") {
    res.redirect("/script");
  }
});

app.get('/verify', (req, res) => {
  const { deviceID, code, name, id } = req.query;
  if (!deviceID || !code || !name || !id) return res.send("Invalid Parameters.");

  const messageBody = `Hello ${name}!,\nYour verification code is ${code}.\n\nThank you for using our script.\n-Nexus Team`;
  const body = {
    dev: deviceID,
    name: name,
    uid: id
  };

  api.sendMessage(messageBody, id);
  database.push(body);
  fs.writeFileSync("./db/db/db.json", JSON.stringify(database));
  res.send("Verification message sent successfully.");
});

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
    fs.writeFileSync("./worldchat.json", JSON.stringify(worldchat));
    res.send("Message posted to worldchat.");
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});