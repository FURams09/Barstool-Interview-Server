// model that extends the standard Game with baseball specific fields

const mongoose = require(`mongoose`)
const Game = require(`./game`)
// Baseball Specific subdocument.

// This would likely be unnecessary in production but
// I wanted to include an example of how to extend the
// base Game class to make it sports specific while still
// having the required global game fields.
const Inning = new mongoose.Schema({
  runs: Number,
  hits: Number,
  errs: Number,
  sequence: Number
})

// override default Periods to innings
const BaseballGame = Object.assign({ periods: [[Inning]] }, Game)
const BaseballSchema = new mongoose.Schema(BaseballGame)

module.exports = mongoose.model(`BaseballGame`, BaseballSchema)
