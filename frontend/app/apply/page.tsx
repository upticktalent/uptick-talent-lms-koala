'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { applicantService } from '@/services/applicantService';
import { handleApiError } from '@/utils/handleApiError';
import { ApplicationForm } from '@/types';

export default function ApplyPage() {
  const [formData, setFormData] = useState<ApplicationForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    education: '',
    experience: '',
    motivation: '',
    preferredTrack: '',
    portfolio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const tracks = [
    { value: 'frontend', label: 'Frontend Development' },
    { value: 'backend', label: 'Backend Development' },
    { value: 'fullstack', label: 'Full Stack Development' },
    { value: 'product', label: 'Product Management' },
    { value: 'design', label: 'UI/UX Design' },
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await applicantService.submitApplication(formData);
      const applicantId = response.data.data._id;
      router.push(`/apply/status?id=${applicantId}`);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply to Uptick Talent</CardTitle>
        <CardDescription>
          Complete the application form below to start your journey with us
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900'>
              Personal Information
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='firstName'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  First Name *
                </label>
                <Input
                  id='firstName'
                  name='firstName'
                  type='text'
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor='lastName'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Last Name *
                </label>
                <Input
                  id='lastName'
                  name='lastName'
                  type='text'
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Email Address *
              </label>
              <Input
                id='email'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label
                htmlFor='phone'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Phone Number *
              </label>
              <Input
                id='phone'
                name='phone'
                type='tel'
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label
                htmlFor='address'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Address *
              </label>
              <textarea
                id='address'
                name='address'
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Education & Experience */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900'>Background</h3>

            <div>
              <label
                htmlFor='education'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Educational Background *
              </label>
              <textarea
                id='education'
                name='education'
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                value={formData.education}
                onChange={handleChange}
                placeholder='Tell us about your educational background...'
                required
              />
            </div>

            <div>
              <label
                htmlFor='experience'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Relevant Experience *
              </label>
              <textarea
                id='experience'
                name='experience'
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                value={formData.experience}
                onChange={handleChange}
                placeholder='Describe any relevant work experience, projects, or skills...'
                required
              />
            </div>
          </div>

          {/* Track Selection */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900'>
              Program Preference
            </h3>

            <div>
              <label
                htmlFor='preferredTrack'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Preferred Track *
              </label>
              <select
                id='preferredTrack'
                name='preferredTrack'
                value={formData.preferredTrack}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
              >
                <option value=''>Select a track</option>
                {tracks.map((track) => (
                  <option key={track.value} value={track.value}>
                    {track.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor='motivation'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Why do you want to join Uptick Talent? *
              </label>
              <textarea
                id='motivation'
                name='motivation'
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                value={formData.motivation}
                onChange={handleChange}
                placeholder='Tell us about your motivation and goals...'
                required
              />
            </div>

            <div>
              <label
                htmlFor='portfolio'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Portfolio/LinkedIn URL (Optional)
              </label>
              <Input
                id='portfolio'
                name='portfolio'
                type='url'
                value={formData.portfolio}
                onChange={handleChange}
                placeholder='https://...'
              />
            </div>
          </div>

          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? 'Submitting Application...' : 'Submit Application'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
