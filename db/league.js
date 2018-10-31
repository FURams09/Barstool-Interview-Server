import mongoose from "mongoose";

/**
 * Probably don't need to persist this as a model, just use it as a template for embedding in other documents.
 */
const LeagueSchema = new mongoose.Schema({
  abbr: String,
  name: String
});

export default LeagueSchema;
