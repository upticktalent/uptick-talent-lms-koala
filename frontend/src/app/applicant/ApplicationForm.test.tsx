import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ApplicationForm from './application-form';

global.fetch = vi.fn();

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('ApplicationForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          cohortNumber: '1',
          tracks: [
            { _id: '1', name: 'Frontend Development', description: '' },
            { _id: '2', name: 'Backend Development', description: '' }
          ]
        }
      }),
    });
  });

  const renderApplicationForm = () => {
    const testQueryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={testQueryClient}>
        <ApplicationForm/>
      </QueryClientProvider>
    );
  };

  it('renders all form sections', async () => {
    renderApplicationForm();

    await waitFor(() => {
      expect(screen.getByText(/program selection/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/select your track/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
  });

  it('loads and displays cohort number', async () => {
    renderApplicationForm();

    await waitFor(() => {
      expect(screen.getByText('Cohort 1')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    renderApplicationForm();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});