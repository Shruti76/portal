import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  Plus,
  Save,
  X,
  Play,
  Terminal,
  Settings,
  FileText,
  Code2,
  GitBranch,
  Share2,
} from 'lucide-react';
import './IDEEditor.css';

const IDEEditor = () => {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [code, setCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [openTabs, setOpenTabs] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState(false);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/editor/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const createProject = async () => {
    if (!projectName.trim()) {
      setMessage('Project name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/editor/projects', {
        name: projectName,
        language,
        description: `${language} project`,
      });

      setProjects([response.data, ...projects]);
      setSelectedProject(response.data);
      setCode('');
      setProjectName('');
      setNewProjectForm(false);
      setMessage('Project created successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const openProject = async (project) => {
    try {
      const response = await api.get(`/editor/projects/${project.id}`);
      setSelectedProject(response.data);
      setCode(response.data.code || '');
      setLanguage(response.data.language);

      // Add to open tabs
      if (!openTabs.find((t) => t.id === project.id)) {
        setOpenTabs([...openTabs, { id: project.id, name: project.name }]);
      }
      setSelectedFile(project.id);
    } catch (error) {
      setMessage('Failed to load project');
    }
  };

  const saveProject = async () => {
    if (!selectedProject) {
      setMessage('No project selected');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/editor/projects/${selectedProject.id}`, {
        code,
        name: selectedProject.name,
      });

      setSelectedProject(response.data);
      setMessage('✓ Saved');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const closeTab = (projectId) => {
    const newTabs = openTabs.filter((t) => t.id !== projectId);
    setOpenTabs(newTabs);
    if (selectedFile === projectId) {
      if (newTabs.length > 0) {
        setSelectedFile(newTabs[newTabs.length - 1].id);
        const project = projects.find((p) => p.id === newTabs[newTabs.length - 1].id);
        if (project) openProject(project);
      } else {
        setSelectedFile(null);
        setSelectedProject(null);
        setCode('');
      }
    }
  };

  const languages = ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'csharp', 'sql'];

  const getLanguageIcon = (lang) => {
    const icons = {
      javascript: '🟨',
      typescript: '🔵',
      python: '🐍',
      java: '☕',
      go: '🐹',
      rust: '🦀',
      csharp: '#',
      sql: '📊',
    };
    return icons[lang] || '📄';
  };

  return (
    <div className="ide-container">
      {/* Header */}
      <header className="ide-header">
        <div className="header-left">
          <button
            className="toggle-sidebar-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title="Toggle sidebar"
          >
            <ChevronRight size={20} />
          </button>
          <h1 className="ide-title">
            Code Editor
            {selectedProject && <span className="project-indicator">• {selectedProject.name}</span>}
          </h1>
        </div>
        <div className="header-right">
          <button className="header-btn" title="GitHub">
            <GitBranch size={18} />
          </button>
          <button className="header-btn" title="Share">
            <Share2 size={18} />
          </button>
          <button className="header-btn" title="Settings">
            <Settings size={18} />
          </button>
        </div>
      </header>

      <div className="ide-main">
        {/* Sidebar */}
        <aside className={`ide-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <h2>Explorer</h2>
            <button
              className="sidebar-action-btn"
              onClick={() => setNewProjectForm(!newProjectForm)}
              title="New Project"
            >
              <Plus size={16} />
            </button>
          </div>

          {newProjectForm && (
            <div className="new-project-form">
              <input
                type="text"
                placeholder="Project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="form-input"
                autoFocus
              />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="form-select"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <div className="form-buttons">
                <button
                  onClick={createProject}
                  disabled={loading}
                  className="btn-primary-sm"
                >
                  Create
                </button>
                <button
                  onClick={() => setNewProjectForm(false)}
                  className="btn-secondary-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="projects-tree">
            {projects.length === 0 ? (
              <div className="empty-state">
                <Folder size={32} />
                <p>No projects yet</p>
                <button
                  onClick={() => setNewProjectForm(true)}
                  className="btn-primary-sm"
                >
                  Create Project
                </button>
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className={`project-node ${selectedProject?.id === project.id ? 'active' : ''}`}
                >
                  <div
                    className="project-node-header"
                    onClick={() => openProject(project)}
                  >
                    <ChevronRight size={16} />
                    <Folder size={16} />
                    <span className="project-name">{project.name}</span>
                    <span className="project-language">{getLanguageIcon(project.language)}</span>
                  </div>
                  {selectedProject?.id === project.id && (
                    <div className="project-files">
                      <div className="file-item">
                        <FileText size={14} />
                        <span>{project.name}.{project.language === 'typescript' ? 'ts' : project.language === 'python' ? 'py' : project.language === 'java' ? 'java' : project.language === 'go' ? 'go' : project.language === 'rust' ? 'rs' : project.language === 'csharp' ? 'cs' : project.language === 'sql' ? 'sql' : 'js'}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">{user?.full_name?.charAt(0)}</div>
              <div className="user-details">
                <div className="user-name">{user?.full_name}</div>
                <div className="user-role">{user?.role}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Editor */}
        <main className="ide-editor-main">
          {selectedProject ? (
            <>
              {/* Tabs */}
              <div className="editor-tabs">
                {openTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`editor-tab ${selectedFile === tab.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedFile(tab.id);
                      const project = projects.find((p) => p.id === tab.id);
                      if (project) openProject(project);
                    }}
                  >
                    <FileText size={14} />
                    <span>{tab.name}</span>
                    <button
                      className="tab-close"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Editor Toolbar */}
              <div className="editor-toolbar">
                <div className="toolbar-left">
                  <span className="file-path">
                    {selectedProject.name}.
                    {selectedProject.language === 'typescript' ? 'ts' : selectedProject.language === 'python' ? 'py' : selectedProject.language === 'java' ? 'java' : selectedProject.language === 'go' ? 'go' : selectedProject.language === 'rust' ? 'rs' : selectedProject.language === 'csharp' ? 'cs' : selectedProject.language === 'sql' ? 'sql' : 'js'}
                  </span>
                </div>
                <div className="toolbar-right">
                  <button
                    onClick={saveProject}
                    disabled={loading}
                    className="toolbar-btn save-btn"
                    title="Save (Ctrl+S)"
                  >
                    <Save size={16} />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button className="toolbar-btn" title="Run">
                    <Play size={16} />
                    Run
                  </button>
                </div>
              </div>

              {/* Code Editor */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="code-editor"
                spellCheck="false"
                placeholder="Start coding..."
              />

              {/* Terminal */}
              {terminalOpen && (
                <div className="terminal-panel">
                  <div className="terminal-header">
                    <Terminal size={14} />
                    <span>Terminal</span>
                    <button
                      className="terminal-close"
                      onClick={() => setTerminalOpen(false)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="terminal-content">
                    $ Project ready for execution
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="editor-empty">
              <Code2 size={48} />
              <h2>Welcome to Code Editor</h2>
              <p>Create a new project or open an existing one to start coding</p>
              <button
                onClick={() => setNewProjectForm(true)}
                className="btn-primary"
              >
                <Plus size={16} />
                Create New Project
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Message Notification */}
      {message && (
        <div className={`notification ${message.includes('Failed') ? 'error' : ''}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default IDEEditor;
