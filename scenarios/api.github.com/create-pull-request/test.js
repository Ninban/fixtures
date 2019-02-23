const axios = require('axios')
const { test } = require('tap')

const fixtures = require('../../..')

test('Create Pull Request', async (t) => {
  const mock = fixtures.mock('api.github.com/create-pull-request')

  const result = await axios({
    method: 'post',
    url: 'https://api.github.com/repos/ninban-test-org/create-pull-request/pulls',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token 0000000000000000000000000000000000000001`,
      'Content-Type': 'application/json; charset=utf-8'
    },
    data: {
      title: 'Create pull request',
      head: 'master',
      base: 'test',
      maintainer_can_modify: false
    }
  }).catch(mock.explain)

  t.doesNotThrow(mock.done.bind(mock), 'satisfies all mocks')
  t.is(result.status, 201)
  t.end()
})
