import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Download, AlertCircle, Loader, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

export const PackageDownload = () => {
  const { api } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [expandedPackage, setExpandedPackage] = useState(null);
  const [versionHistory, setVersionHistory] = useState({});

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async (query = '', type = '') => {
    setLoading(true);
    setError('');
    try {
      let url = '/packages/search?q=' + (query || '');
      if (type) url += '&type=' + type;
      const response = await api.get(url);
      setPackages(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async (packageName) => {
    try {
      if (versionHistory[packageName]) {
        setVersionHistory({ ...versionHistory, [packageName]: null });
        return;
      }

      const response = await api.get(`/packages/versions/${packageName}`);
      setVersionHistory({ ...versionHistory, [packageName]: response.data.versions });
    } catch (err) {
      setError('Failed to fetch version history');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPackages(searchQuery, selectedType);
  };

  const handleDownload = async (packageName, version) => {
    try {
      const response = await api.get(`/packages/download/${packageName}/${version}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${packageName}-${version}.tar.gz`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      if (err.response?.status === 409) {
        setError(`Version conflict: ${err.response.data.error}. Required: ${JSON.stringify(err.response.data.required)}`);
      } else {
        setError('Failed to download package');
      }
    }
  };

  const renderDependencies = (pkg) => {
    try {
      const deps = pkg.dependencies ? JSON.parse(pkg.dependencies) : [];
      if (deps.length === 0) return null;

      return (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">Dependencies:</p>
          <div className="flex flex-wrap gap-2">
            {deps.map((dep, idx) => (
              <span key={idx} className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded border border-orange-200">
                {dep.name || dep} {dep.version && `(${dep.version})`}
              </span>
            ))}
          </div>
        </div>
      );
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Download className="w-6 h-6" />
        Package Repository
      </h2>

      <form onSubmit={handleSearch} className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search packages (e.g., myorg@pandas, myorg@numpy)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="python">Python</option>
            <option value="nodejs">Node.js</option>
            <option value="java">Java</option>
            <option value="dotnet">.NET</option>
            <option value="go">Go</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <p>No packages found. Try searching with different keywords.</p>
          <p className="text-sm mt-2">Example: myorg@numpy, myorg@pandas, myorg@requests</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-800">{pkg.name}</h3>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {pkg.package_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{pkg.description || 'No description'}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium whitespace-nowrap ml-4">
                  v{pkg.version}
                </span>
              </div>

              <div className="flex gap-4 text-sm text-gray-600 mb-4">
                <span>📊 {pkg.downloads} downloads</span>
                <span>📅 {new Date(pkg.created_at).toLocaleDateString()}</span>
              </div>

              {renderDependencies(pkg)}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleDownload(pkg.name, pkg.version)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => fetchVersions(pkg.name)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 flex items-center gap-2"
                >
                  {versionHistory[pkg.name] ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Versions
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show All Versions
                    </>
                  )}
                </button>
              </div>

              {versionHistory[pkg.name] && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Version History:</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {versionHistory[pkg.name].map((v, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded text-sm flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-800">v{v.version}</span>
                          <span className="text-gray-500 text-xs ml-2">
                            {new Date(v.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDownload(pkg.name, v.version)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PackageDownload;
