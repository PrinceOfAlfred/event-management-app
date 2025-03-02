// Create a new reusable auth container component
export function AuthContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {children}
      </div>
    </div>
  );
}