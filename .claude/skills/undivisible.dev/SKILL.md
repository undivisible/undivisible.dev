```markdown
# undivisible.dev Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill introduces the core development patterns and workflows used in the `undivisible.dev` TypeScript codebase. It covers coding conventions, file organization, commit styles, and step-by-step guides for updating UI components. The repository is framework-agnostic and emphasizes maintainable, convention-driven TypeScript development.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `useHongKongDayTheme.ts`, `printActions.tsx`

### Import Style
- Use **alias imports** for modules.
  - Example:
    ```typescript
    import theme from '@/lib/useHongKongDayTheme'
    ```

### Export Style
- **Mixed exports** are used (both default and named).
  - Example:
    ```typescript
    // Default export
    export default Info

    // Named export
    export { PrintActions }
    ```

### Commit Messages
- Use **conventional commits** with the `fix` prefix for bug fixes.
  - Example:
    ```
    fix: correct carousel swipe behavior on mobile
    ```

## Workflows

### UI Component Update
**Trigger:** When you want to improve or fix visual/UI behavior in a component, especially related to `Info.tsx` or `PrintActions.tsx`.
**Command:** `/update-ui-component`

1. **Edit UI Component(s):**
   - Modify files in `src/components` such as `Info.tsx` or `PrintActions.tsx` to adjust UI behavior or appearance.
     ```typescript
     // Example: Adjusting a button style in Info.tsx
     <button className="primary" style={{ fontSize: '1.2em' }}>
       Print
     </button>
     ```
2. **Update Related Hooks/Utilities (if needed):**
   - If the UI change depends on theme or state logic, update related files in `src/lib`, such as `useHongKongDayTheme.ts`.
     ```typescript
     // Example: Adding a new theme property
     export function useHongKongDayTheme() {
       return { color: 'red', background: '#fff' }
     }
     ```
3. **Test Changes:**
   - Test the updated components on both mobile and desktop viewports to ensure correct behavior.
     - Use browser dev tools or device simulators as needed.

4. **Commit Changes:**
   - Use a conventional commit message with the `fix` prefix.
     ```
     fix: improve PrintActions button accessibility on mobile
     ```

## Testing Patterns

- **File Pattern:** Test files use the `*.test.*` naming convention.
  - Example: `printActions.test.ts`
- **Framework:** No specific testing framework detected; follow repository conventions.
- **Typical Test Example:**
  ```typescript
  // printActions.test.ts
  import { render } from '@testing-library/react'
  import PrintActions from './PrintActions'

  test('renders print button', () => {
    const { getByText } = render(<PrintActions />)
    expect(getByText('Print')).toBeInTheDocument()
  })
  ```

## Commands

| Command              | Purpose                                                  |
|----------------------|----------------------------------------------------------|
| /update-ui-component | Update or fix UI components, especially Info or PrintActions |

```
