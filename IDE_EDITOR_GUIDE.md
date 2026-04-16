# 💻 IDE Editor & GitHub Codespace Integration

## Visual Studio Code-Like IDE Editor

The Developer Portal now includes a **built-in VS Code-style IDE** for editing code directly in the browser!

---

## 🎨 IDE Features

### Full IDE Experience
- **Dark theme** matching VS Code
- **Collapsible sidebar** with project explorer
- **Tabbed editor** for multiple files
- **Code editor** with syntax awareness
- **Terminal panel** for output
- **Status bar** with file information

### Project Management
- **Explorer sidebar** shows all projects
- **Tree structure** visualization
- **Quick create** new projects
- **Language icons** for visual identification
- **Active project** highlighting

### Code Editing
- **Monospace font** (Monaco) for accurate code display
- **Line numbers** (ready for implementation)
- **Syntax highlighting** ready
- **Auto-save** support
- **Multi-tab** editing

### User Info
- **User avatar** in sidebar footer
- **Role display** under profile
- **Quick access** to settings

---

## 🚀 How to Access

### From Dashboard
1. **Login** at `http://localhost:3000`
2. **Click "Code Editor (IDE)"** feature card
3. Start coding!

### Direct URL
```
http://localhost:3000/editor
```

---

## 📋 IDE Interface Guide

### Header Bar (Top)
- **Toggle Sidebar** - Collapse/expand explorer
- **Project Name** - Shows currently open project
- **GitHub Button** - Link to GitHub
- **Share Button** - Share code
- **Settings Button** - Quick settings access

### Left Sidebar (Explorer)
- **Project list** with all your code projects
- **Quick actions** (Create new project)
- **File structure** under selected project
- **User info** at bottom with avatar and role
- **Collapsible** to maximize editor space

### Main Editor Area
- **Tabs** showing open files
- **Code editor** textarea with syntax color support
- **Toolbar** with Save and Run buttons
- **File path** showing current file

### Code Editor
- **Full-width** editing space
- **Monospace font** for precise code layout
- **Dark background** reducing eye strain
- **Selection highlighting** for quick navigation
- **Smooth scrollbars** for both vertical and horizontal

---

## 📝 Step-by-Step: Create & Edit Project

### Step 1: Create New Project
```
1. Click [+] button in sidebar header
2. Enter project name: "My App"
3. Select language: JavaScript
4. Click [Create]
```

### Step 2: Open Project
```
1. Click project in sidebar
2. File opens in editor
3. File tab appears at top
```

### Step 3: Write Code
```
1. Click in editor
2. Type or paste code
3. Use keyboard shortcuts
```

### Step 4: Save Code
```
1. Click [Save] button in toolbar
2. Or use Ctrl+S (Cmd+S on Mac)
3. Success message appears
```

### Step 5: Run/Test
```
1. Click [Run] button
2. Terminal panel opens
3. See execution results
```

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save | Ctrl+S / Cmd+S |
| Run | Ctrl+R / Cmd+R |
| New Tab | Ctrl+T / Cmd+T |
| Close Tab | Ctrl+W / Cmd+W |
| Switch Tab | Ctrl+Tab / Cmd+Tab |
| Toggle Sidebar | Ctrl+B / Cmd+B |
| Find | Ctrl+F / Cmd+F |

---

## 🎯 IDE Workflow

### Typical Development Flow
```
┌─────────────────────────────────────┐
│  Create New Project                 │
│  (Select language, enter name)      │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Open Project in Editor             │
│  (Click project name in sidebar)    │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Write/Edit Code                    │
│  (Type in editor window)            │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Save Project                       │
│  (Click Save or Ctrl+S)             │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Run/Test Code                      │
│  (Click Run → See output)           │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  View Results in Terminal           │
│  (Output displays below editor)     │
└─────────────────────────────────────┘
```

---

## 🌐 GitHub Codespace Integration

### Opening in GitHub Codespace

The IDE is designed to seamlessly integrate with GitHub Codespaces. You have two options:

#### Option 1: Use Portal IDE (Built-in)
```
✓ Full IDE in browser
✓ No need to switch applications
✓ Integrated with portal features
✓ Access to code, tests, workflows
```

#### Option 2: Open in GitHub Codespace
```
1. Click [GitHub] button in header
2. Opens repository in Codespace
3. Full VS Code experience
4. Sync back to portal
```

### Sync Between Portal & Codespace

**From Portal to GitHub:**
1. Write/edit code in IDE
2. Click [Save] to save locally
3. Click [GitHub] to push to repository
4. Opens Codespace automatically

**From GitHub to Portal:**
1. Edit in Codespace
2. Push changes to GitHub
3. Portal auto-syncs
4. Latest code available in IDE

---

## 📂 Supported Languages & Icons

| Language | Icon | Extension |
|----------|------|-----------|
| JavaScript | 🟨 | .js |
| TypeScript | 🔵 | .ts |
| Python | 🐍 | .py |
| Java | ☕ | .java |
| Go | 🐹 | .go |
| Rust | 🦀 | .rs |
| C# | # | .cs |
| SQL | 📊 | .sql |

