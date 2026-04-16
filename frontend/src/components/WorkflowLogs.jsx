import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WorkflowLogs.css';

const WorkflowLogs = ({ projectId }) => {
  const [executions, setExecutions] = useState([]);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  // Fetch workflows and execution history
  useEffect(() => {
    fetchWorkflows();
    if (projectId) {
      fetchExecutionHistory();
    }
  }, [projectId]);

  // Auto-refresh logs
  useEffect(() => {
    let interval;
    if (autoRefresh && selectedExecution) {
      interval = setInterval(() => {
        if (selectedExecution.status === 'running') {
          fetchLogs(selectedExecution.id);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [selectedExecution, autoRefresh]);

  const fetchWorkflows = async () => {
    try {
      const response = await api.get('/workflows/workflows');
      setWorkflows(response.data);
      if (response.data.length > 0) {
        setSelectedWorkflow(response.data[0].path);
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    }
  };

  const fetchExecutionHistory = async () => {
    if (!projectId) return;
    try {
      const response = await api.get(`/workflows/projects/${projectId}/executions`);
      setExecutions(response.data.executions);
    } catch (error) {
      console.error('Failed to fetch execution history:', error);
    }
  };

  const triggerWorkflow = async () => {
    if (!selectedWorkflow || !projectId) {
      setMessage('Please select a workflow and project');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/workflows/execute', {
        workflowFile: selectedWorkflow,
        projectId,
        inputs: {
          triggerTime: new Date().toISOString(),
        },
      });

      setExecutions([response.data.execution, ...executions]);
      setSelectedExecution(response.data.execution);
      setMessage('Workflow triggered successfully');
      setTimeout(() => setMessage(''), 3000);

      // Fetch logs after a short delay
      setTimeout(() => fetchLogs(response.data.execution.id), 2000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to trigger workflow');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (executionId) => {
    try {
      const response = await api.get(`/workflows/executions/${executionId}/logs`);
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const selectExecution = async (execution) => {
    setSelectedExecution(execution);
    await fetchLogs(execution.id);
  };

  const cancelExecution = async (executionId) => {
    if (!window.confirm('Are you sure you want to cancel this execution?')) return;

    try {
      await api.post(`/workflows/executions/${executionId}/cancel`);
      setMessage('Execution cancelled successfully');
      fetchExecutionHistory();
    } catch (error) {
      setMessage('Failed to cancel execution');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      triggered: 'badge-info',
      running: 'badge-warning',
      completed: 'badge-success',
      failed: 'badge-danger',
      cancelled: 'badge-secondary',
    };
    return statusMap[status] || 'badge-secondary';
  };

  return (
    <div className="workflow-logs-container">
      <div className="logs-sidebar">
        <h3>Workflows & Executions</h3>

        <div className="workflow-trigger">
          <select
            value={selectedWorkflow}
            onChange={(e) => setSelectedWorkflow(e.target.value)}
            className="select-field"
          >
            <option value="">Select a workflow</option>
            {workflows.map((workflow) => (
              <option key={workflow.id} value={workflow.path}>
                {workflow.name}
              </option>
            ))}
          </select>
          <button
            onClick={triggerWorkflow}
            disabled={loading || !selectedWorkflow}
            className="btn btn-primary"
          >
            {loading ? 'Triggering...' : 'Trigger Workflow'}
          </button>
        </div>

        <div className="refresh-toggle">
          <label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh logs
          </label>
        </div>

        <h4>Execution History</h4>
        <div className="executions-list">
          {executions.length === 0 ? (
            <p className="empty-message">No executions yet</p>
          ) : (
            executions.map((execution) => (
              <div
                key={execution.id}
                className={`execution-item ${selectedExecution?.id === execution.id ? 'active' : ''}`}
                onClick={() => selectExecution(execution)}
              >
                <div className="execution-header">
                  <span className={`badge ${getStatusBadge(execution.status)}`}>
                    {execution.status}
                  </span>
                </div>
                <div className="execution-details">
                  <div className="workflow-name">{execution.workflow_file}</div>
                  <div className="execution-time">
                    {formatDate(execution.created_at)}
                  </div>
                </div>
                {execution.status === 'running' && (
                  <button
                    className="btn-cancel"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelExecution(execution.id);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="logs-main">
        {selectedExecution ? (
          <>
            <div className="logs-header">
              <h2>Execution Logs</h2>
              <div className="execution-status">
                <span className={`badge ${getStatusBadge(selectedExecution.status)}`}>
                  {selectedExecution.status}
                </span>
                <span className="execution-id">{selectedExecution.id.substring(0, 8)}</span>
              </div>
            </div>

            <div className="logs-content">
              {logs.length === 0 ? (
                <div className="logs-empty">
                  <p>No logs available yet. Logs will appear here once the workflow starts running.</p>
                </div>
              ) : (
                logs.map((job, jobIndex) => (
                  <div key={jobIndex} className="job-logs">
                    <h4 className="job-name">
                      {job.jobName}
                      <span className={`badge ${getStatusBadge(job.status)}`}>
                        {job.status}
                      </span>
                    </h4>
                    <pre className="log-output">
                      {job.logs ? (
                        job.logs
                      ) : (
                        <span className="log-error">Failed to retrieve logs: {job.error}</span>
                      )}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="logs-empty">
            <p>Select an execution to view logs</p>
          </div>
        )}
      </div>

      {message && <div className="notification">{message}</div>}
    </div>
  );
};

export default WorkflowLogs;
