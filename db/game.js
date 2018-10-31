import mongoose from "mongoose";
import PeriodSchema from "./period";
import LeagueSchema from "./league";
const GameSchema = new mongoose.Schema({
  homeTeam: mongoose.Schema.ObjectId,
  awayTeam: mongoose.Schema.ObjectId,
  status: String,
  currentPeriod: Number,
  curerntPeriodHalf: String,
  modifiedAt: Date,
  isPeriodOver: Boolean,
  homeInnings: [PeriodSchema],
  awayInnings: [PeriodSchema],
  league: LeagueSchema
});

export default mongoose.Schema("Game", GameSchema);
