import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, AlertCircle, CheckCircle, Loader, Info } from 'lucide-react';

export const PackageUpload = () => {
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    packageName: '',
    version: '',
    description: '',
    packageType: 'python',
    file: null,
    dependencies: '',
  });
  const [showExamples, setShowExamples] = useState(false);

  const pythonExamples = [
    {
      name: 'numpy',
      version: '1.24.0',
      description: 'NumPy is a fundamental package for scientific computing',
      dependencies: [
        { name: 'python-dateutil', version: '^2.8.0' },
        { name: 'pytz', version: '^2021.3' },
      ],
    },
    {
      name: 'pandas',
      version: '2.0.0',
      description: 'Powerful data structures for data analysis and manipulation',
      dependencies: [
        { name: 'numpy', version: '^1.20.0' },
        { name: 'python-dateutil', version: '^2.8.0' },
      ],
    },
    {
      name: 'requests',
      version: '2.31.0',
      description: 'HTTP library for Python',
      dependencies: [
        { name: 'charset-normalizer', version: '^2.0.0' },
        { name: 'idna', version: '^3.0' },
      ],
    },
    {
      name: 'flask',
      version: '3.0.0',
      description: 'Web framework for building REST APIs',
      dependencies: [
        { name: 'werkzeug', version: '^2.3.0' },
        { name: 'click', version: '^8.0.0' },
      ],
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const loadExample = (example) => {
    setFormData({
      ...formData,
      packageName: `${user?.organization || 'myorg'}@${example.name}`,
      version: example.version,
      description: example.description,
      dependencies: JSON.stringify(example.dependencies),
    });
    setShowExamples(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.packageName || !formData.version || !formData.file) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('packageName', formData.packageName);
      form.append('version', formData.version);
      form.append('description', formData.description);
      form.append('packageType', formData.packageType);
      form.append('file', formData.file);
      if (formData.dependencies) {
        form.append('dependencies', formData.dependencies);
      }

      const response = await api.post('/packages/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(`Package ${formData.packageName} v${formData.version} uploaded successfully!`);
      setFormData({
        packageName: '',
        version: '',
        description: '',
        packageType: 'python',
        file: null,
        dependencies: '',
      });
      document.getElementById('fileInput').value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Upload className="w-6 h-6" />
        Upload Package
      </h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-900 mb-1">Package Name Format</h3>
          <p className="text-sm text-blue-800">
            Use the format <code className="bg-blue-100 px-2 py-1 rounded">myorg@packagename</code>
            <br />
            Example: <code className="bg-blue-100 px-2 py-1 rounded">techcorp@numpy</code> (version 1.24.0)
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Package Name *
            </label>
            <input
              type="text"
              name="packageName"
              value={formData.packageName}
              onChange={handleInputChange}
              placeholder="e.g., myorg@numpy"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Version *
            </label>
            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleInputChange}
              placeholder="e.g., 1.24.0"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Brief description of the package"
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Package Type
          </label>
          <select
            name="packageType"
            value={formData.packageType}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="python">Python</option>
            <option value="nodejs">Node.js</option>
            <option value="java">Java</option>
            <option value="dotnet">.NET</option>
            <option value="go">Go</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Dependencies (JSON)
          </label>
          <textarea
            name="dependencies"
            value={formData.dependencies}
            onChange={handleInputChange}
            placeholder="[{&quot;name&quot;: &quot;numpy&quot;, &quot;version&quot;: &quot;^1.20.0&quot;}]"
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
          />
          <p className="text-xs text-gray-500 mt-1">
            Example: [{`{name: &quot;numpy&quot;, version: &quot;^1.20.0&quot;}`}, {`{name: &quot;pandas&quot;, version: &quot;~2.0.0&quot;}`}]
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Package File *
          </label>
          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            accept=".tar.gz,.zip,.jar,.whl,.tgz"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: .tar.gz, .zip, .jar, .whl, .tgz (Max 100MB)
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Package
            </>
          )}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="w-full text-left font-semibold text-gray-800 flex items-center justify-between mb-4 hover:text-blue-600"
        >
          <span>📦 Python Module Examples</span>
          <span>{showExamples ? '▼' : '▶'}</span>
        </button>

        {showExamples && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Click any example to pre-fill the form with real Python package details.
            </p>
            {pythonExamples.map((example, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{example.name} v{example.version}</h4>
                    <p className="text-sm text-gray-600 mt-1">{example.description}</p>
                    {example.dependencies.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-xs font-medium text-gray-500">Requires:</span>
                        {example.dependencies.map((dep, didx) => (
                          <span key={didx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {dep.name} ({dep.version})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => loadExample(example)}
                    className="ml-4 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 whitespace-nowrap"
                  >
                    Use Example
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-2">📋 Version Restriction Examples</h3>
        <div className="space-y-2 text-sm text-gray-700 font-mono">
          <p>
            <span className="text-blue-600">^1.24.0</span> - Compatible with 1.24.0+ (major version match)
          </p>
          <p>
            <span className="text-blue-600">~2.0.0</span> - Approximately 2.0.0 (minor version match)
          </p>
          <p>
            <span className="text-blue-600">&gt;=2.5.1</span> - Greater than or equal to 2.5.1
          </p>
          <p>
            <span className="text-blue-600">2.0.0</span> - Exact version match
          </p>
        </div>
      </div>
    </div>
  );
};

export default PackageUpload;
