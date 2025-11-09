import { LoaderIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <div className="h-screen flex items-center justify-center ">
      <LoaderIcon
        role="status"
        aria-label="Loading"
        className={cn('size-8 animate-spin text-indigo-600', className)}
        {...props}
      />
    </div>
  );
}

export default Spinner;
