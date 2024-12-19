const { v4 } = require("uuid")
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb")
const { marshall } = require("@aws-sdk/util-dynamodb")

const createDynamoDBClient = () => {
  return new DynamoDBClient()
}

const createNewMovie = (title, director, year) => {
  const createAt = new Date()
  const id = v4()

  return {
    id,
    title,
    director,
    year,
    createAt,
  }
}

const addMovieToDB = async (client, newMovie) => {
  const command = new PutItemCommand({
    TableName: "MoviesTable",
    Item: marshall(newMovie),
  })

  await client.send(command)
}

const createMovie = async (event) => {
  const client = createDynamoDBClient()
  const { title, director, year } = JSON.parse(event.body)
  const newMovie = createNewMovie(title, director, year)

  await addMovieToDB(client, newMovie)

  return {
    statusCode: 200,
    body: JSON.stringify(newMovie),
  }
}

module.exports = {
  createMovie,
}
