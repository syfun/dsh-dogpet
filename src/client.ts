/**
 * Dogpet Plugin - Client Half
 *
 * Renders a cute Chinese Rural Dog (中华田园犬) desktop pet
 * in the `shell.overlay` slot. Polls the Host half for agent
 * status and switches between three animation states:
 *
 * - idle:     front-facing, panting with tongue out
 * - working:  lying on back, 4 legs up spinning a ball
 * - bark:     facing upper-left, barking with "汪" characters
 */

const E = React.createElement

// Shared keyframe styles (declared before `return` so it is initialised)
const DOG_CSS = `
  @keyframes dp_tongue {
    0%,100% { transform: translateY(0) scaleY(1); }
    50% { transform: translateY(4px) scaleY(1.35); }
  }
  @keyframes dp_tail {
    0%,100% { transform: rotate(-18deg); }
    50% { transform: rotate(22deg); }
  }
  @keyframes dp_body {
    0%,100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  @keyframes dp_ball {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes dp_leg {
    0%,100% { transform: rotate(-8deg); }
    50% { transform: rotate(8deg); }
  }
  @keyframes dp_jaw {
    0%,100% { transform: scaleY(1); }
    50% { transform: scaleY(1.6); }
  }
  @keyframes dp_head {
    0%,100% { transform: rotate(-6deg); }
    50% { transform: rotate(7deg); }
  }
  @keyframes dp_wang {
    0% { opacity: 0.95; transform: translate(0,0) scale(0.4) rotate(-10deg); }
    100% { opacity: 0; transform: translate(-70px,-70px) scale(1.7) rotate(-16deg); }
  }
  .dp-styles svg { overflow: visible; }
`

return {
  inject: ['timer'],
  apply(ctx: any) {
    const slots = ctx.get('slots')
    if (slots === undefined) return

    slots.inject('shell.overlay', () => slots.register(
      { name: 'shell.overlay', id: 'desktop-pet' },
      () => React.createElement(DesktopPet, { timer: ctx.timer })
    ))
  },
}

// ============ Main Pet Component ============
function DesktopPet({ timer }: { timer: any }) {
  const [pos, setPos] = React.useState({ x: -1, y: -1 })
  const [dragging, setDragging] = React.useState(false)
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 })
  const [petState, setPetState] = React.useState('idle')
  const [showWang, setShowWang] = React.useState(false)

  // Initialize position to bottom-right
  React.useEffect(() => {
    if (pos.x === -1 && pos.y === -1) {
      setPos({ x: window.innerWidth - 180, y: window.innerHeight - 180 })
    }
  }, [pos.x, pos.y])

  // Poll agent status from host every 1 second
  React.useEffect(() => {
    const pollTimer = timer.interval(async () => {
      try {
        const result = await host.call('getAgentStatus')
        const { status, changed } = result
        if (changed) {
          if (status === 'running') {
            setPetState('working')
          } else if (status === 'idle') {
            setPetState('bark')
            setShowWang(true)
            timer.timeout(() => {
              setShowWang(false)
              setPetState('idle')
            }, 2000)
          }
        }
      } catch (e) {
        // Host not available, ignore
      }
    }, 1000)
    return () => pollTimer()
  }, [timer])

  // Mouse drag handlers
  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    setDragging(true)
    setDragOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y })
  }, [pos.x, pos.y])

  React.useEffect(() => {
    if (!dragging) return
    const move = (e: MouseEvent) => setPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y })
    const up = () => setDragging(false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [dragging, dragOffset])

  if (pos.x === -1) return null

  return E('div', {
    style: {
      position: 'fixed',
      left: pos.x + 'px',
      top: pos.y + 'px',
      width: '160px',
      height: '160px',
      cursor: dragging ? 'grabbing' : 'grab',
      userSelect: 'none',
      zIndex: 99999,
      touchAction: 'none',
    } as React.CSSProperties,
    onMouseDown: handleMouseDown,
  },
    showWang && E(WangCharacters, null),
    E(DogView, { state: petState })
  )
}

// ============ Dog renderer per state ============
function DogView({ state }: { state: string }) {
  if (state === 'working') return E(WorkingDog, null)
  if (state === 'bark') return E(BarkDog, null)
  return E(IdleDog, null)
}

