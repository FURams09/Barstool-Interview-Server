// HTTP Server
const express = require("express");
const BodyParser = require("body-parser");

// Database
const mongoose = require("mongoose");
const Game = require("./db/game");

// Initialize Database connection
const DATABASE_NAME = "Barstool";
const MONGO_URI = `mongodb://localhost:27017/${DATABASE_NAME}`;

const { RefreshAllData } = require("./utility");
const REFRESH_DATA_ON_LOAD = true;
mongoose
  .connect(
    MONGO_URI,
    { useNewUrlParser: true }
  )
  .then(() => {
    // For simplicity used console.log for messaging
    console.log(`Mongoose connected to MongoDB @ ${MONGO_URI}`);

    const app = express();
    const PORT = "8008";

    app.use(BodyParser.json());

    app.get("/", (req, res) => {
      res.send(`Viva La Stool!`);
    });

    // gets the list of all games
    // send back to the main page as a list of games available, probably with the scores
    app.get(`/games`, (req, res) => {
      Game.find({})
        .then(results => {
          res.send(results);
        })
        .catch(ex => {
          res.statusCode(500).send(ex);
        });
    });

    app.get(`/game/:_id`, async (req, res) => {
      const gameFromDb = await Game.findById(req.params._id);
      res.send(gameFromDb);
    });

    app.listen(PORT, async () => {
      console.log(`Listening on Port ${PORT}`);
      if (REFRESH_DATA_ON_LOAD) {
        console.log(`Refreshing Feed Data`);
        RefreshAllData()
          .then(didUpdate => {
            if (didUpdate) {
              console.log(`All Feeds Refreshed`);
            } else {
              throw new Error(`See Utility Error Logs`);
            }
          })
          .catch(ex => {
            console.log(ex);
            console.log(
              `Error Refreshing all data. See logs for more details. ${ex}}`
            );
          });
      }
    });
  })
  .catch(err => {
    // this catches all errors not just connection ones for the time being. Should refactor that out.
    console.log(
      `Error connecting to MongoDB ${DATABASE_NAME} @ ${MONGO_URI}.\n${err}`
    );
  });
