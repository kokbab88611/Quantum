import { useId, useState } from 'react'
import catExperiment from './assets/cat-experiment.jpg'
import './App.css'

type Bit = 0 | 1

function StateDiagram({ angle, p0 }: { angle: number; p0?: number }) {
  const clipId = useId()
  const [rotation, setRotation] = useState(angle)
  // Use the equivalent angle nearest the previous one so the needle takes the short path.
  const delta = (angle - rotation) % 360
  const fullTurn = Math.abs(delta) > 180 ? Math.sign(delta) * 360 : 0
  const nextRotation = rotation + delta - fullTurn
  if (rotation !== nextRotation) setRotation(nextRotation)

  return (
    <svg className="diagram" viewBox="0 0 210 205" aria-hidden="true">
      <circle cx="105" cy="102" r="70" fill="#eaf0e5" stroke="#889b8e" />
      <g fill="none" stroke="#a6b5a8">
        <ellipse cx="105" cy="102" rx="70" ry="17" />
        <ellipse cx="105" cy="102" rx="34" ry="70" />
        <path d="M105 32v140" />
      </g>
      {p0 !== undefined && (
        <>
          <clipPath id={clipId}>
            <circle cx="105" cy="102" r="70" />
          </clipPath>
          <g clipPath={`url(#${clipId})`}>
            <line className="probability-guide" x1="35" x2="175" y1="102" y2="102"
              stroke="#284e95" strokeDasharray="4 4"
              style={{ transform: `translateY(${(50 - p0) * 1.4}px)` }} />
          </g>
        </>
      )}
      <g className="needle" style={{ transform: `rotate(${nextRotation}deg)` }} fill="#284e95">
        <path d="M103 102V46h-4l6-14 6 14h-4v56z" />
        <circle cx="105" cy="102" r="3" />
      </g>
      <g textAnchor="middle" fontSize="14">
        <text x="105" y="22">0</text>
        <text x="105" y="193">1</text>
      </g>
    </svg>
  )
}

function StartingStates() {
  const [bit, setBit] = useState<Bit>(0)
  const [isSuperposed, setIsSuperposed] = useState(false)

  function chooseBit(value: Bit) {
    setIsSuperposed(false)
    setBit(value)
  }

  return (
    <section className="opening" aria-labelledby="qubit-heading">
      <h2 id="qubit-heading">Meet a qubit.</h2>
      <p>Choose 0 or 1 to give both the same starting value. Then try Superposition.</p>
      <div className="state-pair">
        <figure>
          <h3>Bit</h3>
          <svg className={isSuperposed ? 'diagram bit-error' : 'diagram'} viewBox="0 0 210 205" aria-hidden="true">
            <rect className="bit-track" x="27" y="80" width="156" height="44" rx="22" fill="#eaf0e5" stroke="#889b8e" />
            <g textAnchor="middle" fontSize="14">
              <text x="53" y="70">0</text>
              <text x="157" y="70">1</text>
            </g>
            <circle className="bit-dot" style={{ cx: bit === 0 ? '53px' : '157px' }} cy="102" r="16" fill="#284e95" />
            {isSuperposed && (
              <text className="bit-error-label" x="105" y="102" textAnchor="middle" dominantBaseline="central">Error</text>
            )}
          </svg>
          <output aria-label="Bit state">{isSuperposed ? 'Unavailable' : `State: ${bit}`}</output>
        </figure>
        <figure>
          <h3>Qubit</h3>
          <StateDiagram angle={isSuperposed ? 90 : bit * 180} />
          <output aria-label="Qubit state">{isSuperposed ? 'Superposition' : `State: ${bit}`}</output>
        </figure>
      </div>
      <div className="actions" role="group" aria-label="Compare bit and qubit states">
        {([0, 1] as const).map(value => (
          <button key={value} aria-pressed={!isSuperposed && value === bit} onClick={() => chooseBit(value)}>{value}</button>
        ))}
        <button aria-pressed={isSuperposed} onClick={() => setIsSuperposed(true)}>Superposition</button>
      </div>
      <p>A classical bit has a definite value of either 0 or 1. However, a quit can exist in a super position of these two states. When measured in the computational basis, it would still give us only one result of 0 or 1</p>
    </section>
  )
}