// ============ IDLE: front-facing, panting, tongue out ============
function IdleDog() {
  return E('div', { className: 'dp-styles' },
    E('style', null, DOG_CSS),
    E('svg', { viewBox: '0 0 130 130', width: '160', height: '160' },
      // Tail (curly, wagging)
      E('g', { style: { animation: 'dp_tail 0.45s ease-in-out infinite', transformOrigin: '102px 82px' } },
        E('path', { d: 'M102 84 C118 74 122 56 112 46 C104 38 92 42 90 52 C88 60 96 66 102 60', fill: '#E9A03B', stroke: '#3B2C23', strokeWidth: '3', strokeLinecap: 'round', strokeLinejoin: 'round' }),
        E('circle', { cx: '110', cy: '50', r: '6', fill: '#FFF8EF' }),
      ),
      // Body (sitting)
      E('g', { style: { animation: 'dp_body 1.2s ease-in-out infinite' } },
        E('ellipse', { cx: '65', cy: '92', rx: '30', ry: '26', fill: '#E9A03B', stroke: '#3B2C23', strokeWidth: '3' }),
        E('ellipse', { cx: '65', cy: '98', rx: '19', ry: '16', fill: '#FFF8EF', stroke: '#3B2C23', strokeWidth: '2.2' }),
        E('ellipse', { cx: '42', cy: '104', rx: '10', ry: '12', fill: '#E9A03B', stroke: '#3B2C23', strokeWidth: '2.2' }),
        E('ellipse', { cx: '88', cy: '104', rx: '10', ry: '12', fill: '#E9A03B', stroke: '#3B2C23', strokeWidth: '2.2' }),
        E('ellipse', { cx: '56', cy: '112', rx: '7', ry: '5', fill: '#FFF8EF', stroke: '#3B2C23', strokeWidth: '2' }),
        E('ellipse', { cx: '74', cy: '112', rx: '7', ry: '5', fill: '#FFF8EF', stroke: '#3B2C23', strokeWidth: '2' }),
        E('path', { d: 'M44 76 Q65 85 86 76', fill: 'none', stroke: '#E86A6A', strokeWidth: '5', strokeLinecap: 'round' }),
      ),
      // Head
      E('g', { style: { animation: 'dp_head 2s ease-in-out infinite', transformOrigin: '65px 52px' } },
        E('path', { d: 'M46 34 L40 10 L60 26 Z', fill: '#E9A03B', stroke: '#3B2C23', strokeWidth: '3', strokeLinejoin: 'round' }),
        E('path', { d: 'M47 30 L43 16 L55 27 Z', fill: '#FFE9D6' }),
        E('path', { d: 'M84 34 L90 10 L70 26 Z', fill: '#E9A03B', stroke: '#3B2C23', strokeWidth: '3', strokeLinejoin: 'round' }),
        E('path', { d: 'M83 30 L87 16 L75 27 Z', fill: '#FFE9D6' }),
        E('circle', { cx: '65', cy: '50', r: '26', fill: '#E9A03B', stroke: '#3B2C23', strokeWidth: '3' }),
        E('ellipse', { cx: '65', cy: '60', rx: '18', ry: '12', fill: '#FFF8EF', stroke: '#3B2C23', strokeWidth: '2.4' }),
        E('circle', { cx: '53', cy: '46', r: '4.2', fill: '#3B2C23' }),
        E('circle', { cx: '54.2', cy: '44.8', r: '1.5', fill: '#fff' }),
        E('circle', { cx: '77', cy: '46', r: '4.2', fill: '#3B2C23' }),
        E('circle', { cx: '78.2', cy: '44.8', r: '1.5', fill: '#fff' }),
        E('path', { d: 'M60 56 Q65 52 70 56 Q65 61 60 56 Z', fill: '#3B2C23' }),
        E('path', { d: 'M57 61 Q65 66 73 61', fill: 'none', stroke: '#3B2C23', strokeWidth: '2.4', strokeLinecap: 'round' }),
        E('g', { style: { animation: 'dp_tongue 0.7s ease-in-out infinite', transformOrigin: '65px 62px' } },
          E('ellipse', { cx: '65', cy: '68', rx: '5.5', ry: '8', fill: '#FF8A8A', stroke: '#D96262', strokeWidth: '1.5' }),
        ),
      ),
    )
  )
}

