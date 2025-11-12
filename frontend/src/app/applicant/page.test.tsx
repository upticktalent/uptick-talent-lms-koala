import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ApplicantPage from './page';

// Mock fetch globally
global.fetch = vi.fn();

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// Mock the ApplicationForm component
vi.mock('./application-form', () => ({
  default: () => (
    <div data-testid="application-form">
      Application Form Content
    </div>
  )
}));

describe('ApplicantPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const renderApplicantPage = () => {
    const testQueryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={testQueryClient}>
        <ApplicantPage />
      </QueryClientProvider>
    );
  };

  it('should render the page with application form', () => {
    renderApplicantPage();
    expect(screen.getByTestId('application-form')).toBeInTheDocument();
  });

  it('should have correct background styling', () => {
    renderApplicantPage();
    
    const container = screen.getByTestId('applicant-page-container');
    expect(container).toHaveClass('min-h-screen');
    expect(container).toHaveClass('bg-gradient-to-br');
  });

  it('should have proper padding and layout', () => {
    renderApplicantPage();
    
    const container = screen.getByTestId('applicant-page-container');
    expect(container).toHaveClass('py-6');
    expect(container).toHaveClass('sm:py-8');
    expect(container).toHaveClass('px-4');
    expect(container).toHaveClass('sm:px-6');
  });
});