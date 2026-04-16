import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CodeEditor.css';

const CodeEditor = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [code, setCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  // Fetch projects on mount
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
      setMessage('Project created successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const openProject = async (projectId) => {
    try {
      const response = await api.get(`/editor/projects/${projectId}`);
      setSelectedProject(response.data);
      setCode(response.data.code || '');
      setProjectName(response.data.name);
      setLanguage(response.data.language);
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
        name: projectName,
      });

      setSelectedProject(response.data);
      setMessage('Project saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await api.delete(`/editor/projects/${projectId}`);
      setProjects(projects.filter((p) => p.id !== projectId));
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
        setCode('');
      }
      setMessage('Project deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to delete project');
    }
  };

  const languages = ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'csharp', 'sql'];

  return (
    <div className="code-editor-container">
      <div className="editor-sidebar">
        <h3>Projects</h3>
        
        <div className="new-project-form">
          <input
            type="text"
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="input-field"
          />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="select-field"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <button
            onClick={createProject}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Creating...' : 'New Project'}
          </button>
        </div>

        <div className="projects-list">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`project-item ${selectedProject?.id === project.id ? 'active' : ''}`}
            >
              <div className="project-info" onClick={() => openProject(project.id)}>
                <div className="project-name">{project.name}</div>
                <div className="project-language">{project.language}</div>
              </div>
              <button
                className="btn-delete"
                onClick={() => deleteProject(project.id)}
                title="Delete project"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="editor-main">
        {selectedProject ? (
          <>
            <div className="editor-toolbar">
              <h2>{selectedProject.name}</h2>
              <button onClick={saveProject} disabled={loading} className="btn btn-success">
                {loading ? 'Saving...' : 'Save Project'}
              </button>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="code-textarea"
              placeholder="Write your code here..."
            />
          </>
        ) : (
          <div className="editor-empty">
            <p>Select a project or create a new one to start coding</p>
          </div>
        )}
      </div>

      {message && <div className="notification">{message}</div>}
    </div>
  );
};

export default CodeEditor;
