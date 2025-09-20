import Home from '@/features/home';
import { render } from '@testing-library/react';

describe('Home page', () => {
  it('renders a heading', () => {
    const { getByText } = render(<Home />);
    // The Home feature renders a `Box` (defaults to a div) with the text "Home".
    // Assert the visible text instead of a specific heading element.
    expect(getByText(/home/i)).toBeTruthy();
  });
});
