const mongoose = require("mongoose");

const Period = {
  number: Number,
  sequence: Number,
  runs: Number,
  hits: Number,
  errs: Number,
  periodType: String
};

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

const GameSchema = new mongoose.Schema({
  url: String,
  modifiedAt: Date,
  homeTeam: Team,
  awayTeam: Team,
  status: String,
  currentPeriod: Number,
  curerntPeriodHalf: String,
  isPeriodOver: Boolean,
  homeInnings: [Period],
  awayInnings: [Period],
  homeTeamFinal: Number,
  awayTeamFinal: Number,
  league: League
});

module.exports = mongoose.model("Game", GameSchema);
