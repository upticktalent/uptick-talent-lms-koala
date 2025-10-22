'use client';

import { useState } from 'react';
// import { fonts } from '@/lib/fonts';
import { HiOutlineEyeSlash, HiOutlineEye } from 'react-icons/hi2';
import { InferType } from 'yup';
import { LoginFormSchema } from '@/schema/auth/login-form';
import { Formik, ErrorMessage, FormikHelpers } from 'formik';
import { Loader } from 'lucide-react';

import Box from '../ui/box';
import { cn } from '@/lib/utils';

export type LoginFormData = InferType<typeof LoginFormSchema>;

type LoginFormProps = {
  role: 'staff' | 'student';
  onSubmit: (data: LoginFormData) => void;
};

export default function LoginForm({ role, onSubmit }: LoginFormProps) {
  const [revealPassword, setRevealPassword] = useState<boolean>(false);

  function handleSubmit(formData: LoginFormData): void {
    onSubmit(formData);
  }

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
        stayLoggedIn: false,
      }}
      validationSchema={LoginFormSchema}
      onSubmit={(values: LoginFormData, { setSubmitting }: FormikHelpers<LoginFormData>) => {
        handleSubmit(values);
        alert(JSON.stringify(values, null, 2));
        setSubmitting(false);
      }}
    >
      {formik => (
        <form
          className={cn(
            'ml-auto flex flex-col gap-6 justify-center max-w-lg',
            // fonts.raleway.className,
          )}
          onSubmit={e => formik.handleSubmit(e)}
        >
          <Box as="header" className="flex flex-col gap-3 text-white">
            <h1 className={cn('text-5xl lg:text-6xl font-semibold text-center')}>Welcome!</h1>
            <p className={cn('text-center text-base leading-7 sm:text-xl sm:leading-9')}>
              {role === 'student'
                ? 'Access your course, submit assignments, track your progress, and stay on top of your learning goals all in one place.'
                : 'Manage admissions, guide students, track attendance, and provide feedback seamlessly.'}
            </p>
          </Box>

          <Box as="section" className="flex flex-col gap-4">
            <Box as="span" className="text-md sm:text-lg text-white/30">
              Log in to your account
            </Box>

            <Box className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-white/25 text-sm sm:text-md">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="border border-[#cccccc] bg-white text-gray-500 text-sm p-3 sm:p-3.5 rounded-sm"
                placeholder="abc@gmail.com"
                {...formik.getFieldProps('email')}
              />
              <Box as="span" className="text-red-300 text-sm sm:text-md">
                <ErrorMessage name="email" />
              </Box>
            </Box>

            <Box className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-white/25 text-sm sm:text-md">
                Password
              </label>
              <Box className="relative">
                <input
                  type={revealPassword ? 'text' : 'password'}
                  id="password"
                  className="border border-[#cccccc] bg-white w-full text-gray-500 text-sm p-3 sm:p-3.5 rounded-sm"
                  placeholder="*****************"
                  {...formik.getFieldProps('password')}
                />
                <button
                  type="button"
                  aria-label={revealPassword ? 'show password' : 'hide password'}
                  className="absolute top-1/2 -translate-y-1/2 right-[1rem] text-gray-500"
                  onClick={() => setRevealPassword(prev => !prev)}
                >
                  {revealPassword ? (
                    <HiOutlineEye className="" />
                  ) : (
                    <HiOutlineEyeSlash className="" />
                  )}
                </button>
              </Box>
              <Box as="span" className="text-red-300 text-sm sm:text-md">
                <ErrorMessage name="password" />
              </Box>
            </Box>

            <Box>
              <Box className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  id="stayLoggedIn"
                  className="appearance-none border border-[#D5D7DA] bg-white w-4 h-4 rounded-[4px] checked:bg-blue-500 checked:appearance-auto"
                  {...formik.getFieldProps('stayLoggedIn')}
                />
                <label htmlFor="stayLoggedIn" className="text-white/25 text-sm sm:text-md">
                  Remember me
                </label>
              </Box>
              <Box as="span" className="text-red-300 text-sm sm:text-md">
                <ErrorMessage name="stayLoggedIn" />
              </Box>
            </Box>

            <button
              type="submit"
              className="mt-1 hover:cursor-pointer bg-[#477BFF] text-white text-sm sm:text-lg p-3 font-semibold rounded-sm"
            >
              {formik.isSubmitting ? (
                <div className="flex justify-center items-center space-x-2">
                  <Loader className="animate-spin h-5 w-5 text-white" />
                  <span className="text-white">Submitting...</span>
                </div>
              ) : (
                'Log In'
              )}
            </button>
          </Box>
        </form>
      )}
    </Formik>
  );
}
