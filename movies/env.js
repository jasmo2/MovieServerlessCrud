require("dotenv").config()

const stage = process.env.STAGE
const databaseName = `jaime-${stage}-MoviesTable`

module.exports = {
  databaseName,
}
