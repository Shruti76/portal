# Developer Portal - Contribution Guidelines

## Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Setup

```bash
# Backend development
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend development
cd frontend
npm install
npm start
```

## Code Style

- Use consistent indentation (2 spaces)
- Follow ESLint rules
- Add comments for complex logic
- Use meaningful variable names

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Be descriptive and concise
- Reference issues when applicable: "Fix #123: Description"

## Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass
3. Update CHANGELOG.md
4. Request review from maintainers

## Reporting Bugs

- Check existing issues first
- Include steps to reproduce
- Provide expected vs actual behavior
- Include error logs/screenshots

## Feature Requests

- Describe the use case
- Explain expected behavior
- Suggest implementation if possible
- Consider backward compatibility

## Questions?

Open an issue with the `question` label or contact maintainers.
