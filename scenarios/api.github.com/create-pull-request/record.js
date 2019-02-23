module.exports = createPullRequest

const env = require('../../../lib/env')
const getTemporaryRepository = require('../../../lib/temporary-repository')

async function createPullRequest (state) {
  let error
  // create a temporary repository
  const temporaryRepository = getTemporaryRepository({
    request: state.request,
    token: env.FIXTURES_USER_A_TOKEN_FULL_ACCESS,
    org: 'ninban-test-org',
    name: 'create-pull-request'
  })

  await temporaryRepository.create()

  try {
    // https://developer.github.com/v3/repos/contents/#create-a-file
    // Create a commit in master branch
    const { data: { commit: { sha: sha1 } } } = await state.request({
      method: 'put',
      url: `/repos/ninban-test-org/${temporaryRepository.name}/contents/1.md`,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${env.FIXTURES_USER_A_TOKEN_FULL_ACCESS}`,
        'X-Octokit-Fixture-Ignore': 'true'
      },
      data: {
        message: 'initial commit',
        content: Buffer.from('# git-refs\ncreated with initial commit').toString('base64')
      }
    })

    // https://developer.github.com/v3/git/refs/#create-a-reference
    // Create a new branch "test" pointing to sha of initial commit
    await state.request({
      method: 'post',
      url: `/repos/ninban-test-org/${temporaryRepository.name}/git/refs`,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${env.FIXTURES_USER_A_TOKEN_FULL_ACCESS}`,
        'X-Octokit-Fixture-Ignore': 'true'
      },
      data: {
        ref: 'refs/heads/test',
        sha: sha1
      }
    })

    // https://developer.github.com/v3/repos/contents/#create-a-file
    // Create a new commit in master branch
    await state.request({
      method: 'put',
      url: `/repos/ninban-test-org/${temporaryRepository.name}/contents/2.md`,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${env.FIXTURES_USER_A_TOKEN_FULL_ACCESS}`,
        'X-Octokit-Fixture-Ignore': 'true'
      },
      data: {
        message: '2nd commit',
        content: Buffer.from('# git-refs\ncreated with 2nd commit').toString('base64')
      }
    })

    // https://developer.github.com/v3/pulls/#create-a-pull-request
    // Create a pull request from master to test branch
    await state.request({
      method: 'post',
      url: `/repos/ninban-test-org/${temporaryRepository.name}/pulls`,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${env.FIXTURES_USER_A_TOKEN_FULL_ACCESS}`
      },
      data: {
        title: 'Create pull request',
        head: 'master',
        base: 'test',
        maintainer_can_modify: false
      }
    })
  } catch (_error) {
    error = _error
  }

  await temporaryRepository.delete()

  if (error) {
    return Promise.reject(error)
  }
}
