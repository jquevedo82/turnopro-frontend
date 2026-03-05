export const Spinner = ({ size = "md" }: { size?: "sm"|"md"|"lg" }) => {
  const s = { sm:"h-4 w-4", md:"h-6 w-6", lg:"h-10 w-10" }[size];
  return (
    <div className={`${s} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Spinner size="lg" />
      <p className="mt-3 text-sm text-gray-400">Cargando...</p>
    </div>
  </div>
);
