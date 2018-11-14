/**
 * This function assumes that all teams no matter what sport will have the same basic information
 * that we need to 
 * @param {Team} feedTeam Team Data from third party stream
 *
 */
const processTeam = feedTeam => {
  return {
    abbr: feedTeam.abbr,
    market: feedTeam.market,
    name: feedTeam.name,
    teamColor: feedTeam.teamColor,
    textColor: feedTeam.textColor
  }
}

/**
 * Calculate game totals from an array of game periods. Can calculate multiple stats at once
 *
 * @param {array} periods An array of a game's periods used to aggregate some stats.
 * @param {array} keys  Keys from the game period objects you want to aggregate
 * @returns an array of the totals for the keys, in the same order the keys are passed
 */
const gameTotal = (periods, keys) => {
  let startingTotals = new Array(keys.length)
  startingTotals.fill(0)

  return periods.reduce((totals, period) => {
    keys.forEach((key, i) => {
      totals[i] += Number(period[key])
    })
    return totals
  }, startingTotals)
}

module.exports = {
  processTeam,
  gameTotal
}
