import { Suspense } from "react";
import { LoginModule } from "@/app/modules/login";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginModule />
    </Suspense>
  );
}
