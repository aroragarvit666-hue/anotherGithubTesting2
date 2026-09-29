jest.mock('@adobe/aio-sdk', () => ({
  Core: { Logger: jest.fn(() => ({ info: jest.fn(), debug: jest.fn(), error: jest.fn() })) }
}))
const { main } = require('../actions/hello/index.js')

describe('hello', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 200 with a default greeting when no name is given', async () => {
    const res = await main({})
    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe('Hello, World!')
    expect(res.body.timestamp).toBeDefined()
  })

  it('returns 200 with a personalized greeting', async () => {
    const res = await main({ name: 'Ada' })
    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe('Hello, Ada!')
  })

  it('reads the IMS token from headers without failing', async () => {
    const res = await main({
      name: 'Grace',
      __ow_headers: { authorization: 'Bearer test-token' }
    })
    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe('Hello, Grace!')
  })

  it('returns 500 when logging throws', async () => {
    const { Core } = require('@adobe/aio-sdk')
    Core.Logger.mockImplementationOnce(() => {
      throw new Error('logger boom')
    })
    const res = await main({ name: 'Fail' })
    expect(res.statusCode).toBe(500)
    expect(res.body.error).toBe('logger boom')
  })
})
