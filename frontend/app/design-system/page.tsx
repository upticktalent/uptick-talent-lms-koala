'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DesignSystemShowcase() {
  return (
    <div className='min-h-screen bg-[#070C19] p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-white mb-4'>
            Uptick Talent Design System
          </h1>
          <p className='text-[#A7B0BE] text-lg'>
            Modern, accessible components for the LMS platform
          </p>
        </div>

        {/* Typography */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>Typography Scale</CardTitle>
            <CardDescription>
              Consistent typography using Inter font family
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <h1 className='text-4xl font-semibold text-white'>
                Heading 1 - 32-40px
              </h1>
              <h2 className='text-3xl font-semibold text-white'>
                Heading 2 - 28-32px
              </h2>
              <h3 className='text-2xl font-medium text-white'>
                Heading 3 - 22-24px
              </h3>
              <p className='text-lg text-white'>Body Large - 18px</p>
              <p className='text-base text-white'>Body Medium - 16px</p>
              <p className='text-sm text-white'>Body Small - 14px</p>
              <p className='text-xs text-[#A7B0BE]'>Caption - 12px</p>
            </div>
          </CardContent>
        </Card>

        {/* Color System */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>Color System</CardTitle>
            <CardDescription>Brand colors and neutral palette</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {/* Primary Colors */}
              <div className='space-y-2'>
                <h4 className='text-white font-medium'>Primary</h4>
                <div className='bg-[#070C19] h-12 rounded-lg border border-[#2F343C] flex items-center justify-center'>
                  <span className='text-white text-sm'>#070C19</span>
                </div>
                <div className='bg-[#477BFF] h-12 rounded-lg flex items-center justify-center'>
                  <span className='text-white text-sm'>#477BFF</span>
                </div>
              </div>

              {/* Grays */}
              <div className='space-y-2'>
                <h4 className='text-white font-medium'>Grays</h4>
                <div className='bg-[#F5F7FA] h-8 rounded flex items-center justify-center'>
                  <span className='text-black text-xs'>100</span>
                </div>
                <div className='bg-[#CBD2DC] h-8 rounded flex items-center justify-center'>
                  <span className='text-black text-xs'>300</span>
                </div>
                <div className='bg-[#A7B0BE] h-8 rounded flex items-center justify-center'>
                  <span className='text-black text-xs'>400</span>
                </div>
                <div className='bg-[#4F5661] h-8 rounded flex items-center justify-center'>
                  <span className='text-white text-xs'>600</span>
                </div>
              </div>

              {/* Status Colors */}
              <div className='space-y-2'>
                <h4 className='text-white font-medium'>Status</h4>
                <div className='bg-[#22C55E] h-8 rounded flex items-center justify-center'>
                  <span className='text-white text-xs'>Success</span>
                </div>
                <div className='bg-[#F59E0B] h-8 rounded flex items-center justify-center'>
                  <span className='text-white text-xs'>Warning</span>
                </div>
                <div className='bg-[#EF4444] h-8 rounded flex items-center justify-center'>
                  <span className='text-white text-xs'>Danger</span>
                </div>
                <div className='bg-[#3B82F6] h-8 rounded flex items-center justify-center'>
                  <span className='text-white text-xs'>Info</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>All button variants and sizes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {/* Variants */}
              <div>
                <h4 className='text-white font-medium mb-4'>Variants</h4>
                <div className='flex flex-wrap gap-4'>
                  <Button variant='default'>Primary Button</Button>
                  <Button variant='secondary'>Secondary Button</Button>
                  <Button variant='destructive'>Danger Button</Button>
                  <Button variant='ghost'>Ghost Button</Button>
                  <Button variant='link'>Link Button</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className='text-white font-medium mb-4'>Sizes</h4>
                <div className='flex flex-wrap items-center gap-4'>
                  <Button size='sm'>Small</Button>
                  <Button size='default'>Default</Button>
                  <Button size='lg'>Large</Button>
                </div>
              </div>

              {/* States */}
              <div>
                <h4 className='text-white font-medium mb-4'>States</h4>
                <div className='flex flex-wrap gap-4'>
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input fields and form components</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='block text-white font-medium mb-2'>
                Text Input
              </label>
              <Input placeholder='Enter your text here...' />
            </div>
            <div>
              <label className='block text-white font-medium mb-2'>
                Email Input
              </label>
              <Input type='email' placeholder='email@example.com' />
            </div>
            <div>
              <label className='block text-white font-medium mb-2'>
                Password Input
              </label>
              <Input type='password' placeholder='Your password' />
            </div>
            <div>
              <label className='block text-white font-medium mb-2'>
                Disabled Input
              </label>
              <Input placeholder='Disabled input' disabled />
            </div>
          </CardContent>
        </Card>

        {/* Cards */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>Card Components</CardTitle>
            <CardDescription>Various card layouts and styles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Feature Card</CardTitle>
                  <CardDescription>
                    A simple card with title and description
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className='text-[#A7B0BE]'>
                    This is the main content area of the card. It can contain
                    any content you need.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Action Card</CardTitle>
                  <CardDescription>
                    Card with actions and buttons
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <p className='text-[#A7B0BE]'>
                    This card includes interactive elements.
                  </p>
                  <div className='flex gap-2'>
                    <Button size='sm'>Action</Button>
                    <Button variant='secondary' size='sm'>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className='text-center mt-16 pt-8 border-t border-[#2F343C]'>
          <p className='text-[#7B8494]'>
            Uptick Talent Design System - Modern, Accessible, Beautiful
          </p>
        </div>
      </div>
    </div>
  );
}
