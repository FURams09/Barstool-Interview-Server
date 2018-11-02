const axios = require("axios");
const mongoose = require("mongoose");
const Game = require("./db/game");

const processTeam = feedTeam => {
  return {
    abbr: feedTeam.abbr,
    market: feedTeam.market,
    name: feedTeam.name,
    teamColor: feedTeam.teamColor,
    textColor: feedTeam.textColor
  };
};

const processInnings = innings => {
  return innings.map(inning => {
    const { number, sequence, runs, hits, errors, type } = inning;
    return { number, sequence, runs, hits, errs: errors, periodType: type };
  });
};

const feeds = [
  `https://2ncp9is1k8.execute-api.us-east-1.amazonaws.com/dev/feed/game/one`,
  `https://2ncp9is1k8.execute-api.us-east-1.amazonaws.com/dev/feed/game/two`
];
/**
 * Returns true if all feeds were successfully processed and saved to Mongoose
 * Returns false if any of the updates fail. Successful updates will not be rolled back.
 */
exports.RefreshAllData = async () => {
  // if there isn't a game object, the data is the game object
  if (mongoose.connection.db.listCollections({ name: "Game" })) {
    await Game.collection.drop();
  }

  const feedUpdates = feeds.map(async feed => {
    return refreshData(feed);
  });

  // let all of the data updates finish before checking they succeeded;
  //
  let feedResults = await Promise.all(feedUpdates);
  return feedResults.every(feedResult => {
    return feedResult._id;
  });
};
const refreshData = async feed => {
  // clear out the old data, not normally necessary but since we're pulling from the same 2 sources I don't want the db.
  // check out the modifiedAt and feedId to see if a change needs to be made.
  // make sure to index feedId in Mongoose
  // break out by team, game details, innings
  // Make sure everything gets a modified and createdAt and feedId for checking if a save needs to be made.
  // if the response has a game object we want to extract just the game data

  let feedFromSource = await axios.get(feed).catch(ex => {
    console.log(ex);
    // set feedFromSource to false to short circuit mongo update
    return false;
  });
  if (!feedFromSource) {
    return false;
  }

  // if there isn't a game object, the data is the game object
  let game = feedFromSource.data.game || feedFromSource.data;
  if (game) {
    let homeTeam = processTeam(game.homeTeam);
    let awayTeam = processTeam(game.awayTeam);

    let homeTeamInnings = processInnings(game.homeTeamDetails);
    let awayTeamInnings = processInnings(game.awayTeamDetails);

    let newGame = new Game({
      url: feed,
      modifiedAd: game.modifiedAd,
      homeTeam,
      awayTeam,
      status: game.status,
      currentPeriod: game.currentPeriod,
      curerntPeriodHalf: game.currentPeriodHalf,
      isPeriodOver: !(game.isPeriodOver === ""),
      homeInnings: homeTeamInnings,
      awayInnings: awayTeamInnings,
      homeTeamFinal: game.homeTeamFinal,
      awayTeamFinal: game.awayTeamFinal,
      league: {
        alias: game.league.alias,
        name: game.league.name
      }
    });
    return await newGame.save().catch(ex => {
      console.log(ex);
      return false;
    });
  } else {
    console.log(`game data not found`);
    return false;
  }
};

exports.RefreshData = refreshData;
