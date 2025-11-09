import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from './page'; 

vi.mock('./ApplicationForm', () => ({
  default: () => <div data-testid="application-form">Application Form Component</div>,
}));

describe('ApplicantPage', () => {
  it('should render the page with application form', () => {
    render(<Page />);
    
    expect(screen.getByTestId('application-form')).toBeInTheDocument();
  });

  it('should have correct background styling', () => {
    const { container } = render(<Page />);
    
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('min-h-screen');
    expect(mainDiv).toHaveClass('bg-gradient-to-br');
    expect(mainDiv).toHaveClass('from-blue-50');
    expect(mainDiv).toHaveClass('to-indigo-50');
  });

  it('should have proper padding and layout', () => {
    const { container } = render(<Page />);
    
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('py-8');
    expect(mainDiv).toHaveClass('px-4');
  });
});