import mongoose from "mongoose";
import LeagueSchema from "./league";
const TeamSchema = new mongoose.Schema({
  abbr: String,
  market: String,
  name: String,
  teamColor: String,
  textColor: String,
  league: LeagueSchema
});

export default mongoose.model("Team", TeamSchema);
