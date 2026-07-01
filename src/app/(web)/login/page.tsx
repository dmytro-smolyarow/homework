import { type NextPage } from "next";
import { Suspense } from "react";

import { LoginModule } from "@/app/modules/login";

// page
const Page: NextPage = () => {
  // return
  return (
    <Suspense>
      <LoginModule />
    </Suspense>
  );
};

export default Page;