// ============ WORKING: lying on back, 4 legs up spinning a ball ============
function WorkingDog() {
  return E('div', { className: 'dp-styles' },
    E('style', null, DOG_CSS),
    E('svg', { viewBox: '0 0 130 130', width: '160', height: '160' },
      E('ellipse', { cx: '65', cy: '88', rx: '40', ry: '22', fill: '#E9A03B', stroke: '#3B2C23', strokeWidth: '3' }),
      E('ellipse', { cx: '65', cy: '88', rx: '26', ry: '14', fill: '#FFF8EF', stroke: '#3B2C23', strokeWidth: '2.2' }),
      E('path', { d: 'M30 84 Q65 70 100 84', fill: 'none', stroke: '#E86A6A', strokeWidth: '4', strokeLinecap: 'round' }),
      E('g', { transform: 'rotate(-10 78 44)' },
        E('path', { d: 'M60 44 L52 22 L72 38 Z', fill: '#E9A03B', stroke: '#3B2C23', strokeWidth: '3', strokeLinejoin: 'round' }),
        E('path', { d: 'M94 40 L102 20 L84 36 Z', fill: '#E9A03B', stroke: '#3B2C23', strokeWidth: '3', strokeLinejoin: 'round' }),
        E('circle', { cx: '78', cy: '44', r: '20', fill: '#E9A03B', stroke: '#3B2C23', strokeWidth: '3' }),
        E('ellipse', { cx: '78', cy: '52', rx: '13', ry: '9', fill: '#FFF8EF', stroke: '#3B2C23', strokeWidth: '2.2' }),
        E('circle', { cx: '70', cy: '42', r: '3.5', fill: '#3B2C23' }),
        E('circle', { cx: '87', cy: '42', r: '3.5', fill: '#3B2C23' }),
        E('path', { d: 'M73 51 Q78 55 83 51', fill: 'none', stroke: '#3B2C23', strokeWidth: '2.2', strokeLinecap: 'round' }),
        E('ellipse', { cx: '78', cy: '47', rx: '4', ry: '3', fill: '#3B2C23' }),
      ),
      E('g', { style: { animation: 'dp_tail 0.8s ease-in-out infinite', transformOrigin: '100px 90px' } },
        E('path', { d: 'M100 92 C116 84 120 66 110 58 C102 52 94 58 94 66 C94 72 102 74 106 68', fill: '#E9A03B', stroke: '#3B2C23', strokeWidth: '3', strokeLinecap: 'round', strokeLinejoin: 'round' }),
      ),
      E('path', { d: 'M46 62 L42 48', stroke: '#E9A03B', strokeWidth: '7', strokeLinecap: 'round', style: { animation: 'dp_leg 0.5s ease-in-out infinite', transformOrigin: '46px 62px' } }),
      E('path', { d: 'M56 58 L54 44', stroke: '#E9A03B', strokeWidth: '7', strokeLinecap: 'round', style: { animation: 'dp_leg 0.5s ease-in-out infinite', animationDelay: '0.1s', transformOrigin: '56px 58px' } }),
      E('path', { d: 'M74 58 L76 44', stroke: '#E9A03B', strokeWidth: '7', strokeLinecap: 'round', style: { animation: 'dp_leg 0.5s ease-in-out infinite', animationDelay: '0.2s', transformOrigin: '74px 58px' } }),
      E('path', { d: 'M84 62 L88 48', stroke: '#E9A03B', strokeWidth: '7', strokeLinecap: 'round', style: { animation: 'dp_leg 0.5s ease-in-out infinite', animationDelay: '0.3s', transformOrigin: '84px 62px' } }),
      E('g', { style: { animation: 'dp_ball 1s linear infinite', transformOrigin: '65px 40px' } },
        E('circle', { cx: '65', cy: '40', r: '11', fill: '#F05C5C', stroke: '#B33B3B', strokeWidth: '2.5' }),
        E('path', { d: 'M54 40 Q65 30 76 40', fill: 'none', stroke: '#FFF8EF', strokeWidth: '2.5', strokeLinecap: 'round' }),
        E('path', { d: 'M65 29 Q60 40 65 51', fill: 'none', stroke: '#FFF8EF', strokeWidth: '2.5', strokeLinecap: 'round' }),
      ),
      E('path', { d: 'M48 20 A18 18 0 0 1 82 20', fill: 'none', stroke: '#D9C6A0', strokeWidth: '2', strokeLinecap: 'round', opacity: '0.7' }),
    )
  )
}

