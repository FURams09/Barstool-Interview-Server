// HTTP Server
import express from "express";
import BodyParser from "body-parser";

// Database
import mongoose from "mongoose";
import axios from "axios";
import Game from "./db/game";

// Initialize Database connection
const DATABASE_NAME = "Barstool";
const MONGO_URI = `mongodb://localhost:27017/${DATABASE_NAME}`;

mongoose
  .connect(
    MONGO_URI,
    { useNewUrlParser: true }
  )
  .then(() => {
    // For simplicity used console.log for messaging
    console.log(`Mongoose connected to MongoDB @ ${MONGO_URI}`);

    const feeds = [
      `https://2ncp9is1k8.execute-api.us-east-1.amazonaws.com/dev/feed/game/one`,
      `https://2ncp9is1k8.execute-api.us-east-1.amazonaws.com/dev/feed/game/two`
    ];
    const app = express();
    const PORT = "8008";

    app.use(BodyParser.json());

    app.get("/", (req, res) => {
      res.send(`Viva La Stool!`);
    });

    app.post(`/refreshFeed`, (req, res) => {
      // clear out the old data, not normally necessary but since we're pulling from the same 2 sources I don't want the db.
      // check out the modifiedAt and feedId to see if a change needs to be made.
      // make sure to index feedId in Mongoose
      // break out by team, game details, innings
      // Make sure everything gets a modified and createdAt and feedId for checking if a save needs to be made.
      const feedRequests = feeds.map(feed => {
        return axios
          .get(feed)
          .then(({ data }) => {
            const game = data.game || data; // if the response has a game object we want to extract just the game data
            if (game) {
              const homeInnings = game.homeTeamDetails.map(inning => {
                const { number, sequence, runs, hits, errors, type } = inning;
                return {
                  number,
                  sequence,
                  runs,
                  hits,
                  errs: errors,
                  type
                };
              });
              const awayInnings = game.homeTeamDetails.map(inning => {
                const { number, sequence, runs, hits, errors, type } = inning;

                return {
                  number,
                  sequence,
                  runs,
                  hits,
                  errs: errors,
                  periodType: type
                };
              });
              console.log(`AWAY INNINGS`, awayInnings);
              const newGame = new Game({
                homeTeam: {},
                awayTeam: {},
                status: game.status,
                currentPeriod: game.currentPeriod,
                curerntPeriodHalf: game.currentPeriodHalf,
                isPeriodOver: !(game.isPeriodOver === ""),
                homeInnings: [],
                awayInnings: [],
                league: {
                  alias: game.league.alias,
                  name: game.league.name
                }
              });

              Game.find({ feedId: game.feedId })
                .then(results => {
                  if (results.length === 0) {
                    newGame
                      .save()
                      .then(results => {
                        res.send(results);
                      })
                      .catch(ex => {
                        console.log(ex);
                      });
                  }
                })
                .catch(ex => {
                  console.log(ex);
                });
            } else {
              console.log(`game data not found`);
            }
          })
          .catch(ex => {
            console.log(ex);
          });
      });
      Promise.all(feedRequests).then(responses => {
        res.send(`all feeds updated`);
      });
    });

    // gets the list of all games
    // send back to the main page as a list of games available, probably with the scores
    app.get(`/games`, (req, res) => {
      res.send();
    });

    // get the game from mongoose for a given objectID;
    // return the full game statistics for display by the react app.
    app.get(`/game/:id`, (req, res) => {
      let gameId = req.params.id;
      let includePeriods = req.query.periods; // include this in the querystring if you want the periods returned with the game stats
      /* sample response
    {
      status: 'INPROGRESS',
      homeTeam: teamId, //probably include {team colors, market, abbr, name, id}
      awayTeam: teamId, // or above object
      currentPeriod: [7]
      currentHalf: "B"
      isPeriodOver: false
      alias: MLB,
      leagueName: Major League Baseball
      innings?: {Home: [{number: 1, sequence: 1, runs: 0, hits: 0, errors: 0, type: "inning"}, ...], Away: [{number: 1, sequence: 1, runs: 0, hits: 0, errors: 0, type: "inning"}, ...]}
    }
    */
    });

    app.get(`/team/:id`, (req, res) => {
      // pull team data from the teams Collection
    });
    app.listen(PORT, () => {
      console.log(`Listening on Port ${PORT}`);
    });
  })
  .catch(err => {
    // this catches all errors not just connection ones for the time being. Should refactor that out.
    console.log(
      `Error connecting to MongoDB ${DATABASE_NAME} @ ${MONGO_URI}.\n${err}`
    );
  });
