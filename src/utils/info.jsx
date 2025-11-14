import expresso_con_leche from '@/assets/images/expresso_con_leche.avif'
import cafe_frio from '@/assets/images/cafe_frio.avif'
import infuciones from '@/assets/images/infuciones.avif'
import exprimidos from '@/assets/images/exprimidos.png'
import clasicos from '@/assets/images/clasicos.avif'
import yogurt from '@/assets/images/yogurt.avif'
import pasteleria from '@/assets/images/pasteleria.avif'
import LuCoffe from '@/assets/icons/LuCoffe'
import LuLeaf from '@/assets/icons/LuLeaf'
import LuGlassWater from '@/assets/icons/LuGlassWater'
import LuCroissant from '@/assets/icons/LuCroissant'
import LuIceCream from '@/assets/icons/LuIceCream'
import LuCake from '@/assets/icons/LuCake'
import LuIceCoffe from '@/assets/icons/LuIceCoffe'

export const productos = [
  {
    icon: <LuCoffe width='18px' height='18px' color='var(--marron)' />,
    titulo: 'Expreso con leche',
    imagen: expresso_con_leche,
    items: [
      {
        nombre: 'Expreso con leche',
        descripcion: 'Un café intenso con un toque cremoso de leche.',
        precio: 300,
      },
      {
        nombre: 'Latte',
        descripcion:
          'Un café suave con abundante leche, ideal para los amantes del sabor cremoso.',
        precio: 350,
      },
      {
        nombre: 'Lágrima',
        descripcion:
          'Café con un toque sutil de leche, para los que prefieren un café más fuerte.',
        precio: 320,
      },
      {
        nombre: 'Flat White',
        descripcion: 'Un café suave y cremoso con una textura aterciopelada.',
        precio: 380,
      },
      {
        nombre: 'Latte Vainilla',
        descripcion: 'Un latte tradicional con un toque delicado de vainilla.',
        precio: 370,
      },
      {
        nombre: 'Mocaccino',
        descripcion:
          'Un delicioso café con chocolate, una mezcla perfecta de dulce y amargo.',
        precio: 400,
      },
    ],
  },
  {
    icon: <LuIceCoffe width='18px' height='18px' color='var(--marron)' />,
    titulo: 'Café frío',
    imagen: cafe_frio,
    items: [
      {
        nombre: 'Iced Coffee',
        descripcion: 'Café frío para refrescarte, ideal en días calurosos.',
        precio: 450,
      },
      {
        nombre: 'Vainilla Iced',
        descripcion: 'Un café frío con un toque dulce y suave de vainilla.',
        precio: 460,
      },
    ],
  },
  {
    icon: <LuLeaf width='18px' height='18px' color='var(--marron)' />,
    titulo: 'Infusiones',
    imagen: infuciones,
    items: [
      {
        nombre: 'Té negro (En hebras)',
        descripcion:
          'Té negro premium, de hojas enteras para una infusión profunda.',
        precio: 250,
      },
      {
        nombre: 'Té Rojo (En hebras)',
        descripcion:
          'Té rojo, con un sabor fuerte y característico, ideal para los paladares más exigentes.',
        precio: 270,
      },
      {
        nombre: 'Matecocido',
        descripcion:
          'El tradicional mate cocido argentino, para disfrutar en cualquier momento del día.',
        precio: 220,
      },
    ],
  },
  {
    icon: <LuGlassWater width='18px' height='18px' color='var(--marron)' />,
    titulo: 'Frios',
    imagen: exprimidos,
    items: [
      {
        nombre: 'Exprimido',
        descripcion:
          'Un jugo de naranja fresco y natural, para comenzar el día con energía.',
        precio: 200,
      },
      {
        nombre: 'Limonada Clásica',
        descripcion:
          'Limonada fresca, perfecta para un toque refrescante y ácido.',
        precio: 220,
      },
    ],
  },
  {
    icon: <LuCroissant width='18px' height='18px' color='var(--marron)' />,

    titulo: 'Clásicos',
    imagen: clasicos,
    items: [
      {
        nombre: 'Medialunas',
        descripcion:
          'El clásico desayuno argentino, suave y hojoso, ideal con un café.',
        precio: 180,
      },
      {
        nombre: 'Medialunas J&Q',
        descripcion:
          'Medialunas rellenas con una mezcla deliciosa de sabores J&Q.',
        precio: 210,
      },
      {
        nombre: 'Medialunas Grandes',
        descripcion:
          'Medialunas de mayor tamaño, con una textura suave y un toque delicado.',
        precio: 250,
      },
      {
        nombre: 'Croissant Clásico',
        descripcion:
          'El clásico croissant, crujiente por fuera y suave por dentro.',
        precio: 270,
      },
      {
        nombre: 'Croissant Relleno Avellanas',
        descripcion:
          'Croissant relleno con una crema de avellanas, para un toque dulce y cremoso.',
        precio: 320,
      },
      {
        nombre: 'Croissant Relleno Pastelera',
        descripcion:
          'Croissant relleno con crema pastelera, un clásico delicioso.',
        precio: 300,
      },
      {
        nombre: 'Tostados J&Q',
        descripcion:
          'Tostados de pan con una mezcla especial de ingredientes J&Q.',
        precio: 240,
      },
      {
        nombre: 'Tostadas con Dips',
        descripcion:
          'Tostadas acompañadas con dips variados, para disfrutar a cualquier hora.',
        precio: 280,
      },
      {
        nombre: 'Chipa',
        descripcion:
          'Un bocadito salado y esponjoso, perfecto para acompañar cualquier bebida.',
        precio: 150,
      },
    ],
  },
  {
    icon: <LuIceCream width='18px' height='18px' color='var(--marron)' />,

    titulo: 'Yogurt',
    imagen: yogurt,
    items: [
      {
        nombre: 'Yogurt, granola, colchón de frutas de estación',
        descripcion:
          'Yogurt fresco con granola crujiente y frutas de temporada, saludable y delicioso.',
        precio: 350,
      },
    ],
  },
  {
    icon: <LuCake width='18px' height='18px' color='var(--marron)' />,

    titulo: 'Pastelería',
    imagen: pasteleria,
    items: [
      {
        nombre: 'Cookie Red Velvet',
        descripcion:
          'Una galleta suave y colorida con un toque de red velvet, deliciosa y atractiva.',
        precio: 180,
      },
      {
        nombre: 'Cookie pistacho & chocolate blanco',
        descripcion:
          'Galleta con pistachos y chocolate blanco, para los que buscan una mezcla de sabores intensos.',
        precio: 200,
      },
      {
        nombre: 'Cookie Chocolate & Nuez',
        descripcion:
          'Galleta con trozos de chocolate y nueces, una combinación clásica de texturas.',
        precio: 190,
      },
      {
        nombre: 'Budín limón',
        descripcion:
          'Budín esponjoso con un toque refrescante de limón, perfecto para el té.',
        precio: 220,
      },
      {
        nombre: 'Budín Matilda',
        descripcion:
          'Un budín suave y delicioso, inspirado en la clásica receta Matilda.',
        precio: 240,
      },
      {
        nombre: 'Budín vainilla',
        descripcion:
          'Un budín suave y delicioso con el toque clásico de vainilla.',
        precio: 230,
      },
      {
        nombre: 'Lingote Cheesecake',
        descripcion:
          'Un pedazo de cheesecake en forma de lingote, con una textura cremosa y dulce.',
        precio: 290,
      },
      {
        nombre: 'Lingote Chocotorta',
        descripcion:
          'Lingote de chocotorta, un postre tradicional argentino con capas de galletas y crema.',
        precio: 260,
      },
    ],
  },
]
export const categorias = [
  'Expreso con leche',
  'Café frío',
  'Infusiones',
  'Frios',
  'Clásicos',
  'Yogurt',
  'Pastelería',
]