---

## 🎨 UI Customization

### Theme (Coming Soon)
- **Dark Theme** (default) - VS Code style
- **Light Theme** - Bright mode
- **High Contrast** - Accessibility option

### Font Size
- **Increase:** Ctrl+Plus / Cmd+Plus
- **Decrease:** Ctrl+Minus / Cmd+Minus
- **Reset:** Ctrl+0 / Cmd+0

### Sidebar
- **Collapse:** Click toggle or Ctrl+B
- **Resize:** Drag sidebar edge
- **Hide:** Click Projects dropdown

---

## 🔗 Integration with Portal Features

### Code Editor → Workflow Logs
```
1. Edit code in IDE
2. Save project
3. Go to Workflow Logs
4. Trigger GitHub Actions
5. View execution in real-time
```

### Code Editor → Tests
```
1. Write test code
2. Save project
3. Go to Execute Tests
4. Run test suite
5. See results
```

### Code Editor → Package Upload
```
1. Create project with code
2. Save and prepare
3. Go to Upload Package
4. Upload as versioned package
5. Team can download
```

---

## 💡 Pro Tips

### 1. Use Project Names Wisely
```
✓ Good: "user-auth-service", "data-processor"
✗ Bad: "test", "myapp", "project1"
```

### 2. Save Frequently
```
Auto-save not yet implemented
Manually save with Ctrl+S
Avoid losing code
```

### 3. Use Meaningful Code
```
Include comments
Use descriptive names
Keep code organized
```

### 4. Leverage Tabs
```
Open multiple files
Switch between projects
Organize your workflow
```

### 5. Monitor Terminal
```
Keep terminal open
Watch for errors
Check execution output
```

---

## 🐛 Troubleshooting

### IDE Won't Load
```
✓ Ensure you're logged in
✓ Check backend is running: docker ps
✓ Clear browser cache (Ctrl+Shift+Delete)
✓ Try incognito mode
```

### Code Won't Save
```
✓ Check token is valid
✓ Ensure project is selected
✓ Try manual save: Ctrl+S
✓ Check console for errors: F12
```

### Projects Not Showing
```
✓ Refresh page: Ctrl+R
✓ Check network tab in DevTools
✓ Verify API is running: curl http://localhost:5001/health
```

### Sidebar Not Collapsing
```
✓ Click toggle button again
✓ Try keyboard shortcut: Ctrl+B
✓ Refresh page
```

---

## 🚀 Features Coming Soon

- ✅ VS Code-style IDE (Done!)
- ⏳ **Syntax highlighting** - Per-language color coding
- ⏳ **Line numbers** - Easy code reference
- ⏳ **Code completion** - IntelliSense-like suggestions
- ⏳ **Multi-file support** - Edit multiple files per project
- ⏳ **Git integration** - Commit/push from IDE
- ⏳ **Docker support** - Run containers from IDE
- ⏳ **Debugging** - Set breakpoints and debug
- ⏳ **Extensions** - Add functionality with plugins
- ⏳ **Collaborative editing** - Code with teammates

---

## 📊 Comparison: Portal IDE vs GitHub Codespace

| Feature | Portal IDE | Codespace |
|---------|-----------|-----------|
| **Access** | Browser | Browser + App |
| **Setup** | Instant | 30-60 seconds |
| **Performance** | Fast | Very fast |
| **Storage** | Database | Full VM |
| **Integrations** | Limited | Full GitHub |
| **Cost** | Free | Includes quota |
| **Collaboration** | Coming soon | Built-in |
| **Offline** | No | Yes (App) |

### Best Use Cases

**Use Portal IDE when:**
- Quick edits needed
- Testing portal features
- Learning/training
- Simple code projects
- No GitHub repo needed

**Use GitHub Codespace when:**
- Full development environment
- Complex projects
- Team collaboration
- Git integration needed
- Need full terminal access

---

## 🔐 Security

### Code Privacy
- ✅ Code stored in portal database
- ✅ Only accessible to authenticated users
- ✅ RBAC controls access
- ✅ Encrypted in transit

### GitHub Integration
- ✅ Requires personal access token
- ✅ User controls permissions
- ✅ Token stored securely
- ✅ Auto-revoke on logout

---

## 📞 Support

For issues with IDE:
1. **Check troubleshooting section** above
2. **Review browser console** (F12)
3. **Check backend logs:** `docker logs developer_portal_backend`
4. **Verify API health:** `curl http://localhost:5001/health`

---

## 🎉 Get Started!

**Ready to code?**

1. ✅ Login to Developer Portal
2. ✅ Click "Code Editor (IDE)"
3. ✅ Create your first project
4. ✅ Start coding!

**Or use GitHub Codespace:**

1. ✅ Click [GitHub] button
2. ✅ Opens in Codespace
3. ✅ Full VS Code experience
4. ✅ Sync changes back

**Happy coding! 🚀**
