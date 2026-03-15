'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'

export default function TOSPage() {
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
            <FileText className="w-5 h-5 text-rose-500" />
            <h1 className="text-lg font-bold text-foreground">Syarat & Ketentuan</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-3">
            Selamat datang di armada KANANIMEID!
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Dengan mengakses dan menggunakan situs web kami, Anda setuju untuk mematuhi Syarat dan Ketentuan berikut.
            Harap baca dengan saksama sebelum mulai berlayar (menonton) di kapal ini.
          </p>
        </div>

        {/* Section 1 */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">1</span>
            Layanan "Sebagaimana Adanya"
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Situs ini disediakan sepenuhnya secara gratis. Kami tidak memberikan jaminan terkait kecepatan pemutaran,
            ketersediaan server, atau keberadaan takarir (subtitle) yang akurat. Semua konten video di-streaming dari pihak ketiga.
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">2</span>
            Peringatan Pihak Ketiga & Iklan
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-3">
            Untuk mempertahankan keberlangsungan kapal ini, kami mungkin menampilkan iklan yang disediakan oleh jaringan
            iklan pihak ketiga. Kami tidak memiliki kendali penuh atas konten iklan luar tersebut.
          </p>
          <ul className="text-muted-foreground text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">•</span>
              <span>Anda diwajibkan berhati-hati saat mengklik tautan keluar.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">•</span>
              <span>Kami tidak bertanggung jawab atas kerugian atau masalah yang diakibatkan oleh situs atau layanan pihak ketiga.</span>
            </li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">3</span>
            Aturan Kru (User Conduct)
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-3">
            Bagi Nakama yang mendaftar dan menggunakan fitur komunitas (seperti kolom komentar), Anda dilarang keras untuk:
          </p>
          <ul className="text-muted-foreground text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">✗</span>
              <span>Menyebarkan ujaran kebencian, ancaman, atau pelecehan SARA.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">✗</span>
              <span>Melakukan Spamming (berkomentar sampah berulang kali).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">✗</span>
              <span>Menyebarkan Spoiler berat tanpa peringatan yang merusak pengalaman menonton Nakama lain.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">✗</span>
              <span>Membagikan tautan berbahaya (Phishing / Malware).</span>
            </li>
          </ul>
          <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <p className="text-red-400 text-sm font-medium">
              ⚠️ Pelanggaran atas aturan ini akan mengakibatkan akun Anda dijatuhi sanksi (Ban Permanen).
            </p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">4</span>
            Larangan Bot & Scraping
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Sistem keamanan kami melarang penggunaan bot otomatis, crawler, atau perangkat lunak ekstraksi data untuk
            menguras (scrape) database atau membebani server kami (DDoS). Tindakan ini akan diblokir otomatis oleh sistem keamanan.
          </p>
        </div>

        {/* Section 5 */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">5</span>
            Perubahan Ketentuan
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Kami berhak mengubah, menghapus, atau menambahkan Syarat dan Ketentuan ini kapan saja tanpa pemberitahuan
            sebelumnya. Pengguna diharapkan untuk rutin memeriksa halaman ini.
          </p>
        </div>

        {/* Footer Note */}
        <div className="text-center text-muted-foreground text-xs pt-4">
          <p>KANANIMEID does not host any files, it merely pulls streams from 3rd party services.</p>
          <p className="mt-1">Legal issues should be taken up with the file hosts and providers.</p>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
