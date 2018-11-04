// Global SubDocuments
const mongoose = require(`mongoose`)
const Team = mongoose.Schema({
  abbr: { type: String, default: `N/A` },
  market: { type: String, default: `N/A` },
  name: { type: String, default: `N/A` },
  teamColor: { type: String, default: `FFFFFF` },
  textColor: { type: String, default: `000000` }
})

const League = {
  alias: String,
  name: String
}

const GameSchemaTemplate = {
  url: String,
  modifiedAt: Date,
  homeTeam: Team,
  awayTeam: Team,
  status: String,
  currentPeriod: Number,
  currentPeriodHalf: String,
  isPeriodOver: Boolean,
  periods: [[]],
  finalKeys: [String],
  finals: [[Number]],
  league: League
}

module.exports = GameSchemaTemplate
