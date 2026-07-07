const bcrypt = require("bcryptjs");
const { getStore } = require("../data/store");
const { signToken } = require("../middlewares/auth.middleware");
const { unauthorized } = require("../middlewares/error.middleware");

function publicUser(user) {
  if (!user) {
    return null;
  }

  const { password_hash, ...safe } = user;
  return safe;
}

async function login(email, password) {
  const user = await getStore().findEmployeeByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw unauthorized("Invalid email or password");
  }

  return {
    token: signToken(user),
    user: publicUser(user)
  };
}

async function me(userId) {
  return publicUser(await getStore().findEmployeeById(userId));
}

module.exports = { login, me, publicUser };
