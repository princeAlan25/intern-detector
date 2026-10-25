# Contributing to Fake-Real Detector

Thank you for your interest in contributing to **Fake-Real Detector**!

## How to Contribute

1. **Fork the Repository**: Create your own branch (`git checkout -b feature/amazing-rule`).
2. **Install Dependencies**: Run `npm install` from the repository root.
3. **Make Your Changes**:
   - For backend changes (heuristics, OpenRouter integration, API): edit files in `backend/src/`.
   - For frontend changes (UI styling, controller, presenter): edit files in `frontend/src/`.
4. **Run Tests**: Ensure all unit and integration tests pass:
   ```bash
   npm test
   ```
5. **Commit Your Changes**: Follow clear commit conventions (`git commit -m "feat(rules): add check for upfront wire transfers"`).
6. **Open a Pull Request**: Submit your PR with a concise description of your additions.

## Code Standards
- Strict TypeScript everywhere with zero unhandled `any`.
- Adhere to the **Controller-Presenter Pattern** on the frontend and the **Layered Strategy Pattern** on the backend.
- Write unit tests for every newly added heuristic rule or component.
