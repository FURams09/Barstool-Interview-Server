// HTTP Server
const express = require(`express`)
const BodyParser = require(`body-parser`)
const morgan = require(`morgan`)
const BaseballRoutes = require(`./routes/baseball`)

// Logging
const Logger = require(`./logger`)

// Database
const mongoose = require(`mongoose`)

require(`dotenv`).config()
const { RefreshAllData } = require(`./utility`)

const startServer = () => {
  const app = express()

  app.use(BodyParser.json())
  app.use(morgan(`tiny`))

  // test route
  app.get(`/`, (req, res) => {
    res.send(`Viva La Stool!`)
  })

  // baseball
  app.use(`/games`, BaseballRoutes)

  app.listen(process.env.PORT, async () => {
    if (process.env.REFRESH_DATA_ON_LOAD === `true`) {
      console.log(`Refreshing feed data`)
      const didUpdate = await RefreshAllData().catch(ex => {
        return Logger.log(ex)
      })
      if (didUpdate && !didUpdate.error) {
        console.log(`All feeds refreshed`)
      } else {
        console.log(`Error refreshing all feeds. See logs for more details.`)
      }
    } else {
      console.log(`Skipping DataRefresh`)
    }
    console.log(`Listening on Port ${process.env.PORT}`)
  })
}

// Connect to Mongo server and start listening for requests
if (!process.env.MONGO_URI) {
  console.error(`No MongoDB configured for server`)
} else {
  mongoose
    .connect(
      process.env.MONGO_URI,
      { useNewUrlParser: true }
    )
    .then(() => {
      console.log(`Mongoose connected to MongoDB @ ${process.env.MONGO_URI}`)
      startServer()
    })
    .catch(err => {
      // this catches all errors not just connection ones for the time being. Should refactor that out.
      console.log(
        `Error connecting to MongoDB ${process.env.MONGO_URI}.\n${err}`
      )
    })
}
