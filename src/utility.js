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

/**
 * Pass an array of a teams period from a game and return the game totals for those stats
 * @param {array} innings An array of a game period object used to aggregate some stat.
 * @param {array} keys  Keys from the individual game period you want to aggregate
 * @returns an array of the sums orderd by the keys passed
 */
const gameTotal = (innings, keys) => {
  let startingTotals = new Array(keys.length);
  startingTotals.fill(0);

  return innings.reduce((total, inning) => {
    keys.forEach((key, i) => {
      total[i] += Number(inning[key]);
    });
    return total;
  }, startingTotals);
};
const processInnings = (away, home) => {
  // pop through the awayInnings and find corresponding homeInnings.
  // then if any home innings are left add them and then sort the innings by period

  // each inning is represented as an array with the away team in index 0 and the home team in index 1,
  // should pass the number of runs, hits, and errors in that inning.
  // if an inning is missing it will be represented by an empty array.

  // we loop the away innings since in any sport besides baseball there should be a corresponding
  // home period for every away period, but in baseball you could have the top of an inning where there's an away without
  // a corresponding home necessarily.

  if (away.length - 1 > home.length || home.length > away.length) {
    // should never have more than one more away inning than home inning
    // should never have more home innings than away innings
  }
  away.sort((inning, nextInning) => {
    return inning.period - nextInning.period;
  });
  home.sort((inning, nextInning) => {
    return inning.period - nextInning.period;
  });

  let gameInnings = [];

  away.forEach((awayInning, i) => {
    if (i >= home.length) {
      gameInnings.push([...awayInning, {}]); // the last half inning of a game.
    }
    let homeInning = home[i];
    if (homeInning.period === awayInning.period) {
      gameInnings.push([
        Object.assign({ errs: awayInning.errors }, awayInning),
        Object.assign({ errs: homeInning.errors }, homeInning)
      ]);
    }
  });
  let [homeHits, homeErrors] = gameTotal(home, ["hits", "errors"]);
  let [awayHits, awayErrors] = gameTotal(away, ["hits", "errors"]);
  return [homeHits, homeErrors, awayHits, awayErrors, gameInnings];
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
  await Game.deleteMany({});

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

    let [
      homeTeamHits,
      homeTeamErrs,
      awayTeamHits,
      awayTeamErrs,
      innings
    ] = processInnings(game.awayTeamDetails, game.homeTeamDetails);
    const finalKeys = ["R", "H", "E"];
    const finals = [
      [game.awayTeamFinal, awayTeamHits, awayTeamErrs],
      [game.homeTeamFinal, homeTeamHits, homeTeamErrs]
    ];
    console.log;
    const newGame = new Game({
      url: feed,
      modifiedAd: game.modifiedAd,
      homeTeam,
      awayTeam,
      status: game.status,
      currentPeriod: game.currentPeriod,
      currentPeriodHalf: game.currentPeriodHalf,
      isPeriodOver: !(game.isPeriodOver === ""),
      innings,
      finalKeys,
      finals,
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
