const { tracks } = require("../data/tracks");
const User = require("../models/User");

function normalizeTrackId(trackId) {
  return Number(trackId);
}

const getTracks = (req, res) => {
  res.json(tracks);
};

const addToFavorites = (req, res) => {
  const { trackId } = req.body;
  const username = req.user.username;

  User.addFavorite(username, normalizeTrackId(trackId));
  res.json({ message: "Track added to favorites" });
};

const removeFromFavorites = (req, res) => {
  const { trackId } = req.body;
  const username = req.user.username;

  User.removeFavorite(username, normalizeTrackId(trackId));
  res.json({ message: "Track removed from favorites" });
};

const getFavorites = (req, res) => {
  const username = req.user.username;
  const favoriteTracks = User.getFavorites(username);

  const favoriteTrackDetails = tracks.filter((track) =>
    favoriteTracks.includes(track.id)
  );
  res.json(favoriteTrackDetails);
};

module.exports = {
  getTracks,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
};
