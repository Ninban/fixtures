const axios = require('axios')
const { test } = require('tap')

const fixtures = require('../../..')

test('Get single pull request', async (t) => {
  const mock = fixtures.mock('api.github.com/get-single-pull-request')

  const result = await axios({
    method: 'get',
    url: 'https://api.github.com/repos/ninban-test-org/hello-world/pulls/1',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token 0000000000000000000000000000000000000001`
    }
  }).catch(mock.explain)

  t.doesNotThrow(mock.done.bind(mock), 'satisfies all mocks')
  t.is(result.data.title, 'Update README.md')
  t.end()
})
