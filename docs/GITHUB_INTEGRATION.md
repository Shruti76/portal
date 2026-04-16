# GitHub Integration Guide

## Overview

The Developer Portal can integrate with GitHub to automatically push code and create pull requests after successful test execution.

## Setup

### 1. Generate GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token"
3. Select scopes:
   - `repo` (full control of private repositories)
   - `workflow` (update GitHub Action workflows)
4. Copy the token

### 2. Configure Environment

Add to `backend/.env`:
```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_USERNAME=your_github_username
GITHUB_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Setup Webhook

In GitHub repository:
1. Settings → Webhooks → Add webhook
2. Payload URL: `http://your-domain/api/webhooks/github`
3. Content type: `application/json`
4. Secret: (set `GITHUB_WEBHOOK_SECRET`)
5. Events: Push, Pull request

## API Implementation

### Update Tests Router

Add this endpoint to `backend/src/routes/tests.js`:

```javascript
const github = require('@octokit/rest');

// Initialize GitHub client
const githubClient = new github.Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// After test completion, push to GitHub
async function pushToGitHub(testResults) {
  try {
    const { repo, owner, branch, filePath } = testResults.githubConfig;

    // Get file SHA
    const file = await githubClient.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: branch,
    });

    // Update file with test results
    await githubClient.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `Update with test results: ${testResults.status}`,
      content: Buffer.from(testResults.output).toString('base64'),
      sha: file.data.sha,
      branch,
    });

    // Create pull request if specified
    if (testResults.createPR) {
      await githubClient.pulls.create({
        owner,
        repo,
        title: `Test Results: ${testResults.packageName}`,
        body: `Test Status: ${testResults.status}\n\n${testResults.output}`,
        head: branch,
        base: 'main',
      });
    }

    return { success: true, message: 'Pushed to GitHub' };
  } catch (error) {
    console.error('GitHub push failed:', error);
    return { success: false, error: error.message };
  }
}
```

## Webhook Handler

Add to `backend/src/routes/webhooks.js`:

```javascript
const express = require('express');
const crypto = require('crypto');

const router = express.Router();

// Verify GitHub webhook signature
function verifySignature(req) {
  const signature = req.get('x-hub-signature-256');
  const body = JSON.stringify(req.body);
  const hash = crypto
    .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return `sha256=${hash}` === signature;
}

// Handle GitHub webhook
router.post('/github', (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { action, pull_request } = req.body;

  if (action === 'opened' && pull_request) {
    // Handle pull request opened
    console.log(`New PR opened: ${pull_request.title}`);
    // Trigger automated tests here
  }

  res.json({ status: 'received' });
});

module.exports = router;
```

## Workflow Example

1. **Developer uploads package** → Portal stores it
2. **Tests are executed** → Automatically
3. **If tests pass** → Code pushed to GitHub feature branch
4. **Pull request created** → With test results
5. **Code review** → Team reviews PR
6. **Merge** → Updates main branch

## Configuration in Upload

When uploading package, provide GitHub details:

```json
{
  "packageName": "myorg@package",
  "version": "1.0.0",
  "packageType": "nodejs",
  "githubConfig": {
    "owner": "your-username",
    "repo": "your-repo",
    "branch": "feature/new-feature",
    "filePath": "src/index.js",
    "createPR": true
  }
}
```

## Security Considerations

- Keep GitHub token secure (use environment variables)
- Never commit tokens to git
- Use token rotation regularly
- Limit token scopes to minimum needed
- Validate webhook signatures
- Use branch protection rules

## Troubleshooting

### Token Issues
```bash
# Test token validity
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

### Webhook Not Triggering
1. Check GitHub webhook delivery logs
2. Verify secret matches
3. Check firewall/network access
4. Review application logs

### PR Creation Fails
1. Verify branch exists
2. Check permissions on token
3. Verify branch protection rules
4. Check commit status requirements

## References

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Octokit.js Library](https://octokit.github.io/rest.js/)
- [GitHub Webhooks](https://docs.github.com/en/developers/webhooks-and-events/webhooks)
