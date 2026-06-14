export function PixelFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="w-full border-t-2 border-pixel-border bg-pixel-panel/50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-pixel text-sm text-pixel-muted">
          Character Career Blueprint
        </span>
        <div className="flex items-center gap-4">
          <span className="font-press text-[0.42rem] text-pixel-muted">
            © {year} · All rights reserved
          </span>
        </div>
      </div>
    </footer>
  )
}
