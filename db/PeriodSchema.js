import mongoose from "mongoose";

const PeriodSchema = new mongoose.Schema({
  number: Number,
  sequence: Number,
  runs: Number,
  hits: Number,
  errors: Number,
  type: String
});
// only used inside of games so no need for a model
export default PeriodSchema;
