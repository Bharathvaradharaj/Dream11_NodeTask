const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const { type } = require('os');


const app = express();
app.use(bodyParser.json());


// Define schema for team entries
const teamEntrySchema = new mongoose.Schema({

  teamName: { type: String, require: true },
  players: { type: [String], require: true },
  captain: { type: String, require: true },
  viceCaptain: { type: String, require: true }

})

const teamentries = mongoose.model("teamentries", teamEntrySchema)





// Add Team Entry endpoint
app.post('/add-team', [
  check('teamName').notEmpty().withMessage('Team name is required'),
  check('players').isArray({ min: 11, max: 11 }).withMessage('Exactly 11 players are required'),
  check('captain').notEmpty().withMessage('Captain name is required'),
  check('viceCaptain').notEmpty().withMessage('Vice-captain name is required'),
  // Custom validation for player selection rules
  check('players').custom((players, { req }) => {
    const playerNames = players.map(player => player);
    const captain = req.body.captain;
    const viceCaptain = req.body.viceCaptain;
    // const uniquePlayerNames = new Set(playerNames);
    console.log(playerNames)
    if (new Set(playerNames).size !== playerNames.length) {
      throw new Error('Each player name must be unique');
    }

    if (captain === viceCaptain) {
      throw new Error('Captain and vice-captain must be different players');
    }

    return true;
  })


], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Save team entry to MongoDB
  const { teamName, players, captain, viceCaptain } = req.body;
  const teamEntry = new teamentries({ teamName, players, captain, viceCaptain });
  teamEntry.save()
    .then(() => res.status(201).json({ message: 'Team entry added successfully' }))
    .catch(err => res.status(500).json({ message: 'Failed to add team entry', error: err }));
});





app.get('/', (req, res) => {
  res.json('Start Game')

})

mongoose.connect("mongodb://localhost:27017/task-", {

  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {

  console.log('DB is  connected')
}).catch(() => {

  console.log('DB is not connected')
})


// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
