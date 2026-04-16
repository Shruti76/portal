const axios = require('axios');

/**
 * GitHub API Integration for Actions
 * Environment variables required:
 * - GITHUB_TOKEN: GitHub personal access token with workflow permissions
 * - GITHUB_REPO_OWNER: Repository owner (username or organization)
 * - GITHUB_REPO_NAME: Repository name
 * - GITHUB_REPO_BRANCH: Default branch (usually 'main' or 'develop')
 */

const githubConfig = {
  token: process.env.GITHUB_TOKEN || '',
  owner: process.env.GITHUB_REPO_OWNER || 'your-org',
  repo: process.env.GITHUB_REPO_NAME || 'your-repo',
  branch: process.env.GITHUB_REPO_BRANCH || 'main',
  apiUrl: 'https://api.github.com',
};

const githubApi = axios.create({
  baseURL: githubConfig.apiUrl,
  headers: {
    Authorization: `token ${githubConfig.token}`,
    Accept: 'application/vnd.github.v3+json',
  },
});

/**
 * Trigger a GitHub Actions workflow
 * @param {string} workflowFile - Workflow filename (e.g., 'test.yml')
 * @param {object} inputs - Workflow input variables
 * @returns {Promise<object>} Workflow run details
 */
const triggerWorkflow = async (workflowFile, inputs = {}) => {
  try {
    const response = await githubApi.post(
      `/repos/${githubConfig.owner}/${githubConfig.repo}/actions/workflows/${workflowFile}/dispatches`,
      {
        ref: githubConfig.branch,
        inputs,
      }
    );

    return {
      status: 'triggered',
      statusCode: response.status,
      message: 'Workflow triggered successfully',
    };
  } catch (error) {
    throw new Error(`Failed to trigger workflow: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Get workflow run details
 * @param {number} runId - GitHub Actions run ID
 * @returns {Promise<object>} Run details
 */
const getWorkflowRun = async (runId) => {
  try {
    const response = await githubApi.get(
      `/repos/${githubConfig.owner}/${githubConfig.repo}/actions/runs/${runId}`
    );

    return {
      id: response.data.id,
      name: response.data.name,
      status: response.data.status,
      conclusion: response.data.conclusion,
      createdAt: response.data.created_at,
      updatedAt: response.data.updated_at,
      htmlUrl: response.data.html_url,
      headBranch: response.data.head_branch,
      headSha: response.data.head_sha,
      actor: response.data.actor?.login,
    };
  } catch (error) {
    throw new Error(`Failed to get workflow run: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Get logs for a specific workflow run
 * @param {number} runId - GitHub Actions run ID
 * @returns {Promise<string>} Log content
 */
const getWorkflowLogs = async (runId) => {
  try {
    const response = await githubApi.get(
      `/repos/${githubConfig.owner}/${githubConfig.repo}/actions/runs/${runId}/logs`,
      {
        responseType: 'arraybuffer',
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    // The response is a zip file, we'll return it as-is
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get workflow logs: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Get job logs for a workflow run
 * @param {number} runId - GitHub Actions run ID
 * @returns {Promise<array>} Array of job logs
 */
const getJobLogs = async (runId) => {
  try {
    const response = await githubApi.get(
      `/repos/${githubConfig.owner}/${githubConfig.repo}/actions/runs/${runId}/jobs`
    );

    const jobs = response.data.jobs || [];
    const jobLogs = [];

    for (const job of jobs) {
      try {
        const logsResponse = await githubApi.get(
          `/repos/${githubConfig.owner}/${githubConfig.repo}/actions/jobs/${job.id}/logs`,
          {
            responseType: 'text',
          }
        );

        jobLogs.push({
          jobId: job.id,
          jobName: job.name,
          status: job.status,
          conclusion: job.conclusion,
          startedAt: job.started_at,
          completedAt: job.completed_at,
          logs: logsResponse.data,
        });
      } catch (logError) {
        jobLogs.push({
          jobId: job.id,
          jobName: job.name,
          status: job.status,
          conclusion: job.conclusion,
          error: 'Failed to retrieve logs',
        });
      }
    }

    return jobLogs;
  } catch (error) {
    throw new Error(`Failed to get job logs: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Get recent workflow runs
 * @param {number} limit - Number of runs to retrieve
 * @returns {Promise<array>} Array of workflow runs
 */
const getRecentRuns = async (limit = 10) => {
  try {
    const response = await githubApi.get(
      `/repos/${githubConfig.owner}/${githubConfig.repo}/actions/runs`,
      {
        params: {
          per_page: limit,
        },
      }
    );

    return response.data.workflow_runs.map((run) => ({
      id: run.id,
      name: run.name,
      status: run.status,
      conclusion: run.conclusion,
      createdAt: run.created_at,
      updatedAt: run.updated_at,
      htmlUrl: run.html_url,
      actor: run.actor?.login,
      branch: run.head_branch,
    }));
  } catch (error) {
    throw new Error(`Failed to get recent runs: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Get workflows available in repository
 * @returns {Promise<array>} Array of available workflows
 */
const getAvailableWorkflows = async () => {
  try {
    const response = await githubApi.get(
      `/repos/${githubConfig.owner}/${githubConfig.repo}/actions/workflows`
    );

    return response.data.workflows.map((workflow) => ({
      id: workflow.id,
      name: workflow.name,
      path: workflow.path,
      state: workflow.state,
    }));
  } catch (error) {
    throw new Error(`Failed to get workflows: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Cancel a workflow run
 * @param {number} runId - GitHub Actions run ID
 * @returns {Promise<object>} Cancel confirmation
 */
const cancelWorkflowRun = async (runId) => {
  try {
    await githubApi.post(
      `/repos/${githubConfig.owner}/${githubConfig.repo}/actions/runs/${runId}/cancel`
    );

    return {
      status: 'cancelled',
      message: 'Workflow run cancelled successfully',
    };
  } catch (error) {
    throw new Error(`Failed to cancel workflow: ${error.response?.data?.message || error.message}`);
  }
};

module.exports = {
  triggerWorkflow,
  getWorkflowRun,
  getWorkflowLogs,
  getJobLogs,
  getRecentRuns,
  getAvailableWorkflows,
  cancelWorkflowRun,
  githubConfig,
};
