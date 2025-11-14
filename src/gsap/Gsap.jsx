import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect } from 'react'
gsap.registerPlugin(ScrollTrigger)

export const useToggleMenuAnimation = (element, show) => {
  useEffect(() => {
    if (!element) return

    if (show) {
      element.style.display = 'block'
      gsap.fromTo(
        element,
        { height: 0, opacity: 0 },
        {
          height: 'auto',
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        }
      )
    } else {
      gsap.to(element, {
        height: 0,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          element.style.display = 'none'
        },
      })
    }
  }, [element, show])
}

//Animacion NavBar
export const navBarAnimate = ({
  logo_nav_ref,
  button_inicio,
  button_menu,
  button_contact,
  button_login,
}) => {
  const elements = [
    logo_nav_ref,
    button_inicio,
    button_menu,
    button_contact,
    button_login,
  ].filter(Boolean)

  gsap.fromTo(
    elements,
    {
      scale: 0,
      opacity: 0,
      visibility: 'hidden',
    },
    {
      scale: 1,
      opacity: 1,
      visibility: 'visible',
      ease: 'power3.out',
      duration: 1,
    }
  )

  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())

  gsap.to('#header', {
    background: 'white',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
    ease: 'none',
    scrollTrigger: {
      trigger: document.body,
      start: 'top+=200 top',
      end: '+=1',
      scrub: 1,
    },
  })
}

//Animacion del inicio
export const inicioAnimate = ({
  taza_cafe_con_leche_ref,
  taza_cafe_negro_ref,
  hot_dog_ref,
}) => {
  gsap.fromTo(
    ['#title', taza_cafe_con_leche_ref, taza_cafe_negro_ref, hot_dog_ref],
    {
      scale: 0,
      opacity: 0,
      visibility: 'hidden',
    },
    {
      scale: 1,
      opacity: 1,
      visibility: 'visible',
      ease: 'power3.out',
      duration: 1,
    }
  )

  gsap.to([taza_cafe_con_leche_ref, taza_cafe_negro_ref, hot_dog_ref], {
    translateY: -100,
    ease: 'none',
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: '+=800',
      scrub: 1,
    },
  })
}

export const menuAnimate = (toolBar) => {
  gsap.to(toolBar, {
    background: '#fff2d7',
    ease: 'none',
    scrollTrigger: {
      trigger: toolBar,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  })
}
