import { SignOut } from "@/components/sign-out";
import { SessionWrapper } from "@/lib/auth/session-wrapper";
const Page = async () => {


  return (
    <>


      <div className="bg-gray-100 rounded-lg p-4 text-center mb-6">
        <p className="text-gray-600">Signed in as to : </p>
        <p className="font-medium">TODO</p>
      </div>

      <SignOut />

    </>
  );
};

export default Page;
