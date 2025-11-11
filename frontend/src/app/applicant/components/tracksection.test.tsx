import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Formik } from 'formik';
import TrackSection from './tracksection';
import { initialApplicationValues } from '../constants/constants';

global.fetch = vi.fn();

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('TrackSection', () => {
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

  const renderTrackSection = () => {
    const testQueryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={testQueryClient}>
        <Formik initialValues={initialApplicationValues} onSubmit={vi.fn()}>
          {(formik) => <TrackSection formik={formik} />}
        </Formik>
      </QueryClientProvider>
    );
  };

  it('renders track selection section', async () => {
    renderTrackSection();

    await waitFor(() => {
      expect(screen.getByText('Select Your Track *')).toBeInTheDocument();
    });
  });

  it('displays available tracks', async () => {
    renderTrackSection();

    await waitFor(() => {
      const select = screen.getByLabelText(/select your track/i) as HTMLSelectElement;
      expect(select).toBeInTheDocument();
      
      expect(screen.getByText('Frontend Development')).toBeInTheDocument();
      expect(screen.getByText('Backend Development')).toBeInTheDocument();
    });
  });

  it('shows tools section when track is selected', async () => {
    renderTrackSection();

    await waitFor(() => {
      expect(screen.getByText(/program selection/i)).toBeInTheDocument();
    });
  });
});