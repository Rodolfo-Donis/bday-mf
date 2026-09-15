const LETTER_TEXT = `Fernanda,

Hoy, en tu cumpleaños, quería escribirte unas palabras y desearte de corazón lo mejor en este nuevo año de tu vida.

Creo que has pasado por muchas cosas, algunas buenas y otras no tan buenas, pero también he tenido la oportunidad de ver cómo poco a poco has ido avanzando. Has ido mejorando, solucionando cosas, aprendiendo y haciendo lo mejor que puedes con cada situación que se te presenta. Y creo que eso dice mucho de la mujer que eres.

Por eso, hoy quería darte un abrazo. Uno de esos abrazos que, aunque no pueda darte físicamente en este momento, espero que puedas sentir de alguna manera.

Deseo que Dios te bendiga siempre y que llene tu vida de bendiciones. Que te acompañe en cada cosa que te propongas, en cada decisión que tomes y en cada momento en el que necesites un poco de fuerza para seguir adelante.

Eres una persona única. Eres una mujer fuerte, bonita y con muchísimo por delante. Sigue creyendo en ti, incluso cuando las cosas no salgan como esperabas. Tienes a tu familia, tienes amigas que he podido ver que te apoyan muchísimo y que están ahí para ti. Cuídalas, mantenlas cerca y recuerda que esos vínculos son muy importantes.

Y cuando las cosas se vean mal, no te rindas!!

Como nos ha enseñado Naruto  y otras series , tantas veces, no importa cuántas veces caigamos; lo importante es encontrar la voluntad para levantarnos y continuar. Tu historia todavía tiene muchísimo por delante. Tienes mucho, mucho por vivir, descubrir, aprender y disfrutar.

Estoy seguro de que poco a poco vas a ir recuperándote y encontrando tu camino en cada aspecto de tu vida. No tengo dudas de que puedes hacerlo. Y, sobre todo, deseo que cuides mucho de ti y de tu salud, porque eso es de las cosas más importantes que tienes.

Espero que esta carta no sea demasiado ridícula. La verdad es que quería darte algo físico, un regalito que pudieras guardar, pero a veces hay otras formas de estar presente y de hacerle saber a alguien que lo quieres y que deseas que esté bien.

Y pues, como sabrás, te quiero mucho y me gustas muchísimo. También quiero pedirte disculpas por esas veces en las que ha sido difícil hablarnos, entendernos o simplemente encontrar la manera correcta de comunicarnos. A pesar de todo, quiero que sepas algo:

No estás sola.

Siempre habrá personas que te quieren, que creen en ti y que desean verte bien. Espero poder ser también una de esas personas para ti.

Ojalá hayas pasado un bonito cumpleaños, que hayas sonreído mucho y que hayas podido disfrutar este día con las personas que quieres o disfrutar de un descanso.

Y probablemente esta carta ni siquiera te llegue a tiempo para tu cumpleaños... (errores) y lo siento

Solo quería que tuvieras estas palabras.

Sigue adelante.

Sigue creyendo en ti.

No importa qué tan difícil se vea el camino.

Tú puedes con todo aquello que te propongas.

Y como te lo he dicho siempre:

Brillas!

(Cuando estas feliz, tu risa y tu voz son muy lindas de escuchar)

Nunca dejes que un momento difícil te haga olvidar eso.

Feliz cumpleaños, Fernanda.

Que tus 26 años sean el comienzo de una etapa llena de cosas buenas, nuevas oportunidades, tranquilidad, salud, amor y muchas razones para sonreír.

Y que Dios te bendiga siempre.`
const starLayer = document.getElementById('stars')
const petalLayer = document.getElementById('petals')
const sealButton = document.getElementById('sealButton')
const rolledScroll = document.getElementById('rolledScroll')
const ninjaLetter = document.getElementById('ninjaLetter')
const letterBody = document.getElementById('letterBody')
const musicToggle = document.getElementById('musicToggle')
const midiFileInput = document.getElementById('midiFile')
const midiPlayer = document.getElementById('midiPlayer')
const villageMidi = createVillageMidi()
let midiObjectUrl = ''

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
  letterBody.textContent = ''
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches
  if (prefersReducedMotion) {
    letterBody.textContent = text
    return
  }
  let index = 0
  const timer = window.setInterval(() => {
    letterBody.textContent = text.slice(0, index + 1)
    index += 1
    if (index >= text.length) {
      window.clearInterval(timer)
    }
  }, 18)
}

function openLetter () {
  sealButton.classList.add('is-hidden')
  rolledScroll.classList.add('is-hidden')
  sealButton.setAttribute('aria-expanded', 'true')
  ninjaLetter.classList.add('is-open')
  ninjaLetter.setAttribute('aria-hidden', 'false')
  writeLetter(LETTER_TEXT)
  ninjaLetter.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function setMusicLabel (isPlaying) {
  musicToggle.setAttribute('aria-pressed', String(isPlaying))
  musicToggle.classList.toggle('is-waiting', !isPlaying)
  const label =
    midiObjectUrl && !isPlaying
      ? 'Reproducir MIDI'
      : isPlaying
      ? 'Pausar MIDI'
      : 'Reproducir MIDI'
  musicToggle.querySelector('.music-label').textContent = label
}

function stopAllMusic () {
  villageMidi.stop()
  if (midiPlayer && typeof midiPlayer.stop === 'function') {
    midiPlayer.stop()
  }
  setMusicLabel(false)
}

async function startLoadedMidi () {
  if (!midiPlayer || !midiObjectUrl) {
    return false
  }
  midiPlayer.src = midiObjectUrl
  if (typeof midiPlayer.start === 'function') {
    midiPlayer.start()
    return true
  }
  return false
}

async function toggleMusic () {
  const isMidiPlaying = Boolean(
    midiPlayer && midiPlayer.hasAttribute('playing')
  )
  if (villageMidi.isActive() || isMidiPlaying) {
    stopAllMusic()
    return
  }
  if (midiObjectUrl) {
    const didStart = await startLoadedMidi()
    if (didStart) {
      setMusicLabel(true)
      return
    }
  }
  await villageMidi.start()
  setMusicLabel(true)
}

function loadMidiFile (file) {
  if (!file) {
    return
  }
  stopAllMusic()
  if (midiObjectUrl) {
    URL.revokeObjectURL(midiObjectUrl)
  }
  midiObjectUrl = URL.createObjectURL(file)
  setMusicLabel(false)
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
  sealButton.addEventListener('click', openLetter)
  musicToggle.classList.add('is-waiting')
  musicToggle.addEventListener('click', toggleMusic)
  midiFileInput.addEventListener('change', event => {
    const input = event.target
    loadMidiFile(input.files && input.files[0])
  })
}

initializePage()
