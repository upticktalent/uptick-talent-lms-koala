import { boolean, object, string } from 'yup';

const LoginFormSchema = object().shape({
  email: string().email('Invalid email address').required('Email is required'),
  password: string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[@$!%*?&`~#^_-]/, 'Password must contain at least one special character'),
  stayLoggedIn: boolean().nonNullable().default(false),
});

export { LoginFormSchema };
