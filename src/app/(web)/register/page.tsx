import { Suspense } from "react";
import { RegisterModule } from "@/app/modules/register";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterModule />
    </Suspense>
  );
}
