import { type NextPage } from "next";
import { Suspense } from "react";

import { RegisterModule } from "@/app/modules/register";

// page
const Page: NextPage = () => {
  // return
  return (
    <Suspense>
      <RegisterModule />
    </Suspense>
  );
};

export default Page;
