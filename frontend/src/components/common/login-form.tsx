'use client';

import { useState } from 'react';
import { HiOutlineEyeSlash, HiOutlineEye } from 'react-icons/hi2';
import { InferType } from 'yup';
import { LoginFormSchema } from '@/schema/auth/login-form';
import { useFormik, FormikHelpers } from 'formik';
import { Loader } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Roles } from '@/types/roles';
import { Role } from '@/constants/role';
import Box from '../ui/box';
import { cn } from '@/lib/utils';
import '../../styles/login-form.css';
import { roleStrings } from '@/lib/getters';

export type LoginFormData = InferType<typeof LoginFormSchema>;

type LoginFormProps = {
  role: Roles;
  onSubmit: (data: LoginFormData) => void;
};

export default function LoginForm({ role, onSubmit }: LoginFormProps) {
  const [revealPassword, setRevealPassword] = useState<boolean>(false);

  function handleSubmit(formData: LoginFormData): void {
    onSubmit(formData);
  }
  const formik = useFormik<LoginFormData>({
    initialValues: {
      email: '',
      password: '',
      stayLoggedIn: false,
    },
    validationSchema: LoginFormSchema,
    onSubmit: (values: LoginFormData, formikHelpers: FormikHelpers<LoginFormData>) => {
      handleSubmit(values);
      formikHelpers.setSubmitting(false);
    },
  });

  return (
    <Box
      as="form"
      className={cn('ml-auto flex flex-col gap-6 justify-center max-w-lg')}
      onSubmit={e => formik.handleSubmit(e)}
    >
      <Box as="header" className="flex flex-col gap-3 text-white">
        <Box as="h1" className={cn('text-5xl lg:text-6xl font-semibold text-center')}>
          Welcome!
        </Box>
        <Box as="p" className={cn('text-center text-base leading-7 sm:text-xl sm:leading-9')}>
          {role === Role.STUDENT ? roleStrings[Role.STUDENT] : roleStrings[Role.STAFF]}
        </Box>
      </Box>

      <Box as="section" className="flex flex-col gap-4">
        <Box as="span" className="text-md sm:text-lg text-white/30">
          Log in to your account
        </Box>

        <Box className="flex flex-col gap-1.5">
          <Box as="label" htmlFor="email" className="text-white/25 text-sm sm:text-md">
            Email Address
          </Box>
          <Input
            type="email"
            id="email"
            className="border border-[#cccccc] bg-white dark:bg-white h-auto text-gray-500 text-sm p-3 sm:p-3.5 rounded-sm"
            placeholder="abc@gmail.com"
            {...formik.getFieldProps('email')}
          />
          <Box as="span" className="text-red-300 ps-0.5 text-sm sm:text-md">
            {formik.touched.email && formik.errors.email ? formik.errors.email : null}
          </Box>
        </Box>

        <Box className="flex flex-col gap-1.5">
          <Box as="label" htmlFor="password" className="text-white/25 text-sm sm:text-md">
            Password
          </Box>
          <Box className="relative">
            <Input
              type={revealPassword ? 'text' : 'password'}
              id="password"
              className="border border-[#cccccc] bg-white dark:bg-white h-auto w-full text-gray-500 text-sm p-3 sm:p-3.5 rounded-sm"
              placeholder="*****************"
              {...formik.getFieldProps('password')}
            />
            <Button
              variant="ghost"
              type="button"
              aria-label={revealPassword ? 'show password' : 'hide password'}
              className="absolute top-1/2 -translate-y-1/2 right-[1rem] bg-white text-gray-500 hover:text-gray-500 hover:cursor-pointer hover:bg-transparent dark:hover:bg-white has-[>svg]:px-0"
              onClick={() => setRevealPassword(prev => !prev)}
            >
              {revealPassword ? <HiOutlineEye className="" /> : <HiOutlineEyeSlash className="" />}
            </Button>
          </Box>
          <Box as="span" className="text-red-300 ps-0.5 text-sm sm:text-md">
            {formik.touched.password && formik.errors.password ? formik.errors.password : null}
          </Box>
        </Box>

        <Box className="flex flex-col gap-1.5">
          <Box className="flex items-center gap-1.5">
            <Input
              type="checkbox"
              id="stayLoggedIn"
              unstyled={true}
              className="appearance-none border border-[#D5D7DA] bg-white dark:bg-white w-4 aspect-square rounded-[4px] checked:bg-blue-500 checked:appearance-auto"
              {...formik.getFieldProps('stayLoggedIn')}
            />
            <Box as="label" htmlFor="stayLoggedIn" className="text-white/25 text-sm sm:text-md">
              Remember me
            </Box>
          </Box>
          <Box as="span" className="text-red-300 ps-0.5 text-sm sm:text-md">
            {formik.touched.stayLoggedIn && formik.errors.stayLoggedIn
              ? formik.errors.stayLoggedIn
              : null}
          </Box>
        </Box>

        <Button
          type="submit"
          className="mt-1 hover:cursor-pointer bg-[#477BFF] h-auto hover:bg-[#477BFF]/70 text-white text-sm sm:text-lg p-3 font-semibold rounded-sm"
        >
          {formik.isSubmitting ? (
            <Box className="flex justify-center items-center h-auto space-x-2">
              <Loader className="animate-spin h-5 w-5 text-white" />
              <Box as="span" className="text-white">
                Submitting...
              </Box>
            </Box>
          ) : (
            'Log In'
          )}
        </Button>
      </Box>
    </Box>
  );
}
