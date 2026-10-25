const fs = require("fs");
const path = require("path");

const storagePath = path.join(__dirname, "../data/users.json");

function readStorage() {
  try {
    const rawData = fs.readFileSync(storagePath, "utf8");
    const data = JSON.parse(rawData);

    return {
      users: Array.isArray(data.users) ? data.users : [],
      favorites: data.favorites && typeof data.favorites === "object" ? data.favorites : {},
    };
  } catch (error) {
    return { users: [], favorites: {} };
  }
}

function writeStorage() {
  fs.writeFileSync(
    storagePath,
    JSON.stringify({ users, favorites }, null, 2),
    "utf8",
  );
}

const { users, favorites } = readStorage();

function ensureUserFavorites(username) {
  if (!Array.isArray(favorites[username])) {
    favorites[username] = [];
  }

  return favorites[username];
}

const User = {
  create: (username, password) => {
    const user = { username, password };
    users.push(user);
    ensureUserFavorites(username);
    writeStorage();
    return { username };
  },

  find: (username) => {
    return users.find((user) => user.username === username);
  },

  addFavorite: (username, trackId) => {
    const userFavorites = ensureUserFavorites(username);

    if (!userFavorites.includes(trackId)) {
      userFavorites.push(trackId);
      writeStorage();
    }
  },

  removeFavorite: (username, trackId) => {
    const userFavorites = ensureUserFavorites(username);
    const index = userFavorites.indexOf(trackId);

    if (index > -1) {
      userFavorites.splice(index, 1);
      writeStorage();
    }
  },

  getFavorites: (username) => {
    return ensureUserFavorites(username);
  },
};

module.exports = User;
