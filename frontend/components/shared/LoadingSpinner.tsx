import { LoaderCircle } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-64">
      <div className="text-gray-600">
        <LoaderCircle className="text-indigo-600 animate-spin w-8 h-8" />
      </div>
    </div>
  );
}
