import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Upload, Download, Play, Users, LogOut, Package, Code, GitBranch, Settings } from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const features = [
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Code Editor (IDE)',
      description: 'VS Code-like IDE with full code editing capabilities',
      link: '/editor',
      roles: ['developer', 'maintainer', 'admin'],
    },
    {
      icon: <GitBranch className="w-8 h-8" />,
      title: 'Workflow Logs',
      description: 'Trigger GitHub Actions and view real-time logs',
      link: '/workflows',
      roles: ['developer', 'maintainer', 'admin'],
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: 'Upload Package',
      description: 'Upload versioned packages with format myorg@package',
      link: '/upload',
      roles: ['maintainer', 'admin'],
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: 'Download Package',
      description: 'Search and download packages from the repository',
      link: '/download',
      roles: ['developer', 'maintainer', 'admin', 'viewer'],
    },
    {
      icon: <Play className="w-8 h-8" />,
      title: 'Execute Tests',
      description: 'Run unit tests for Java, Python, Node.js, .NET, and Go',
      link: '/tests',
      roles: ['developer', 'maintainer', 'admin'],
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Role Management',
      description: 'Manage user roles and permissions',
      link: '/rbac',
      roles: ['admin'],
    },
  ];

  const availableFeatures = features.filter(f => f.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Developer Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-gray-900">{user?.full_name}</p>
              <p className="text-sm text-gray-600">{user?.organization} • {user?.role}</p>
            </div>
            <Link
              to="/settings"
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 flex items-center gap-2 transition"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Developer Portal</h2>
          <p className="text-gray-600">Manage packages, execute tests, and collaborate with your team</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {availableFeatures.map((feature) => (
            <Link
              key={feature.link}
              to={feature.link}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition transform hover:scale-105 cursor-pointer"
            >
              <div className="text-blue-600 mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </Link>
          ))}
        </div>

        {/* Statistics */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium">Organization</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{user?.organization}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium">Role</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{user?.role.toUpperCase()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium">Member Since</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Start Guide</h3>
          <ol className="space-y-2 text-blue-800">
            <li><strong>1. Upload:</strong> Upload your packaged code (tar.gz, zip, jar, whl)</li>
            <li><strong>2. Version:</strong> Each upload automatically gets versioned (e.g., myorg@package v1.0.0)</li>
            <li><strong>3. Share:</strong> Share package name with your team for downloading</li>
            <li><strong>4. Test:</strong> Execute unit tests automatically based on package type</li>
            <li><strong>5. Manage:</strong> Control access with role-based permissions</li>
          </ol>
        </div>

        {/* Package Types Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-semibold text-gray-900 mb-3">Supported Package Types</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Node.js (npm/yarn)</li>
              <li>✓ Python (pip/setuptools)</li>
              <li>✓ Java (Maven/Gradle)</li>
              <li>✓ .NET (C#/F#)</li>
              <li>✓ Go</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-semibold text-gray-900 mb-3">User Roles</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>👤 <strong>Admin:</strong> Full access</li>
              <li>🔧 <strong>Maintainer:</strong> Upload & manage packages</li>
              <li>👨‍💻 <strong>Developer:</strong> Download & test packages</li>
              <li>👁️ <strong>Viewer:</strong> Download & view only</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
