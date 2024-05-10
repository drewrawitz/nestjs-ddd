import TwoStepAuth from "@/components/settings/two-step-auth";

export default async function Settings() {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      <div className="mt-10">
        <TwoStepAuth />
      </div>
    </>
  );
}
