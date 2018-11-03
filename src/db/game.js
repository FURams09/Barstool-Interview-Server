const mongoose = require("mongoose");

const Team = {
  abbr: String,
  market: String,
  name: String,
  teamColor: String,
  textColor: String
};

const League = {
  alias: String,
  name: String
};

const Inning = new mongoose.Schema({
  runs: Number,
  hits: Number,
  errs: Number
});

const GameSchema = new mongoose.Schema({
  url: String,
  modifiedAt: Date,
  homeTeam: Team,
  awayTeam: Team,
  status: String,
  currentPeriod: Number,
  currentPeriodHalf: String,
  isPeriodOver: Boolean,
  innings: [[Inning]],
  finalKeys: [String],
  finals: [[Number]],
  league: League
});

module.exports = mongoose.model("Game", GameSchema);
