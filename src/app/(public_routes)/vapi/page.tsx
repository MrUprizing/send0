import VapiWidget from "@/components/vapi-test";

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm mt-10">
        <VapiWidget
          publicKey="cdf40822-cac4-4de4-a505-4017e74ad445"
          assistantId="8b2077fb-1a00-4c0e-8407-242c513fea54"
        />
      </div>
    </div>
  );
}
