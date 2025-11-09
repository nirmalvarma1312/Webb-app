# Contributing to Financial Indices Tracker

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/financial-indices-tracker.git
   cd financial-indices-tracker
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### 1. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update types as needed

### 2. Test Your Changes

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build

# Run locally
npm run dev
```

### 3. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add new index tracking feature"
```

**Commit Message Format**:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define interfaces for data structures
- Avoid `any` type when possible
- Use meaningful variable names

```typescript
// Good
interface IndexData {
  symbol: string;
  value: number;
}

// Avoid
const data: any = {};
```

### React Components

- Use functional components
- Use TypeScript interfaces for props
- Keep components focused and small
- Use meaningful component names

```typescript
// Good
interface IndexCardProps {
  index: IndexData;
}

export default function IndexCard({ index }: IndexCardProps) {
  // Component logic
}
```

### Naming Conventions

- **Components**: PascalCase (`IndexCard.tsx`)
- **Functions**: camelCase (`fetchIndexData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_REQUESTS`)
- **Files**: kebab-case for utilities (`api-service.ts`)

### File Organization

```
component/
├── ComponentName.tsx      # Component file
└── ComponentName.test.tsx # Tests (if applicable)

lib/
├── feature-name.ts        # Utility/service
└── feature-name.test.ts   # Tests
```

## What to Contribute

### Bug Fixes

- Check existing issues first
- Create an issue if one doesn't exist
- Reference the issue in your PR

### New Features

- Discuss in an issue first
- Ensure it aligns with project goals
- Update documentation
- Add tests if applicable

### Documentation

- Fix typos and clarify content
- Add examples
- Improve explanations
- Update outdated information

### Ideas for Contributions

- Add more indices (crypto, commodities, forex)
- Improve error handling
- Add unit tests
- Enhance UI/UX
- Optimize performance
- Add accessibility features
- Improve mobile experience
- Add data export features
- Implement user preferences
- Add price alerts

## Pull Request Process

1. **Update Documentation**: Update README.md if needed
2. **Add Tests**: Add tests for new features
3. **Check Linting**: Ensure code passes linting
4. **Update Types**: Keep TypeScript types up to date
5. **Describe Changes**: Write clear PR description
6. **Link Issues**: Reference related issues

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
How was this tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
```

## Code Review Process

- PRs require at least one approval
- Address review comments promptly
- Be open to feedback
- Discuss disagreements respectfully

## Testing Guidelines

### Manual Testing

1. Test in development mode
2. Test production build
3. Test on different browsers
4. Test responsive design
5. Test error scenarios

### Areas to Test

- API endpoints
- Caching behavior
- Rate limiting
- WebSocket connection
- UI interactions
- Error handling
- Loading states

## Documentation Standards

### Code Comments

```typescript
/**
 * Fetches current quote for a symbol
 * @param symbol - Stock/ETF symbol (e.g., "SPY")
 * @returns IndexData or null if not found
 */
export async function fetchQuote(symbol: string): Promise<IndexData | null> {
  // Implementation
}
```

### README Updates

- Keep examples up to date
- Update feature lists
- Add new configuration options
- Document breaking changes

## Community Guidelines

### Be Respectful

- Treat everyone with respect
- Be constructive in feedback
- Help newcomers
- Celebrate contributions

### Communication

- Use clear, concise language
- Provide context in issues
- Ask questions when unclear
- Share knowledge

## Getting Help

- **Questions**: Open a discussion on GitHub
- **Bugs**: Create an issue with reproduction steps
- **Features**: Discuss in an issue first
- **Security**: Email maintainers directly

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Copyright (c) 2024 Nirmal Varma

---

Thank you for contributing! 🎉

