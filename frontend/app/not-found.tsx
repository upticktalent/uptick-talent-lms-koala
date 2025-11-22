import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-gray-100 p-4 rounded-full">
            <FileQuestion className="w-12 h-12 text-gray-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-gray-900">
            Page Not Found
          </h1>
          <p className="text-gray-600">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link href="/">
            <Button variant="default" className="gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>

          <Link href="javascript:history.back()">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