// ============ BARK: facing upper-left, mouth open, wang ============
function BarkDog() {
  return E('div', { className: 'dp-styles' },
    E('style', null, DOG_CSS),
    E('svg', { viewBox: '0 0 130 130', width: '160', height: '160', style: { transform: 'rotate(-28deg)', transformOrigin: '65px 70px' } },
      E('g', { style: { animation: 'dp_tail 0.3s ease-in-out infinite', transformOrigin: '100px 84px' } },
        E('path', { d: 'M100 86 C118 78 124 60 116 50 C108 42 96 48 96 58 C96 66 104 70 110 64', fill: '#E9A03B', stroke: '#3B2C23', strokeWidth: '3', strokeLinecap: 'round', strokeLinejoin: 'round' }),
      ),
      E('g', { style: { animation: 'dp_body 0.3s ease-in-out infinite' } },
        E('ellipse', { cx: '65', cy: '94', rx: '29', ry: '25', fill: '#E9A03B', stroke: '#3B2C23', strokeWidth: '3' }),
        E('ellipse', { cx: '65', cy: '98', rx: '18', ry: '15', fill: '#FFF8EF', stroke: '#3B2C23', strokeWidth: '2' }),
        E('path', { d: 'M44 78 Q65 87 86 78', fill: 'none', stroke: '#E86A6A', strokeWidth: '5', strokeLinecap: 'round' }),
        E('ellipse', { cx: '56', cy: '114', rx: '7', ry: '5', fill: '#FFF8EF', stroke: '#3B2C23', strokeWidth: '2' }),
        E('ellipse', { cx: '74', cy: '114', rx: '7', ry: '5', fill: '#FFF8EF', stroke: '#3B2C23', strokeWidth: '2' }),
      ),
      E('g', { style: { animation: 'dp_head 0.3s ease-in-out infinite', transformOrigin: '60px 50px' } },
        E('path', { d: 'M42 40 L34 16 L54 30 Z', fill: '#E9A03B', stroke: '#3B2C23', strokeWidth: '3', strokeLinejoin: 'round' }),
        E('path', { d: 'M80 40 L88 16 L68 30 Z', fill: '#E9A03B', stroke: '#3B2C23', strokeWidth: '3', strokeLinejoin: 'round' }),
        E('circle', { cx: '60', cy: '52', r: '24', fill: '#E9A03B', stroke: '#3B2C23', strokeWidth: '3' }),
        E('ellipse', { cx: '60', cy: '64', rx: '16', ry: '12', fill: '#FFF8EF', stroke: '#3B2C23', strokeWidth: '2' }),
        E('circle', { cx: '49', cy: '48', r: '4', fill: '#3B2C23' }),
        E('circle', { cx: '50.2', cy: '46.8', r: '1.4', fill: '#fff' }),
        E('circle', { cx: '73', cy: '48', r: '4', fill: '#3B2C23' }),
        E('circle', { cx: '74.2', cy: '46.8', r: '1.4', fill: '#fff' }),
        E('path', { d: 'M55 57 Q60 61 67 57', fill: 'none', stroke: '#3B2C23', strokeWidth: '2.2', strokeLinecap: 'round' }),
        E('ellipse', { cx: '61', cy: '51', rx: '4', ry: '3', fill: '#3B2C23' }),
        E('g', { style: { animation: 'dp_jaw 0.3s ease-in-out infinite', transformOrigin: '61px 62px' } },
          E('path', { d: 'M50 66 Q61 80 72 66 Z', fill: '#7A2E2E', stroke: '#3B2C23', strokeWidth: '2.4', strokeLinejoin: 'round' }),
          E('path', { d: 'M54 68 Q61 73 68 68', fill: 'none', stroke: '#E86A6A', strokeWidth: '2.5', strokeLinecap: 'round' }),
        ),
      ),
    )
  )
}

// ============ WANG characters from mouth, flying to upper-left ============
function WangCharacters() {
  const wangs = ['汪', '汪', '汪', '汪', '汪']
  const sizes = [16, 20, 25, 31, 40]
  const delays = [0, 0.18, 0.36, 0.54, 0.72]
  return E('div', {
    style: { position: 'absolute', top: '42px', left: '46px', width: '0', height: '0' } as React.CSSProperties,
  }, wangs.map((w, i) =>
    E('span', {
      key: i,
      style: {
        position: 'absolute',
        fontSize: sizes[i] + 'px',
        fontWeight: '800',
        color: '#3B2C23',
        WebkitTextStroke: '1px #FFF8EF',
        textShadow: '2px 2px 0 #E9A03B',
        animation: 'dp_wang 1.3s ease-out ' + delays[i] + 's forwards',
        opacity: 0,
        whiteSpace: 'nowrap',
        transformOrigin: 'bottom left',
      } as React.CSSProperties,
    }, w)
  ))
}
