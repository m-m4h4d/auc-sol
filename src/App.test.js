import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the home page', () => {
  render(<App />);
  expect(screen.getByText(/welcome to aucsol/i)).toBeInTheDocument();
});
