/**
 *
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
 * @param {array} periods An array of a game period object used to aggregate some stats.
 * @param {array} keys  Keys from the game period objects you want to aggregate
 * @returns an array of the toatls for the keys, in the same order the keys are passed
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
