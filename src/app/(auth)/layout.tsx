import { ConvexClientProvider } from "@/components/ConvexClientProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
