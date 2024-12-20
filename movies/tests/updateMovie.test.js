const { updateMovie } = require("../updateMovie")
const {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb")
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb")
const { v4: uuidv4 } = require("uuid")

jest.mock("@aws-sdk/client-dynamodb")
jest.mock("@aws-sdk/util-dynamodb")
jest.mock("uuid")

describe("updateMovie", () => {
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
          } else if (command instanceof UpdateItemCommand) {
            return Promise.resolve({
              Attributes: {
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

    marshall.mockImplementation((item) => item)
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
    uuidv4.mockReturnValue("84a35bbf-a204-4c52-83ba-8e831d02e2a5")
    jest.spyOn(global, "Date").mockImplementation(() => ({
      toISOString: () => "2024-12-20T01:53:27.674Z",
    }))
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it("should update a movie and return status code 200", async () => {
    const event = {
      pathParameters: {
        id: "84a35bbf-a204-4c52-83ba-8e831d02e2a5",
      },
      body: JSON.stringify({
        title: "Inception",
        director: "Christopher Nolan",
        year: 2010,
      }),
    }

    const result = await updateMovie(event)

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

  it("should return status code 400 if the ID does not exist in the database", async () => {
    DynamoDBClient.mockImplementationOnce(() => {
      return {
        send: jest.fn().mockImplementation((command) => {
          if (command instanceof GetItemCommand) {
            return Promise.resolve({ Item: null })
          }
        }),
      }
    })

    const event = {
      pathParameters: {
        id: "non-existent-id",
      },
      body: JSON.stringify({
        title: "Inception",
        director: "Christopher Nolan",
        year: 2010,
      }),
    }

    const result = await updateMovie(event)

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body).error).toBe("Movie ID does not exist")
  })

  it("should return status code 500 on error", async () => {
    DynamoDBClient.mockImplementationOnce(() => {
      return {
        send: jest.fn().mockImplementation((command) => {
          if (command instanceof UpdateItemCommand) {
            return Promise.reject(new Error("DynamoDB error"))
          }
        }),
      }
    })

    const event = {
      pathParameters: {
        id: "84a35bbf-a204-4c52-83ba-8e831d02e2a5",
      },
      body: JSON.stringify({
        title: "Inception",
        director: "Christopher Nolan",
        year: 2010,
      }),
    }

    const result = await updateMovie(event)

    expect(result.statusCode).toBe(500)
  })
})
