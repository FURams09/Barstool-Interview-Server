const express = require(`express`)
const router = express.Router()

const { RefreshData, GetGameFeed } = require(`../utility`)
const BaseballGame = require(`../db/baseball-game`)
const Logger = require(`../logger`)

/**
 * Gets the bare minimum data necessary for building the inning selector.
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

  const payload = games.map(game => {
    return {_id: game._id, currentPeriod: game.currentPeriod}
  });
  res.send(payload)
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
