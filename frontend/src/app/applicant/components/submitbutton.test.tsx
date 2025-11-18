import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormikProps } from 'formik';
import SubmitButton from './sumitbutton';
import { ApplicationFormValues } from '../types/type';
import { initialApplicationValues } from '../constants/constants';

const createMockFormik = (overrides: Partial<FormikProps<ApplicationFormValues>> = {}): FormikProps<ApplicationFormValues> => ({
  initialValues: initialApplicationValues,
  initialErrors: {},
  initialTouched: {},
  initialStatus: undefined,
  handleBlur: vi.fn(),
  handleChange: vi.fn(),
  handleReset: vi.fn(),
  handleSubmit: vi.fn(),
  resetForm: vi.fn(),
  setErrors: vi.fn(),
  setFormikState: vi.fn(),
  setFieldTouched: vi.fn(),
  setFieldValue: vi.fn(),
  setFieldError: vi.fn(),
  setStatus: vi.fn(),
  setSubmitting: vi.fn(),
  setTouched: vi.fn(),
  setValues: vi.fn(),
  submitForm: vi.fn(),
  validateForm: vi.fn(),
  validateField: vi.fn(),
  isValid: false,
  dirty: false,
  unregisterField: vi.fn(),
  registerField: vi.fn(),
  getFieldProps: vi.fn(),
  getFieldMeta: vi.fn(),
  getFieldHelpers: vi.fn(),
  validateOnBlur: true,
  validateOnChange: true,
  validateOnMount: false,
  values: initialApplicationValues,
  errors: {},
  touched: {},
  isSubmitting: false,
  isValidating: false,
  submitCount: 0,
  ...overrides
});

describe('SubmitButton', () => {
  it('is disabled when form is invalid', () => {
    const mockFormik = createMockFormik({ isValid: false });
    
    render(<SubmitButton formik={mockFormik} isSubmitting={false} />);

    const button = screen.getByRole('button', { name: /submit application/i });
    expect(button).toBeDisabled();
  });

  it('is disabled when submitting', () => {
    const mockFormik = createMockFormik({ isValid: true });
    
    render(<SubmitButton formik={mockFormik} isSubmitting={true} />);

    const button = screen.getByRole('button', { name: /submitting application/i });
    expect(button).toBeDisabled();
  });

  it('shows submitting text when isSubmitting is true', () => {
    const mockFormik = createMockFormik({ isValid: true });
    
    render(<SubmitButton formik={mockFormik} isSubmitting={true} />);

    expect(screen.getByText('Submitting Application...')).toBeInTheDocument();
  });

  it('shows submit text when not submitting', () => {
    const mockFormik = createMockFormik({ isValid: true });
    
    render(<SubmitButton formik={mockFormik} isSubmitting={false} />);

    expect(screen.getByText('Submit Application')).toBeInTheDocument();
  });
});