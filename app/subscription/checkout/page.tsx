import { CheckoutSuccessPage } from "@/components/features/checkout";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function Page({ searchParams }: PageProps) {
  return <CheckoutSuccessPage searchParams={searchParams} />;
}