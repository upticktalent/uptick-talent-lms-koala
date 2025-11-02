import LoginForm from '@/components/common/login-form';
import { render, screen } from '@testing-library/react';
import { Role } from '@/constants/role';
import { Roles } from '@/types/roles';

describe('Login Form', () => {
  let onSubmitMock;

  beforeEach(() => {
    onSubmitMock = vitest.fn();
    render(<LoginForm role={Role.STUDENT as Roles} onSubmit={onSubmitMock} />);
  });

  it('renders the welcome text', () => {
    expect(screen.getByText('Welcome!')).toBeInTheDocument();
  });

  it('renders the email input', () => {
    expect(screen.getByPlaceholderText('abc@gmail.com')).toBeInTheDocument();
  });

  it('renders the password input', () => {
    expect(screen.getByPlaceholderText('*****************')).toBeInTheDocument();
  });

  it('renders the Login button', () => {
    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
  });
});