function randomBit(probabilityOfZero = 0.5): Bit {
  return Math.random() < probabilityOfZero ? 0 : 1
}

function hadamardAngle(bit: Bit) {
  return bit === 0 ? 90 : -90
}

function HadamardFlow() {
  return (
    <section aria-labelledby="hadamard-flow-heading">
      <h2 id="hadamard-flow-heading">What happens when we apply H twice?</h2>
      <figure className="hadamard-flow" aria-label="Two Hadamard gates applied to state 0">
        <div className="hadamard-stage">
          <span className="hadamard-state">0</span>
          <span>Initial state</span>
          <span className="hadamard-probability">100% / 0%</span>
        </div>
        <div className="hadamard-connector"><span>H</span></div>
        <div className="hadamard-stage">
          <span className="hadamard-state hadamard-superposition">ψ</span>
          <span>Super<wbr />position</span>
          <span className="hadamard-probability">50% / 50%</span>
        </div>
        <div className="hadamard-connector"><span>H</span></div>
        <div className="hadamard-stage">
          <span className="hadamard-state">0</span>
          <span>Restored</span>
          <span className="hadamard-probability">100% / 0%</span>
        </div>
      </figure>
      <p>With no measurement in between, two H gates always restore the initial state.</p>
    </section>
  )
}

const sampleSize = 100
const sampleProbabilityOfZero = 0.7

function MeasurementExperiment() {
  const [outcomes, setOutcomes] = useState<Bit[]>([])
  const showResults = outcomes.length > 0
  const zeroCount = outcomes.filter(outcome => outcome === 0).length
  const oneCount = outcomes.length - zeroCount

  function toggleMeasurement() {
    setOutcomes(showResults ? [] : Array.from({ length: sampleSize }, () => randomBit(sampleProbabilityOfZero)))
  }

  return (
    <section aria-labelledby="measurement-estimate-heading">
      <h2 id="measurement-estimate-heading">How can we estimate measurement probabilities in a superposition?</h2>
      <p>Imagine we have 100 qubits, all prepared in the same way using the same initial state and quantum operations. This means they are all in the same superposition.</p>
      <p>Measure each qubit once and count how many times each outcome appears.</p>
      <div className="measurement-grid" aria-hidden="true">
        {Array.from({ length: sampleSize }, (_, index) => {
          const outcome = outcomes[index]
          return (
            <span className="measurement-qubit" key={index} data-outcome={outcome}>
              {outcome ?? 'Q'}
            </span>
          )
        })}
      </div>
      <button className="primary measurement-action" onClick={toggleMeasurement}>
        {showResults ? 'Prepare again' : 'Measure'}
      </button>
      <output className="measurement-results" aria-label="Measurement results">
        <span>0: {showResults ? `${zeroCount} (${Math.round(zeroCount * 100 / sampleSize)}%)` : '—'}</span>
        <span>1: {showResults ? `${oneCount} (${Math.round(oneCount * 100 / sampleSize)}%)` : '—'}</span>
      </output>
      <p>We used 100 qubits to keep the experiment manageable. With more qubits prepared in the same state and measured independently, the observed proportions tend to get closer to the theoretical probabilities. The results can vary each try.</p>
    </section>
  )
}

