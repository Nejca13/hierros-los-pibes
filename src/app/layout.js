import ImageCoffe from '@/components/ImageCoffe/ImageCoffe'
import Navbar from '@/components/Navbar/Navbar'
import { Agbalumo, Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-poppins',
})

const agbalumo = Agbalumo({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-agbalumo',
})

export const metadata = {
  metadataBase: new URL('https://sportiumcafe.com/'),
  title: 'Hierro Los Pibes - Café de Especialidad y Pancho con Sabor',
  description:
    'Hierro Los Pibes es el lugar ideal para disfrutar café de especialidad, panchos artesanales y momentos que reconfortan el alma.',
  keywords:
    'Hierro Los Pibes, cafetería, panchos, hot dogs, café de especialidad, café artesanal, café, pastelería, merienda, brunch, desayuno, espresso, cappuccino, comida rápida, ambiente cálido, café para llevar',
  author: 'Hierro Los Pibes',
  openGraph: {
    title: 'Hierro Los Pibes - Café de Especialidad y Panchos con Sabor',
    description:
      'Descubrí Hierro Los Pibes, tu nuevo punto de encuentro para saborear café de calidad, panchos únicos y un ambiente acogedor.',
    images: 'https://sportiumcafe.com/image.jpeg',
    url: 'https://sportiumcafe.com/',
    type: 'website',
    site_name: 'Hierro Los Pibes',
  },
  alternates: {
    canonical: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hierro Los Pibes - Café y Panchos que Inspiran',
    description:
      'Vení a Hierro Los Pibes y disfrutá café de especialidad, panchos artesanales, meriendas únicas y un espacio donde cada detalle cuenta.',
    images: 'https://sportiumcafe.com/image.jpeg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang='es'>
      <body className={`${poppins.className} ${agbalumo.variable}`}>
        <Navbar />
        <ImageCoffe />
        {children}
      </body>
    </html>
  )
}
