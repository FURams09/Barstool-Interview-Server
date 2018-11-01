import mongoose from "mongoose";

const Period = {
  number: Number,
  sequence: Number,
  runs: Number,
  hits: Number,
  errs: Number,
  type: String
};

const Team = {
  abbr: String,
  market: String,
  name: String,
  teamColor: String,
  textColor: String,
  league: { type: mongoose.SchemaTypes.ObjectId, ref: "League" }
};

const League = {
  alias: String,
  name: String
};

const GameSchema = new mongoose.Schema({
  feedId: String,
  modifiedAt: Date,
  homeTeam: Team,
  awayTeam: Team,
  status: String,
  currentPeriod: Number,
  curerntPeriodHalf: String,
  isPeriodOver: Boolean,
  homeInnings: [Period],
  awayInnings: [Period],
  league: League
});

export default mongoose.model("Game", GameSchema);
