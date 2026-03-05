export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="mx-auto min-h-screen w-full max-w-[460px] bg-base-100 shadow-sm md:shadow-xl">
        <main className="px-4 pb-24 pt-4 md:pb-8 md:pt-20">{children}</main>
      </div>
    </div>
  )
}
