# Modernization & Migration Plan

## 1. Vite & TanStack Router Migration (Priority: High)
Converting from `react-scripts` to Vite and `react-router-dom` to `TanStack Router`.

### Steps:
1. **Dependency Update**:
   ```bash
   npm uninstall react-scripts react-router-dom
   npm install --save-dev vite @vitejs/plugin-react
   npm install @tanstack/react-router
   ```
2. **Configuration**: Create `vite.config.ts`.
3. **TanStack Router Setup**:
   - Define a route tree in `src/routes/`.
   - Use `createRouter` and `RouterProvider`.
   - Benefit: Type-safe params and built-in loader support (avoids "not smooth" feeling by pre-fetching data).
4. **Env Variables**: Update `.env` variables from `REACT_APP_` to `VITE_`.

---

## 2. API Service Consolidation (Priority: Medium)
Currently, multiple files handle their own axios instances.

### Proposed Structure:
`src/common/apiClient.ts`
```typescript
import axios from 'axios';
import logger from '../services/logger';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    logger.error("API Error: {Url} {Message}", error, {
      Url: error.config?.url,
      Status: error.response?.status
    });
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 3. Smoothness & Motion (Framer Motion)
To fix the "not smooth" feeling:
1. **Route Transitions**: Use Framer Motion's `AnimatePresence` to fade/slide pages during route changes.
2. **Staggered Lists**: Use motion variants for quiz items/packages to enter the screen gracefully.
3. **Lightweight Alternatives**: Since `framer-motion` is already present, we will optimize its usage. For simple "auto-animations", we can use `@formkit/auto-animate`.

## 4. Proper Loader Strategy
- **Global Progress**: Use a top-loading bar (like `TanStack Router` integration or `nprogress`) so the user knows navigation is happening without a full-screen block.
- **Skeleton Screens**: Implement skeletons for the Questionnaire and Package cards so the layout doesn't "jump" when data arrives.
- **Micro-transitions**: Button click effects and hover states using modern CSS/Motion.
