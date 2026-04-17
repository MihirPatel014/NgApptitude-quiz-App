# 🚀 NG Quiz App Modernization Roadmap

This document outlines the phased plan for transitioning the `NgApptitude-quiz-App` to a feature-based, scalable architecture with 100% test coverage.

## 🛠️ Tech Stack Expansion
- **Zustand**: For high-frequency global state (Quiz timers, answer tracking).
- **TanStack Query**: For efficient data fetching, caching, and loading state management.


---

## 📅 Phase 1: Core Architecture Reorganization
**Objective**: Move away from a flat structure to domain-driven features.

### 1.1 Move Authentication to Features
- [ ] **Task**: Create `src/features/auth/` and move `Login`, `Registration`, and `PhoneOTP` there.
- [ ] **Task**: Centralize Auth-specific types and services into the same folder.
- [ ] **Test Case**: 
    - Verify that `Registration` flow still redirects to `Dashboard` upon success.
    - Verify that `PhoneOTP` correctly switches to verification mode after mock API call.

### 1.2 Implement Atomic UI Components
- [ ] **Task**: Create `src/components/ui/` for primitive elements (Button, Input, Badge).
- [ ] **Task**: Refactor `NavbarAndSidebar` to use these reusable atoms.
- [ ] **Test Case**: 
    - Ensure `Button` component correctly handles `loading` states (disabled + spinner).
    - Ensure `Input` component correctly displays validation error states.

---

## 📅 Phase 2: Logic Extraction (Custom Hooks)
**Objective**: Separate UI lifecycle from business logic.

### 2.1 Extract `useRegistration` Hook
- [ ] **Task**: Move validation, debounced email checking, and API calling from `Registration.tsx` to a custom hook.
- [ ] **Test Case**: 
    - Unit test for the hook: Assert that `isValid` returns false until all required fields are filled.
    - Unit test: Mock `checkEmail` and verify that the hook updates `error` state after 600ms debounce.

### 2.2 Extract `useQuizLogic` Hook
- [ ] **Task**: Separate the timer logic, answer selection, and submission flow from the main `Quiz.tsx`.
- [ ] **Test Case**:
    - Verify timer decrements correctly every 1000ms.
    - Verify that state remains consistent if a user accidentally refreshes (persistence check).

---

## 📅 Phase 3: Routing & Global State
**Objective**: Clean up `App.tsx` and optimize performance.

### 3.1 Routing Configuration
- [ ] **Task**: Move 15+ routes from `App.tsx` into a `src/routes/config.tsx` file.
- [ ] **Test Case**: 
    - Verify `ProtectedRoute` correctly redirects unauthenticated users to `/login`.

---

## 📅 Phase 4: Advanced Data & State
**Objective**: Optimize the Quiz experience and reduce manual state boilerplate.

### 4.1 Global Quiz Store (Zustand)
- [ ] **Task**: Create `useQuizStore` to manage timer, answers, and progress.
- [ ] **Task**: Connect `Quiz.tsx` to this store and remove local `useState` for these items.
- [ ] **Test Case**:
    - Verify timer sync across different components (e.g., Header and main Quiz body).

### 4.2 Data Fetching Layer (TanStack Query)
- [ ] **Task**: Wrap the app in `QueryClientProvider`.
- [ ] **Task**: Refactor `getAllGrades` and `getPackages` to use `useQuery`.
- [ ] **Test Case**:
    - Verify that data is cached (switching tabs doesn't show a new loader).

For every change made, the following must pass:
1. **Linting**: No `any` types or unused imports.
2. **Visual Check**: Glassmorphism and Backdrop Blur remain consistent.
3. **Vitest**: `npm run test` must finish with 0 failures across all 3 suites.
