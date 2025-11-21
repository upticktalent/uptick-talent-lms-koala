import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assessments",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
