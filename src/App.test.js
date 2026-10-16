import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the navigation and home page', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: /aucsol/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /have something to sell/i })).toBeInTheDocument();
});
