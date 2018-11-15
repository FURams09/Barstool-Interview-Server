const express = require(`express`)
const router = express.Router()

const { RefreshData, GetGameFeed } = require(`../utility`)
const BaseballGame = require(`../db/baseball-game`)
const Logger = require(`../logger`)

/**
 * Gets the full game data from all games stored in 
 * db. Here you would eventually want to add some filtering
 * if dealing with more than two games
 *
 * This would also be where I'd impliment a caching layer by
 */
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
 * Takes a mongoDB _id for a baseball game and returns that game
 */
router.get(`/:_id`, async (req, res) => {
  let gameData = await BaseballGame.findById(req.params._id).catch(ex => {
    return Logger.log(ex)
  })
  if (!gameData) {
    gameData = Logger.log(`Game ${req.params._id} not found;`)
  }
  if (!gameData.error) {
    let game = await GetGameFeed(gameData.url)

    if (game.error) {
      gameData = game // game is the error object we want to return
    } else if (game.modifiedAt > gameData.modifiedAt) {
      gameData = await RefreshData(game, gameData.url)
    }
  }
  res.send(gameData)
})

module.exports = router
