## Greg Padin's Barstool Sports Full Stack Application Project

Thank you for considering my submission to Barstool's [Full Stack Developer](https://www.barstoolsports.com/jobs/P_AAAAAADAAAgGURjfvKuElq) position. I really enjoyed working on
this project and hope to have the opportunity to discuss it further with you after you see my work and 
reading my resume.

#### Configuration and Getting Started
This project is a simple Express Server that relies on a Mongoose to communicate with the MongoDB database used for persistence. 

There are three configuration options to know about in the .env file

_PORT_ port to listen for requests on (8008) If you run this on another port you will need to update the
proxy address in the front end projects package.json

_REFRESH_DATA_ON_LOAD_ (true) Used mostly for development and the first run of the project to query the Source Feeds. Since the data set was static I didn't want to hit your aws server unnecessarily but did want to build in an
easy way 

_MONGO_URI_ (mongo://localhost:27017/Barstool) url of MongoDB Server and Database to use

Once the .env file is set up you will just need to run 
```
yarn install
yarn start
```

#### Routes
- / - test route 
- /games - all the available games
- /games/{_id} - get the specific information for a game based on its MongoDB ObjectID


#### SRC Project Structure
- db mongoose schema definitions
- routes
    sport specific middleware for handling requests from front end   
- utility code relating to processing third party API data and saving it to the database   
- logger.js
    simple logging middleware  
- server.js
    entry point to the project

[Link to Front End Scoreboard](https://github.com/FURams09/barstool-fullstack-server)


[LinkedIn Profile](https://www.linkedin.com/in/gregory-padin-7b462412b/)
