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
import { ThemeToggle } from '@/components/theme-toggle';

export default function ThemeDemo() {
  return (
    <div className='min-h-screen bg-background p-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header with Theme Toggle */}
        <div className='flex justify-between items-center mb-12'>
          <div>
            <h1 className='text-4xl font-bold text-foreground mb-2'>
              Uptick Talent Design System
            </h1>
            <p className='text-muted-foreground text-lg'>
              Featuring Raleway font and smooth light/dark mode transitions
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Theme Demo Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
          {/* Light/Dark Showcase */}
          <Card>
            <CardHeader>
              <CardTitle>Theme System</CardTitle>
              <CardDescription>
                Smooth transitions between light and dark modes
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='p-4 bg-secondary rounded-lg'>
                <p className='text-secondary-foreground'>
                  This content adapts to your theme preference automatically.
                </p>
              </div>
              <div className='flex gap-2'>
                <div className='w-8 h-8 bg-primary rounded'></div>
                <div className='w-8 h-8 bg-secondary rounded'></div>
                <div className='w-8 h-8 bg-muted rounded'></div>
                <div className='w-8 h-8 bg-accent rounded'></div>
              </div>
            </CardContent>
          </Card>

          {/* Button Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Button Components</CardTitle>
              <CardDescription>
                All button variants work in both themes
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex flex-wrap gap-3'>
                <Button variant='default' size='sm'>
                  Primary
                </Button>
                <Button variant='secondary' size='sm'>
                  Secondary
                </Button>
                <Button variant='destructive' size='sm'>
                  Danger
                </Button>
                <Button variant='ghost' size='sm'>
                  Ghost
                </Button>
              </div>
              <Button className='w-full'>Full Width Button</Button>
            </CardContent>
          </Card>
        </div>

        {/* Form Elements */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>
              Inputs and forms that work beautifully in both themes
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>
                  Email Address
                </label>
                <Input type='email' placeholder='you@example.com' />
              </div>
              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>
                  Password
                </label>
                <Input type='password' placeholder='Your secure password' />
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>
                Message
              </label>
              <textarea
                className='w-full h-24 px-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground resize-none focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none'
                placeholder='Type your message here...'
              />
            </div>
          </CardContent>
        </Card>

        {/* Typography Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Typography - Raleway Font</CardTitle>
            <CardDescription>
              Clean, modern typography that looks great in both themes
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <h1 className='text-4xl font-bold text-foreground mb-2'>
                Heading 1
              </h1>
              <h2 className='text-3xl font-semibold text-foreground mb-2'>
                Heading 2
              </h2>
              <h3 className='text-2xl font-medium text-foreground mb-2'>
                Heading 3
              </h3>
              <p className='text-lg text-foreground mb-2'>Large body text</p>
              <p className='text-base text-foreground mb-2'>
                Regular body text
              </p>
              <p className='text-sm text-muted-foreground'>Small muted text</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className='text-center mt-12 pt-8 border-t border-border'>
          <p className='text-muted-foreground'>
            🎨 Uptick Talent Design System with Raleway font and smooth theme
            transitions
          </p>
        </div>
      </div>
    </div>
  );
}