function CatExperiment() {
  const [outcome, setOutcome] = useState<Bit | null>(null)
  const [showLimit, setShowLimit] = useState(false)
  const closed = outcome === null
  const name = outcome === 1 ? 'Alive' : 'Dead'

  function toggleBox() {
    setOutcome(closed ? randomBit() : null)
    setShowLimit(false)
  }

  return (
    <>
      <CatSymbols />
      <section aria-labelledby="cat-heading">
        <h2 id="cat-heading">Schrödinger’s cat.</h2>
        <p>Imagine a sealed box containing a cat, a radioactive atom, a geiger counter, a hammer, and a vial of toxic chemical. In this experiment, the atom has a 50% chance of decaying within one hour.</p>
        <figure className="apparatus-figure">
          <img className="apparatus" src={catExperiment} width={1754} height={896} alt="Inside the box, a radiation symbol marks the source beside a Geiger counter. A raised hammer hangs above a bottle labeled Toxic, with the cat sitting to its right." />
          <figcaption>If the atom decays, the counter triggers the hammer, the vial with toxic gas breaks, and the cat dies. Otherwise, the cat lives.</figcaption>
        </figure>
      </section>
      <section className="box-scene" aria-labelledby="box-heading">
        <p className="clock">1 hour later</p>
        <h3 id="box-heading">What’s inside the box?</h3>
        <p>In the ideal model, the atom and cat together are described as a superposition of alive and dead outcomes, each paired with its atomic state.</p>
        <div className="box-stage">
          <div className="box-illustration">
            <svg className="case" viewBox="0 0 300 168" width="300" height="168" role="img" aria-labelledby="case-title">
              <title id="case-title">{closed ? 'Sealed box marked Superposition' : 'Open box: ' + name}</title>
              {!closed && <use href={outcome === 1 ? '#cat' : '#ghost'} transform="translate(91 -9) scale(1.15)" />}
              <path className={closed ? 'box-lid' : 'box-lid open'}
                d="M36 85h228v13H36z" fill="#eddfc7" stroke="currentColor" strokeWidth="2.5" />
              <path d="M42 98h216l-3 56H45z" stroke="currentColor" strokeWidth="2.5" fill="#dbcaab" />
              {closed && <text x="150" y="132" textAnchor="middle">Superposition</text>}
            </svg>
            <div className="actions box-actions">
              <button className="primary" onClick={toggleBox}>
                <span aria-hidden={!closed}>Open</span>
                <span aria-hidden={closed}>Close and try again</span>
              </button>
              <button aria-hidden={closed} aria-controls="box-conclusion" aria-expanded={showLimit}
                onClick={() => setShowLimit(true)}>Undo</button>
            </div>
          </div>
          <div className="box-details" aria-hidden={closed}>
            <p role="status" className="result-label">
              {name} <span className="outcome-meaning">— equivalent to {outcome ?? 0}</span>
            </p>
            <p>Opening the box represents a measurement. When you measure a qubit in the 0/1 basis, its state collapses to either 0 or 1.</p>
            <div className="conclusion" id="box-conclusion" role="status">
              <div aria-hidden={!showLimit}>
                <h3>What happens in the box can’t be undone.</h3>
                <p>A second H can undo the gate on an undisturbed qubit. Here the detector and the surroundings have already recorded the outcome. Closing the lid starts a fresh trial.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function HadamardExperiment() {
  const [bit, setBit] = useState<Bit>(0)
  const [hasHadamard, setHasHadamard] = useState(false)
  const [reading, setReading] = useState<Bit | null>(null)

  function prepare(value: Bit) {
    setBit(value)
    setHasHadamard(false)
    setReading(null)
  }

  function advanceExperiment() {
    if (reading !== null) {
      prepare(bit)
    } else if (hasHadamard) {
      setReading(randomBit())
    } else {
      setHasHadamard(true)
    }
  }

  let action = 'Apply H'
  let angle = bit * 180
  let p0 = bit === 0 ? 100 : 0
  let status = 'Prepared as ' + bit
  if (reading !== null) {
    action = 'Prepare again'
    angle = reading * 180
    p0 = reading === 0 ? 100 : 0
    status = 'One measurement. One result: ' + reading + '.'
  } else if (hasHadamard) {
    action = 'Measure'
    angle = hadamardAngle(bit)
    p0 = 50
    status = 'Superposition of 0 and 1 · 50% each'
  }

  return (
    <section aria-labelledby="gate-heading">
      <h2 id="gate-heading">Through the Hadamard gate.</h2>
      <p>Choose an initial state, then apply H to put your qubit in a superposition. Which result will you see when you measure it?</p>
      <div className="gate-stage">
        <StateDiagram angle={angle} p0={p0} />
        <div className="actions gate-inputs" role="group" aria-label="Choose the Hadamard input state">
          {([0, 1] as const).map(value => (
            <button key={value} aria-pressed={bit === value} onClick={() => prepare(value)}>{value}</button>
          ))}
        </div>
      </div>
      <div className="prob-bars" role="group" aria-label="Measurement probabilities">
        <div className="prob-row">
          <span>Measure 0</span>
          <div className="bar-track" aria-hidden="true">
            <div className="bar-fill" style={{ width: `${p0}%` }} />
          </div>
          <span>{p0}%</span>
        </div>
        <div className="prob-row">
          <span>Measure 1</span>
          <div className="bar-track" aria-hidden="true">
            <div className="bar-fill alt" style={{ width: `${100 - p0}%` }} />
          </div>
          <span>{100 - p0}%</span>
        </div>
      </div>
      <p className="status" role="status">{status}</p>
      <button className={reading === null ? 'primary' : undefined} onClick={advanceExperiment}>
        {action}
      </button>
    </section>
  )
}

export default function App() {
  return (
    <main>
      <h1>Superposition, Explained with Schrödinger’s Cat</h1>
      <StartingStates />
      <HadamardExperiment />
      <CatExperiment />
      <HadamardFlow />
      <section aria-labelledby="superposition-probabilities-heading">
        <h2 id="superposition-probabilities-heading">Is superposition always 50/50?</h2>
        <p className="superposition-answer">No</p>
        <p>The Hadamard gate creates an equal superposition when applied to a qubit in state 0 or 1. However, a qubit can exist in many different superpositions.</p>
        <p>For example, one qubit might have a 70% chance of being measured as 0 and a 30% chance of being measured as 1. Another might have a 20% chance of being measured as 0 and an 80% chance of being measured as 1.</p>
        <div className="state-pair">
          {[70, 20].map(p0 => {
            const angle = Math.acos(2 * (p0 / 100) - 1) * 180 / Math.PI

            return (
              <figure key={p0}>
                <StateDiagram angle={angle} p0={p0} />
                <figcaption>0: {p0}% · 1: {100 - p0}%</figcaption>
              </figure>
            )
          })}
        </div>
      </section>
      <MeasurementExperiment />
    </main>
  )
}

function CatSymbols() {
  return (
    <svg className="symbols" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <g id="cat" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
          <path d="M37 79Q22 106 32 128Q48 135 78 130Q89 108 72 82" fill="#e0b986"/>
          <path d="M75 125Q105 131 108 111Q110 100 102 99Q97 100 101 107Q106 118 81 117" fill="#e0b986"/>
          <path d="M21 59L20 30L40 43Q56 38 66 43L85 28L85 60Q89 84 64 89Q30 98 21 72Z" fill="#efd1a4"/>
          <path d="M27 44l0-6 7 7m41-1 6-8v9" fill="none"/>
          <g fill="currentColor">
            <path d="M39 59v6m29-6v6" fill="none" strokeLinecap="round" />
            <path d="m50 70 7 0-3.5 4z"/>
          </g>
          <path d="M54 73q-3 9-9 4m9-4q3 8 10 3M32 69 8 63m25 11-26 1m67-7 23-7m-23 13 24 1M40 112v16m24-16v17" fill="none"/>
        </g>
        <g id="ghost" fill="#eaf1e8" stroke="currentColor" strokeWidth="2.3" strokeLinejoin="round">
          <ellipse cx="57" cy="18" rx="24" ry="5" fill="none"/>
          <path d="M24 70 23 37 42 47Q57 40 69 47L86 35 85 70Q89 93 67 101Q48 111 68 122Q39 123 43 105Q25 100 24 70Z"/>
          <path d="m35 67 6 4 6-4m16 0 6 4 6-4m-24 9 8 0" fill="none"/>
          <path d="M32 75 12 71 M32 81 12 84 M78 75 98 71 M78 81 98 84" fill="none" strokeLinecap="round"/>
        </g>
      </defs>
    </svg>
  )
}

