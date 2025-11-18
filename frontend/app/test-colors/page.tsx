'use client';

import { ThemeToggle } from '@/components/theme-toggle';

export default function TestColorsPage() {
  return (
    <div className='min-h-screen bg-background p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold text-foreground'>
            Color System Test
          </h1>
          <ThemeToggle />
        </div>

        <div className='grid gap-6'>
          {/* Primary Colors */}
          <section>
            <h2 className='text-xl font-semibold mb-4 text-foreground'>
              Primary Colors
            </h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='bg-primary text-primary-foreground p-4 rounded-lg'>
                <p className='font-medium'>Primary</p>
                <p className='text-sm opacity-90'>bg-primary</p>
              </div>
              <div className='bg-secondary text-secondary-foreground p-4 rounded-lg'>
                <p className='font-medium'>Secondary</p>
                <p className='text-sm opacity-90'>bg-secondary</p>
              </div>
              <div className='bg-accent text-accent-foreground p-4 rounded-lg'>
                <p className='font-medium'>Accent</p>
                <p className='text-sm opacity-90'>bg-accent</p>
              </div>
              <div className='bg-muted text-muted-foreground p-4 rounded-lg'>
                <p className='font-medium'>Muted</p>
                <p className='text-sm opacity-90'>bg-muted</p>
              </div>
            </div>
          </section>

          {/* Status Colors */}
          <section>
            <h2 className='text-xl font-semibold mb-4 text-foreground'>
              Status Colors
            </h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='bg-success text-white p-4 rounded-lg'>
                <p className='font-medium'>Success</p>
                <p className='text-sm opacity-90'>bg-success</p>
              </div>
              <div className='bg-warning text-white p-4 rounded-lg'>
                <p className='font-medium'>Warning</p>
                <p className='text-sm opacity-90'>bg-warning</p>
              </div>
              <div className='bg-danger text-white p-4 rounded-lg'>
                <p className='font-medium'>Danger</p>
                <p className='text-sm opacity-90'>bg-danger</p>
              </div>
              <div className='bg-info text-white p-4 rounded-lg'>
                <p className='font-medium'>Info</p>
                <p className='text-sm opacity-90'>bg-info</p>
              </div>
            </div>
          </section>

          {/* Text Colors */}
          <section>
            <h2 className='text-xl font-semibold mb-4 text-foreground'>
              Text Colors
            </h2>
            <div className='space-y-2'>
              <p className='text-primary'>Primary text color (text-primary)</p>
              <p className='text-secondary-foreground'>
                Secondary text (text-secondary-foreground)
              </p>
              <p className='text-muted-foreground'>
                Muted text (text-muted-foreground)
              </p>
              <p className='text-success'>Success text (text-success)</p>
              <p className='text-warning'>Warning text (text-warning)</p>
              <p className='text-danger'>Danger text (text-danger)</p>
            </div>
          </section>

          {/* Border Colors */}
          <section>
            <h2 className='text-xl font-semibold mb-4 text-foreground'>
              Border Colors
            </h2>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              <div className='border-2 border-primary p-4 rounded-lg bg-card'>
                <p className='text-card-foreground'>Primary border</p>
                <p className='text-sm text-muted-foreground'>border-primary</p>
              </div>
              <div className='border-2 border-secondary p-4 rounded-lg bg-card'>
                <p className='text-card-foreground'>Secondary border</p>
                <p className='text-sm text-muted-foreground'>
                  border-secondary
                </p>
              </div>
              <div className='border-2 border-border p-4 rounded-lg bg-card'>
                <p className='text-card-foreground'>Default border</p>
                <p className='text-sm text-muted-foreground'>border-border</p>
              </div>
            </div>
          </section>

          {/* Cards */}
          <section>
            <h2 className='text-xl font-semibold mb-4 text-foreground'>
              Card Variants
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='bg-card text-card-foreground p-6 rounded-lg border border-border'>
                <h3 className='font-semibold mb-2'>Default Card</h3>
                <p className='text-muted-foreground'>
                  This is a card with default styling using bg-card and
                  text-card-foreground.
                </p>
              </div>
              <div className='bg-popover text-popover-foreground p-6 rounded-lg border border-border shadow-lg'>
                <h3 className='font-semibold mb-2'>Popover Style</h3>
                <p className='text-muted-foreground'>
                  This uses popover colors with bg-popover and
                  text-popover-foreground.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
