import type { ReactNode } from "react";
import StripeCheckoutRedirect from "./StripeCheckoutRedirect";

export default function CaseDetailLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StripeCheckoutRedirect />
      {children}
    </>
  );
}
