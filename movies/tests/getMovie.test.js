const { getMovie } = require("../getMovie")
const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb")
const { unmarshall } = require("@aws-sdk/util-dynamodb")
const { v4: uuidv4 } = require("uuid")

jest.mock("@aws-sdk/client-dynamodb")
jest.mock("@aws-sdk/util-dynamodb")

describe("getMovie", () => {
  beforeAll(() => {
    DynamoDBClient.mockImplementation(() => {
      return {
        send: jest.fn().mockImplementation((command) => {
          if (command instanceof GetItemCommand) {
            return Promise.resolve({
              Item: {
                id: { S: "84a35bbf-a204-4c52-83ba-8e831d02e2a5" },
                title: { S: "Inception" },
                director: { S: "Christopher Nolan" },
                year: { N: "2010" },
                createAt: { S: "2024-12-20T01:53:27.674Z" },
                modifiedAt: { S: "2024-12-20T01:53:27.674Z" },
              },
            })
          }
        }),
      }
    })

    unmarshall.mockImplementation((item) => {
      return {
        id: item.id.S,
        title: item.title.S,
        director: item.director.S,
        year: parseInt(item.year.N, 10),
        createAt: item.createAt.S,
        modifiedAt: item.modifiedAt.S,
      }
    })
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it("should get a movie and return status code 200", async () => {
    const event = {
      pathParameters: {
        id: uuidv4(),
      },
    }

    const result = await getMovie(event)

    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body)).toEqual({
      id: "84a35bbf-a204-4c52-83ba-8e831d02e2a5",
      title: "Inception",
      director: "Christopher Nolan",
      year: 2010,
      createAt: "2024-12-20T01:53:27.674Z",
      modifiedAt: "2024-12-20T01:53:27.674Z",
    })
  })

  it("should return status code 500 on error", async () => {
    DynamoDBClient.mockImplementationOnce(() => {
      return {
        send: jest.fn().mockImplementation((command) => {
          if (command instanceof GetItemCommand) {
            return Promise.reject(new Error("DynamoDB error"))
          }
        }),
      }
    })

    const event = {
      pathParameters: {
        id: uuidv4(),
      },
    }

    const result = await getMovie(event)

    expect(result.statusCode).toBe(500)
    expect(JSON.parse(result.body).error).toBe("DynamoDB error")
  })
})
