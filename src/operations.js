import { isPullRequest } from './pulls.js';

/**
 * @param {import('@octokit/rest').Octokit} aOctoKit
 * @param {string} owner
 * @param {string} repo
 * @param {number} issueNum
 * @param {Array<string>} currentAssignees
 * @param {Array<string>} nextAssignees
 */
async function replaceReviewRequests(
    aOctoKit,
    owner,
    repo,
    issueNum,
    currentAssignees,
    nextAssignees
) {
    if (currentAssignees.length > 0) {
        await aOctoKit.pulls.removeRequestedReviewers({
            owner,
            repo,
            // eslint-disable-next-line camelcase
            pull_number: issueNum,
            reviewers: currentAssignees
        });
        // TODO: assert return value
    }

    const changeAssign = await aOctoKit.pulls.requestReviewers({
        owner,
        repo,
        // eslint-disable-next-line camelcase
        pull_number: issueNum,
        reviewers: nextAssignees
    });

    return changeAssign;
}

/**
 * @param {import('@octokit/rest').Octokit} aOctoKit
 * @param {string} repoName
 * @param {number} issueNum
 * @param {Array<string>} currentAssignees
 * @param {Array<string>} nextAssignees
 */
export async function assignReviewer(
    aOctoKit,
    repoName,
    issueNum,
    currentAssignees,
    nextAssignees
) {
    const [owner, repo] = repoName.split('/');

    const issueIsPullRequest = await isPullRequest(
        aOctoKit,
        owner,
        repo,
        issueNum
    );

    const changeReviewer = issueIsPullRequest ? replaceReviewRequests(
        aOctoKit,
        owner,
        repo,
        issueNum,
        currentAssignees,
        nextAssignees,
    ) : null;

    await Promise.all([changeReviewer]);
}
