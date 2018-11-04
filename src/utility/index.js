const axios = require(`axios`)
const SaveBaseballGame = require(`./baseball`)
const BaseballGame = require(`../db/baseball-game`)
const Logger = require(`../logger`)

const feeds = [
  `https://2ncp9is1k8.execute-api.us-east-1.amazonaws.com/dev/feed/game/one`,
  `https://2ncp9is1k8.execute-api.us-east-1.amazonaws.com/dev/feed/game/two`
]

const getGameFeed = async feedURL => {
  let feedFromSource = await axios.get(feedURL).catch(ex => {
    return Logger.log(ex)
  })
  if (feedFromSource.error) {
    return feedFromSource.error
  }
  // if there isn't a game object, the data is the game object
  let game = feedFromSource.data.game || feedFromSource.data
  if (game) {
    return game
  } else {
    return Logger.log(`game data not found`)
  }
}

exports.GetGameFeed = getGameFeed

/**
 * Returns true if all feeds were successfully processed and saved to Mongoose
 * Returns false if any of the updates fail. Successful updates will not be rolled back.
 */
exports.RefreshAllData = async () => {
  // Clear out old data when the app starts. In Production it would likely make more sense to just update
  // existing game data, but with just two feeds representing the same game
  await BaseballGame.deleteMany({})

  const feedUpdates = feeds.map(async feed => {
    // if there isn't a game object, the data is the game object
    let game = await getGameFeed(feed)
    if (game) {
      return refreshData(game, feed)
    } else {
      return Logger.log(`game data not found`)
    }
  })

  let feedResults = await Promise.all(feedUpdates)

  return feedResults.every(feedResult => {
    return !feedResult.error
  })
}

/**
 *  Takes a url and saves the corresponding API results to the db
 *  based on the league.alias of the game.
 *
 * @param {string} feed  URL to fetch game data from.
 *
 * @returns {object} either an object representing a game or an object with key "error"
 * and a body with error details
 */
const refreshData = async (game, feed) => {
  let saveResults
  switch (game.league.alias) {
    case `MLB`:
      saveResults = await SaveBaseballGame(game, feed).catch(ex =>
        Logger.log(ex)
      )
      break
    case `NFL`:
      // This is the general workflow for processing different sports' feeds
      // saveResults = await saveFootballGame(game).catch(ex=> {
      //  Logger.log(ex);
      // })
      break
    default:
      saveResults = Logger.log(`League not found for feed ${feed}`)
      break
  }
  return saveResults
}

exports.RefreshData = refreshData
