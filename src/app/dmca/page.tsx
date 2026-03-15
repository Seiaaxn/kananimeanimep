'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Shield, Mail, AlertTriangle } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'

export default function DMCAPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 h-14 px-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet-500" />
            <h1 className="text-lg font-bold text-foreground">DMCA Policy</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Important Notice */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-5 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-bold text-foreground mb-2">PENGUMUMAN PENTING (DISCLAIMER)</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Situs ini <span className="text-foreground font-semibold">(KANANIMEID)</span> TIDAK menyimpan, menghosting,
                atau mengunggah file video, gambar, atau media apa pun di server kami sendiri.
              </p>
            </div>
          </div>
        </div>

        {/* Content Source */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Semua konten, tautan streaming, dan video yang ada di situs ini disediakan secara otomatis oleh server pihak
            ketiga (seperti Google Drive, Mega, Vidstreaming, dan lainnya) yang tidak kami kelola dan berada di luar kendali kami.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed mt-3">
            Kami hanya bertindak sebagai mesin pencari/direktori yang mengumpulkan tautan yang sudah tersebar secara publik di internet.
          </p>
        </div>

        {/* Section 1 */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-500 text-sm flex items-center justify-center font-bold">1</span>
            Kebijakan Hak Cipta
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Kami sangat menghormati hak kekayaan intelektual (HAKI) dan mematuhi Digital Millennium Copyright Act (DMCA).
            Hak cipta dari semua anime, karakter, musik, dan aset visual adalah milik masing-masing studio animasi dan
            perusahaan pemegang hak cipta yang sah.
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-500 text-sm flex items-center justify-center font-bold">2</span>
            Prosedur Permintaan Penghapusan (Takedown)
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-3">
            Karena kami tidak menyimpan file di server kami, kami tidak dapat menghapus video langsung dari sumbernya.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Jika Anda menemukan konten yang melanggar hak cipta Anda, tindakan paling efektif adalah meminta penghapusan
            langsung kepada penyedia hosting file pihak ketiga tempat video tersebut disimpan.
          </p>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-foreground text-sm font-medium mb-2">
              Jika Anda ingin kami menghapus tautan/indeks dari situs kami, kirimkan laporan tertulis yang berisi:
            </p>
            <ul className="text-muted-foreground text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Bukti bahwa Anda adalah pihak yang berwenang atas konten tersebut.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Identifikasi konten berhak cipta yang diklaim telah dilanggar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>URL persis dari halaman di situs kami yang memuat tautan tersebut.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Informasi kontak Anda (Email dan Nama Lengkap).</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 3 - Contact */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-500 text-sm flex items-center justify-center font-bold">3</span>
            Kontak Kami
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Silakan kirim email pemberitahuan penghapusan DMCA Anda ke:
          </p>
          <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <Mail className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">admin@kananimeid.com</span>
          </div>
          <p className="text-muted-foreground text-xs mt-4">
            * Kami akan memproses permohonan penghapusan URL dari direktori kami selambat-lambatnya dalam waktu 3-5 hari
            kerja setelah email diterima dan divalidasi.
          </p>
        </div>

        {/* Footer Note */}
        <div className="text-center text-muted-foreground text-xs pt-4">
          <p>KANANIMEID does not host any files, it merely pulls streams from 3rd party services.</p>
          <p className="mt-1">Legal issues should be taken up with the file hosts and providers.</p>
          <p className="mt-1">KANANIMEID is not responsible for any media files shown by the video providers.</p>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
