import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cohorts",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
