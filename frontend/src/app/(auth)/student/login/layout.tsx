import Box from "@/components/ui/box";

export default function StudentLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box>
      {children}
    </Box>
  );
}
