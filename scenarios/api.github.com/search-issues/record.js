module.exports = searchIssues

const env = require('../../../lib/env')
const getTemporaryRepository = require('../../../lib/temporary-repository')

async function searchIssues (state) {
  let error

  // create a temporary repository
  const temporaryRepository = getTemporaryRepository({
    request: state.request,
    token: env.FIXTURES_USER_A_TOKEN_FULL_ACCESS,
    org: 'octokit-fixture-org',
    name: 'search-issues'
  })

  await temporaryRepository.create()

  try {
    // https://developer.github.com/v3/issues/#create-an-issue
    // (theses requests get ignored, we need an existing issues for the serarch)
    console.log('creating issue 1')
    await state.request({
      method: 'post',
      url: `/repos/octokit-fixture-org/${temporaryRepository.name}/issues`,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${env.FIXTURES_USER_A_TOKEN_FULL_ACCESS}`,
        'X-Octokit-Fixture-Ignore': 'true'
      },
      data: {
        title: 'The doors don’t open',
        body: 'I tried "open sesame" as seen on Wikipedia but no luck!'
      }
    })

    console.log('delay for debug')
    await new Promise(resolve => setTimeout(resolve, 5000))

    console.log('creating issue 2')
    await state.request({
      method: 'post',
      url: `/repos/octokit-fixture-org/${temporaryRepository.name}/issues`,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${env.FIXTURES_USER_B_TOKEN_FULL_ACCESS}`,
        'X-Octokit-Fixture-Ignore': 'true'
      },
      data: {
        title: 'Sesame seeds split without a pop!',
        body: 'I’ve waited all year long, but there was no pop'
      }
    })

    // timeout for search indexing
    console.log('delay for indexing')
    await new Promise(resolve => setTimeout(resolve, 5000))

    console.log('search request')
    const query = `sesame repo:octokit-fixture-org/${temporaryRepository.name}`
    await state.request({
      method: 'get',
      url: `/search/issues?q=${encodeURIComponent(query)}`,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${env.FIXTURES_USER_A_TOKEN_FULL_ACCESS}`
      }
    })
  } catch (_error) {
    console.log('ERROR')
    console.log(_error)
    error = _error
  }

  await temporaryRepository.delete()

  if (error) {
    return Promise.reject(error)
  }
}
