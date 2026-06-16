```markdown
# undivisible.dev Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `undivisible.dev` TypeScript codebase. It covers file naming, import/export styles, commit message conventions, and testing patterns. The repository does not use a specific framework, focusing instead on clean TypeScript practices.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.

**Example:**
```
userProfile.ts
dataFetcher.ts
```

### Import Style
- Use **alias imports** to reference modules.

**Example:**
```typescript
import { fetchData as getData } from './dataFetcher';
```

### Export Style
- Both **named** and **default exports** are used.

**Named Export Example:**
```typescript
export function calculateSum(a: number, b: number): number {
  return a + b;
}
```

**Default Export Example:**
```typescript
const config = { apiUrl: 'https://api.undivisible.dev' };
export default config;
```

### Commit Message Conventions
- Use **Conventional Commits** with the `fix` prefix for bug fixes.
- Average commit message length: ~75 characters.

**Example:**
```
fix: correct user profile data mapping in dataFetcher
```

## Workflows

_No automated workflows detected in this repository._

## Testing Patterns

- Test files follow the pattern: `*.test.*`
- Testing framework is **unknown** (not detected).
- Place test files alongside the modules they test or in a dedicated `tests` directory.

**Example:**
```
userProfile.test.ts
```

**Basic Test File Example:**
```typescript
import { calculateSum } from './calculateSum';

test('adds two numbers', () => {
  expect(calculateSum(2, 3)).toBe(5);
});
```

## Commands
| Command | Purpose |
|---------|---------|
| /test   | Run all test files matching *.test.* pattern |
| /fix    | Commit a bug fix using the conventional commit format |
```