import { type NextPage } from "next";

import { LoginModule } from "@/app/modules/login";

// interface
interface IProps {
  searchParams: Promise<{ redirect?: string | string[] }>;
}

// page
const Page: NextPage<Readonly<IProps>> = async (props) => {
  const { redirect } = await props.searchParams;
  const redirectTo = typeof redirect === "string" ? redirect : "/";

  // return
  return <LoginModule redirectTo={redirectTo} />;
};

export default Page;
