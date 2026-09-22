import { render, screen } from '@testing-library/react';
import App from './App';

test('shows the home page to an unauthenticated visitor', async () => {
  render(<App />);
  const heading = await screen.findByRole('heading', { name: /appealfinder/i });
  expect(heading).toBeInTheDocument();
});
