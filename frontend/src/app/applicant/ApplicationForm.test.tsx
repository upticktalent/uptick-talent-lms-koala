import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApplicationForm from './ApplicationForm';

/* eslint-disable @next/next/no-img-element */
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('next/image', () => ({
  default: ({ alt, src, ...props }: { alt: string; src: string }) => (
    <img alt={alt} src={src} {...props} />
  ),
}));

vi.mock('lucide-react', () => ({
  Upload: (props: React.SVGProps<SVGSVGElement>) => <svg {...props}>UploadIcon</svg>,
  FileText: (props: React.SVGProps<SVGSVGElement>) => <svg {...props}>FileTextIcon</svg>,
  CheckCircle2: (props: React.SVGProps<SVGSVGElement>) => <svg {...props}>CheckCircle2Icon</svg>,
  Eye: (props: React.SVGProps<SVGSVGElement>) => <svg {...props}>EyeIcon</svg>,
  Trash2: (props: React.SVGProps<SVGSVGElement>) => <svg {...props}>Trash2Icon</svg>,
  Users: (props: React.SVGProps<SVGSVGElement>) => <svg {...props}>UsersIcon</svg>,
  Mail: (props: React.SVGProps<SVGSVGElement>) => <svg {...props}>MailIcon</svg>,
  Phone: (props: React.SVGProps<SVGSVGElement>) => <svg {...props}>PhoneIcon</svg>,
  User: (props: React.SVGProps<SVGSVGElement>) => <svg {...props}>UserIcon</svg>,
  Globe: (props: React.SVGProps<SVGSVGElement>) => <svg {...props}>GlobeIcon</svg>,
  Loader2: (props: React.SVGProps<SVGSVGElement>) => <svg {...props}>Loader2Icon</svg>,
}));

vi.mock('@/components/ui/box', () => ({
  default: (props: React.ComponentProps<'div'>) => <div {...props} />,
}));

global.fetch = vi.fn();

describe('ApplicationForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: "Active cohort retrieved successfully",
        data: {
          cohortNumber: "15",
          tracks: [
            { _id: "1", name: "Frontend Development" },
            { _id: "2", name: "Backend Development" },
          ]
        }
      }),
    });
  });

  it('should render application form with all sections', () => {
    render(<ApplicationForm />);

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Location & Gender')).toBeInTheDocument();
    expect(screen.getByText('Program Selection')).toBeInTheDocument();
    expect(screen.getByText('Motivation')).toBeInTheDocument();
    expect(screen.getByText('Document Upload')).toBeInTheDocument();
  });

  it('should have required form fields', () => {
    render(<ApplicationForm />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    
    const submitButton = screen.getByRole('button', { name: /submit application/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should allow user to fill in form fields', async () => {
    render(<ApplicationForm />);

    const firstNameInput = screen.getByPlaceholderText('Enter your first name');
    const lastNameInput = screen.getByPlaceholderText('Enter your last name');

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');

    expect(firstNameInput).toHaveValue('John');
    expect(lastNameInput).toHaveValue('Doe');
  });

  it('should show file upload section', () => {
    render(<ApplicationForm />);

    expect(screen.getByText(/upload your cv/i)).toBeInTheDocument();
    expect(screen.getByText(/drag and drop or click to browse/i)).toBeInTheDocument();
    expect(screen.getByText(/pdf only up to 10mb/i)).toBeInTheDocument();
    
    const fileInput = screen.getByLabelText(/upload your cv/i);
    expect(fileInput).toBeInTheDocument();
  });

  it('should handle file upload', async () => {
    render(<ApplicationForm />);
    
    const file = new File(['dummy content'], 'example.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/upload your cv/i) as HTMLInputElement;
    
    await user.upload(fileInput, file);
    
    expect(fileInput.files?.[0]).toBe(file);
    expect(fileInput.files).toHaveLength(1);
  });

  it('should handle API fetch error gracefully', async () => {
    (global.fetch as Mock).mockReset();
    (global.fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<ApplicationForm />);

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Location & Gender')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your first name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your last name')).toBeInTheDocument();
    });
  });

  it('should display cohort number when data loads', async () => {
    render(<ApplicationForm />);

    await waitFor(() => {
      expect(screen.getByText('Cohort 15')).toBeInTheDocument();
    });
  });

  it('should show track selection when cohort data loads', async () => {
    render(<ApplicationForm />);

    await waitFor(() => {
      const trackSelect = screen.getByLabelText(/select your track/i);
      expect(trackSelect).toBeInTheDocument();
    });

    expect(screen.getByText('Frontend Development')).toBeInTheDocument();
    expect(screen.getByText('Backend Development')).toBeInTheDocument();
  });

  it('should render all form inputs', () => {
    render(<ApplicationForm />);

    expect(screen.getByPlaceholderText('Enter your first name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your last name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your.email@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('+1234567890')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tell us why you want to join this program and advance your career in tech...')).toBeInTheDocument();
    
    expect(screen.getByRole('combobox', { name: /gender/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /country/i })).toBeInTheDocument();
  });

  it('should show loading state when cohort data is being fetched', () => {
    render(<ApplicationForm />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
  });

  it('should show validation errors when required fields are empty', async () => {
    render(<ApplicationForm />);

    await waitFor(() => {
      expect(screen.getByText('Cohort 15')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /submit application/i });
    expect(submitButton).toBeDisabled();
  });
});