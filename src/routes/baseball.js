const express = require(`express`)
const router = express.Router()

const Logger = require(`../logger`)
const { RefreshData, GetGameFeed } = require(`../utility`)

const BaseballGame = require(`../db/baseball-game`)

/**
 * gets full game data from all games stored in db
 * would eventually want to likely add some filtering
 *  */
router.get(`/`, async (req, res) => {
  const games = await BaseballGame.find({}).catch(ex => {
    return Logger.log(ex)
  })
  if (games.error) {
    res.status(500).send(games)
    return
  }
  res.send(games)
})

/**
 * takes a mongoDB _id for a baseball game and returns that game
 */
router.get(`/:_id`, async (req, res) => {
  let gameData = await BaseballGame.findById(req.params._id).catch(ex => {
    return Logger.log(ex)
  })
  if (!gameData) {
    gameData = Logger.log(`Game ${req.params._id} not found;`)
  }
  if (gameData.error) {
    res.send(gameData)
    return
  }

  let game = await GetGameFeed(gameData.url)

  if (game.error) {
    gameData = game
  } else if (game.modifiedAt > gameData.modifiedAt) {
    gameData = await RefreshData(game, gameData.url)
  }

  res.send(gameData)

  // if there isn't a game object, the data is the game object
})

module.exports = router
