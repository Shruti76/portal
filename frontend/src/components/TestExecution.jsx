import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Play, Loader, AlertCircle, CheckCircle } from 'lucide-react';

export const TestExecution = ({ packageId, packageName, packageType }) => {
  const { api } = useAuth();
  const [testRunId, setTestRunId] = useState(null);
  const [testStatus, setTestStatus] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (packageId) {
      fetchTestHistory();
      if (testRunId) {
        const interval = setInterval(() => {
          checkTestStatus(testRunId);
        }, 2000);
        return () => clearInterval(interval);
      }
    }
  }, [packageId, testRunId]);

  const fetchTestHistory = async () => {
    try {
      const response = await api.get(`/tests/package/${packageId}/history`);
      setHistory(response.data.history);
    } catch (err) {
      console.error('Failed to fetch test history');
    }
  };

  const executeTests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/tests/execute', {
        packageId,
        packageName,
        packageType,
        packagePath: `/tmp/${packageName}`,
      });
      setTestRunId(response.data.testRunId);
      setTestStatus('running');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to execute tests');
      setLoading(false);
    }
  };

  const checkTestStatus = async (runId) => {
    try {
      const response = await api.get(`/tests/results/${runId}`);
      setTestResults(response.data);
      setTestStatus(response.data.status);
      if (response.data.status !== 'running') {
        setLoading(false);
        fetchTestHistory();
      }
    } catch (err) {
      console.error('Failed to check test status');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Play className="w-6 h-6" />
        Unit Tests
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <button
        onClick={executeTests}
        disabled={loading || testStatus === 'running'}
        className="mb-6 bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Running Tests...
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Execute Tests
          </>
        )}
      </button>

      {testResults && (
        <div className="mb-6 p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            {testResults.status === 'passed' ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600" />
            )}
            <h3 className="text-lg font-semibold">
              Test Status: <span className={testResults.status === 'passed' ? 'text-green-600' : 'text-red-600'}>
                {testResults.status.toUpperCase()}
              </span>
            </h3>
          </div>
          <div className="bg-gray-50 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
            {testResults.output && (
              <>
                <p className="font-bold mb-2">Output:</p>
                <p className="text-gray-700 whitespace-pre-wrap">{testResults.output}</p>
              </>
            )}
            {testResults.error_output && (
              <>
                <p className="font-bold mb-2 mt-4">Errors:</p>
                <p className="text-red-700 whitespace-pre-wrap">{testResults.error_output}</p>
              </>
            )}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Test History</h3>
          <div className="space-y-2">
            {history.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Run #{test.id}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(test.created_at).toLocaleString()} - Executed by {test.full_name}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  test.status === 'passed'
                    ? 'bg-green-100 text-green-800'
                    : test.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {test.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestExecution;
