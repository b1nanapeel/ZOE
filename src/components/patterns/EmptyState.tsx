export function PatternEmpty({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-200 bg-white px-6 py-10 text-center">
      <p className="text-sm text-neutral-600">{message}</p>
    </div>
  );
}
