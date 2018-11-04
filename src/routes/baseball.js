const express = require(`express`)
const router = express.Router()

const Logger = require(`../logger`)
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
    res.status(500).send(games.error)
    return
  }
  res.send(games)
})

/**
 * takes a mongoDB _id for a baseball game and returns that game
 */
router.get(`/:_id`, async (req, res) => {
  let gameFromDb = await BaseballGame.findById(req.params._id).catch(ex => {
    return Logger.log(ex)
  })
  if (!gameFromDb) {
    gameFromDb = Logger.log(`Game ${req.params._id} not found;`)
  }
  if (gameFromDb.error) {
    res.status(500).send(gameFromDb.error)
    return
  }
  res.send(gameFromDb)
})

module.exports = router
