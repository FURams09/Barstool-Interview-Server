const Logger = require(`../../logger`)
const BaseballGame = require(`../../db/baseball-game`)
const { processTeam, gameTotal } = require(`../game`)

/**
 *  Takes in two sets of objects with the teams runs, errors, and hits for each inning
 *  and converts them to an array of combined  "game innings" and sums up the
 *  necessry fields
 *
 *  Adding runs would be trivial but we get the team runs total from the feed so we
 *  just use that and save the calculation
 *
 * @param {Innings} away Array of innings for the away team
 * @param {Innings} home Array of innings for the home team
 *
 * @returns {array} [
 *  error,
 *  [innings],
 *  homeHits,
 *  homeErrors,
 *  awayHits,
 *  awayError
 * ]
 */
const processInnings = (away, home) => {
  if (home.length > away.length || away.length - 1 > home.length) {
    // should never have more than one more away inning than home inning
    // should never have more home innings than away innings
    return [Logger.log(`Inning counts mismatched`)]
  }
  away.sort((inning, nextInning) => {
    return inning.sequence - nextInning.sequence
  })
  home.sort((inning, nextInning) => {
    return inning.sequence - nextInning.sequence
  })

  try {
    let gameInnings = []

    // loop through away since if it's the top of the inning there will be one more away inning then
    // home inning. Otherwise there should be the same number of innings.
    away.forEach((awayInning, i) => {
      const {
        errors: awayErrors,
        hits: awayHits,
        runs: awayRuns,
        sequence: awaySequence
      } = awayInning
      if (i >= home.length) {
        // the last half inning of a game.
        gameInnings.push([
          {
            errs: awayErrors,
            hits: awayHits,
            runs: awayRuns,
            sequence: awaySequence
          },
          {}
        ])
      }

      const homeInning = home[i]
      const {
        errors: homeErrors,
        hits: homeHits,
        runs: homeRuns,
        sequence: homeSequence
      } = homeInning
      if (homeInning.sequence === awayInning.sequence) {
        gameInnings.push([
          {
            errs: awayErrors,
            hits: awayHits,
            runs: awayRuns,
            sequence: awaySequence
          },
          {
            errs: homeErrors,
            hits: homeHits,
            runs: homeRuns,
            sequence: homeSequence
          }
        ])
      } else {
        return [
          Logger.log(`Error with mismatched Inning Sequence 
        homeSeq: ${homeInning.sequence} 
        awaySeq: ${awayInning.sequence}
        index: ${i}`)
        ]
      }
    })
    let [homeHits, homeErrors] = gameTotal(home, [`hits`, `errors`])
    let [awayHits, awayErrors] = gameTotal(away, [`hits`, `errors`])
    return [null, gameInnings, homeHits, homeErrors, awayHits, awayErrors]
  } catch (ex) {
    return [Logger.log(ex)]
  }
}

const saveBaseballGame = async (game, feedURL) => {
  // extract necessary team info
  let homeTeam = processTeam(game.homeTeam)
  let awayTeam = processTeam(game.awayTeam)

  // process the arrays of inning data
  let [
    error,
    innings,
    homeTeamHits,
    homeTeamErrs,
    awayTeamHits,
    awayTeamErrs
  ] = processInnings(game.awayTeamDetails, game.homeTeamDetails)

  if (error) {
    return error
  }
  const finalKeys = [`R`, `H`, `E`]
  const finals = [
    [game.awayTeamFinal, awayTeamHits, awayTeamErrs],
    [game.homeTeamFinal, homeTeamHits, homeTeamErrs]
  ]

  // save game data
  const newGame = new BaseballGame({
    url: feedURL,
    modifiedAd: game.modifiedAd,
    homeTeam,
    awayTeam,
    status: game.status,
    currentPeriod: game.currentPeriod,
    currentPeriodHalf: game.currentPeriodHalf,
    isPeriodOver: !(game.isPeriodOver === ``),
    periods: innings,
    finalKeys,
    finals,
    league: {
      alias: game.league.alias,
      name: game.league.name
    }
  })

  let results = await newGame.save().catch(ex => Logger.log(ex))
  return results
}

module.exports = saveBaseballGame
