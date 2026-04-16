# 📝 How to Access and Use the Code Editor

## Quick Start: Access the Code Editor

### Method 1: From Dashboard
1. **Login** at `http://localhost:3000`
   - Email: `dev@example.com`
   - Password: `password123`

2. **Click "Code Editor"** button on the dashboard
   - You'll see a code editor interface with a project list

### Method 2: Direct URL
```
http://localhost:3000/editor
```

---

## Code Editor Interface

### Left Panel: Project List
```
┌─ Projects ────────────────────┐
│ ☐ My First Project            │
│ ☐ Test Script                 │
│ ☐ API Handler                 │
│                               │
│ [+ New Project]               │
└───────────────────────────────┘
```

### Main Panel: Code Editor
```
┌─────────────────────────────────────────┐
│ Project: My First Project               │
│ Language: JavaScript                     │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ function hello() {                │   │
│ │   console.log("Hello, World!");   │   │
│ │ }                                 │   │
│ │                                   │   │
│ │                                   │   │
│ └───────────────────────────────────┘   │
│                                         │
│ [Save] [Create Version] [Delete]       │
└─────────────────────────────────────────┘
```

---

## Step-by-Step: Create a New Project

### Step 1: New Project
```
1. Click [+ New Project] button
2. Enter project name: "My Script"
3. Select language: JavaScript
4. Click [Create]
```

### Step 2: Write Code
```
1. Type or paste code in the editor
2. Code is in the text area
3. Supports: JavaScript, TypeScript, Python, Java, Go, Rust, C#, SQL
```

### Step 3: Save Project
```
1. Click [Save Project] button
2. Your code is saved to the database
3. Success message appears
```

### Step 4: Create Version
```
1. Click [Save Version] button
2. Enter commit message: "Initial implementation"
3. Click [Save]
4. Version is stored with timestamp
```

---

## Features

### 📂 Project Management
- ✅ Create new projects
- ✅ Open existing projects
- ✅ Edit code
- ✅ Save projects
- ✅ Delete projects

### 🔄 Version Control
- ✅ Save multiple versions
- ✅ Add commit messages
- ✅ View version history
- ✅ Restore previous versions

### 💾 Code Storage
- ✅ Syntax highlighting by language
- ✅ Auto-save capability
- ✅ Full code preservation
- ✅ Persistent storage in PostgreSQL

### 🚀 Integration
- ✅ View project details (creator, created date)
- ✅ Track modification history
- ✅ Link to GitHub workflows
- ✅ Trigger tests from workflows

---

## Supported Languages

| Language | File Extension | Usage |
|----------|---|---|
| JavaScript | .js | Node.js, Frontend |
| TypeScript | .ts | Typed JavaScript |
| Python | .py | Data science, scripts |
| Java | .java | Enterprise apps |
| Go | .go | Systems programming |
| Rust | .rs | Performance-critical |
| C# | .cs | .NET framework |
| SQL | .sql | Database queries |

---

## Example: Create a Python Project

### 1. Create Project
```
Project Name: Data Analyzer
Language: python
```

### 2. Add Code
```python
def calculate_average(numbers):
    """Calculate average of list of numbers"""
    return sum(numbers) / len(numbers)

data = [10, 20, 30, 40, 50]
avg = calculate_average(data)
print(f"Average: {avg}")
```

### 3. Save Project
```
Click: Save Project
Result: ✅ Project saved successfully
```

### 4. Save Version
```
Commit Message: "Add average calculation function"
Click: Save Version
Result: ✅ Version saved successfully
```

---

## Example: JavaScript Project

### 1. Create Project
```
Project Name: API Handler
Language: javascript
```

### 2. Add Code
```javascript
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

module.exports = { fetchUserData };
```

### 3. Save & Version
```
Save Project → Save Version
Message: "Add API handler with error handling"
```

---

## Work with Version History

### View Versions
```
1. Click on a project in the list
2. Click [Version History] button
3. See all saved versions with timestamps
```

### Restore Previous Version
```
1. In Version History, find a version
2. Click [Restore]
3. That version's code is loaded into editor
4. Modify as needed
5. Save to create new version
```

### Compare Versions
```
1. Open Version History
2. View message and date for each version
3. Click to restore specific version
```

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save Project | Ctrl+S / Cmd+S |
| New Project | Click button |
| Delete Project | Select → Click delete |
| Create Version | Click button |

---

## Tips & Tricks

### 1. Organized Projects
```
✅ Use descriptive names: "user-auth-handler"
✅ Use meaningful version messages: "Fix: handle null responses"
✅ Keep related code in same project
```

### 2. Version Strategy
```
✅ Save version before major changes
✅ Include what changed in message
✅ Use version history to track progress
```

### 3. Code Organization
```
✅ One project per module/feature
✅ Keep code focused and clean
✅ Use comments for complex logic
```

### 4. Integration with Workflows
```
✅ Save project in Code Editor
✅ Go to Workflow Logs
✅ Trigger GitHub Actions
✅ View execution logs
```

---

## Troubleshooting

### Code Editor Won't Load
```
✓ Ensure you're logged in
✓ Check backend is running: docker ps
✓ Clear browser cache
✓ Try incognito mode
```

### Can't Save Project
```
✓ Check token is valid (re-login if needed)
✓ Check project name is entered
✓ Verify database is running: docker logs developer_portal_db
```

### Projects Not Showing
```
✓ Refresh page (Cmd+R / Ctrl+R)
✓ Check network in developer tools (F12)
✓ Verify backend health: curl http://localhost:5001/health
```

### Version Won't Save
```
✓ Enter commit message
✓ Ensure project is saved first
✓ Check database connection
```

---

## Integration with Workflows

### After Editing Code:

1. **Save your project**
   - Click [Save Project]

2. **Create a version**
   - Click [Save Version]
   - Add meaningful message

3. **Push to GitHub** (if linked)
   - Manually push code to repository
   - Or configure auto-sync

4. **View Workflow Logs**
   - Click "Workflow Logs" on dashboard
   - Select your workflow
   - Click [Trigger Workflow]
   - View real-time execution

---

## FAQ

**Q: Can multiple users edit the same project?**
A: Currently, projects are created per user. Share code via copy-paste or Git.

**Q: Is there syntax highlighting?**
A: Yes, configured per language selected.

**Q: Can I download my code?**
A: Yes, copy from editor. Full download feature coming soon.

**Q: How long are projects stored?**
A: Permanently until deleted. Versions stored indefinitely.

**Q: Can I restore any old version?**
A: Yes, all versions are kept. Restore any time.

---

## Next Steps

1. ✅ **Login** to portal
2. ✅ **Create first project** in Code Editor
3. ✅ **Write some code**
4. ✅ **Save project**
5. ✅ **Save version** with message
6. ✅ **Try Workflow Logs** to trigger GitHub Actions

**You're all set to start coding! 🚀**
