import { render, screen } from '@testing-library/react';
import App from './App';

test('shows the marketing home page to an unauthenticated visitor', async () => {
  render(<App />);
  const heading = await screen.findByRole('heading', { name: /tag it/i });
  expect(heading).toBeInTheDocument();
});
