export default function StudentFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t mt-auto" style={{ borderColor: "#E2E8F0", background: "#F9FBFD" }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs" style={{ color: "#94A3B8" }}>
          © {year} Ghana Communication Technology University. All rights reserved.
        </p>
        <p className="text-xs" style={{ color: "#CBD5E1" }}>
          Exam Portal · v1.0
        </p>
      </div>
    </footer>
  )
}
