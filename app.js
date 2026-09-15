const starLayer = document.getElementById('stars')
const petalLayer = document.getElementById('petals')
const sealButton = document.getElementById('sealButton')
const rolledScroll = document.getElementById('rolledScroll')
const ninjaLetter = document.getElementById('ninjaLetter')
const letterBody = document.getElementById('letterBody')
const letterSource = letterBody.textContent.trim()
let isLetterOpen = false

function createStars (count) {
  const fragment = document.createDocumentFragment()
  for (let i = 0; i < count; i += 1) {
    const star = document.createElement('span')
    star.style.left = `${Math.random() * 100}%`
    star.style.top = `${Math.random() * 55}%`
    star.style.animationDelay = `${Math.random() * 3}s`
    fragment.append(star)
  }
  starLayer.append(fragment)
}

function createPetals (count) {
  const fragment = document.createDocumentFragment()
  for (let i = 0; i < count; i += 1) {
    const petal = document.createElement('span')
    const drift = `${(Math.random() * 80 - 40).toFixed(0)}px`
    petal.className = 'petal'
    petal.style.left = `${Math.random() * 100}%`
    petal.style.setProperty('--drift', drift)
    petal.style.animationDuration = `${8 + Math.random() * 8}s`
    petal.style.animationDelay = `${Math.random() * 8}s`
    fragment.append(petal)
  }
  petalLayer.append(fragment)
}

function writeLetter (text) {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches
  if (prefersReducedMotion) {
    letterBody.textContent = text
    return
  }
  letterBody.textContent = ''
  let index = 0
  const charsPerTick = 28
  const timer = window.setInterval(() => {
    index = Math.min(text.length, index + charsPerTick)
    letterBody.textContent = text.slice(0, index)
    if (index >= text.length) {
      window.clearInterval(timer)
    }
  }, 16)
}

function openLetter (event) {
  if (event) {
    event.preventDefault()
  }
  if (isLetterOpen) {
    ninjaLetter.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }
  isLetterOpen = true
  sealButton.classList.add('is-hidden')
  rolledScroll.classList.add('is-hidden')
  ninjaLetter.classList.add('is-open')
  writeLetter(letterSource)
  ninjaLetter.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function isLetterHash () {
  return window.location.hash === '#ninjaLetter'
}

function initializePage () {
  const isNarrow = window.matchMedia('(max-width: 800px)').matches
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches
  createStars(0)
  if (!reduceMotion) {
    createPetals(isNarrow ? 6 : 10)
  }
  const openControls = document.querySelectorAll('[href="#ninjaLetter"]')
  openControls.forEach(control => {
    control.addEventListener('click', openLetter)
  })
  window.addEventListener('hashchange', () => {
    if (isLetterHash()) {
      openLetter()
    }
  })
  if (isLetterHash()) {
    openLetter()
  }
}

initializePage()
