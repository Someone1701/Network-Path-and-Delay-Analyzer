// react-app.js - React 18 & GSAP Interactive Controller for Network Path & Delay Analyzer

(function() {
  const { useState, useEffect, useRef, createElement: e } = React;

  // =========================================================================
  // GSAP LOADER & TRANSITION ORCHESTRATOR
  // =========================================================================

  function runLoaderSequence(onFinished) {
    const loader = document.getElementById('app-loader');
    const fill = document.getElementById('loader-bar-fill');
    const counter = document.getElementById('loader-counter');
    const statusMsg = document.getElementById('loader-status-msg');

    if (!loader) {
      if (onFinished) onFinished();
      return;
    }

    const messages = [
      'Booting M/M/1/K Queue Decomposition Subsystem...',
      'Calibrating DAPS Dynamic Adaptive Path Selection...',
      'Acquiring Leaflet BGP Transit & Geo-IP Engine...',
      'Synthesizing 30-Run Paired Simulation Benchmarks...',
      'System Operational • Welcome to PDA Core'
    ];

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(loader, {
          opacity: 0,
          scale: 1.05,
          duration: 0.65,
          ease: 'power3.inOut',
          onComplete: () => {
            loader.style.display = 'none';
            if (onFinished) onFinished();
          }
        });
      }
    });

    const progressObj = { val: 0 };
    tl.to(progressObj, {
      val: 100,
      duration: 1.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        const rounded = Math.round(progressObj.val);
        if (fill) fill.style.width = rounded + '%';
        if (counter) counter.innerText = rounded + '%';

        const msgIndex = Math.min(Math.floor((rounded / 100) * messages.length), messages.length - 1);
        if (statusMsg) statusMsg.innerText = messages[msgIndex];
      }
    });
  }

  function animateLandingEntrance() {
    gsap.from('.landing-hero > *', {
      y: 45,
      opacity: 0,
      stagger: 0.12,
      duration: 0.95,
      ease: 'power3.out'
    });

    gsap.from('.landing-metric-card', {
      y: 35,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      delay: 0.35,
      ease: 'back.out(1.4)'
    });

    gsap.from('.landing-sandbox-card', {
      y: 40,
      opacity: 0,
      duration: 0.9,
      delay: 0.55,
      ease: 'power3.out'
    });

    gsap.from('.landing-feat-card', {
      y: 45,
      opacity: 0,
      stagger: 0.12,
      duration: 0.85,
      delay: 0.7,
      ease: 'power3.out',
      onComplete: () => {
        attachTiltTriggers();
      }
    });
  }

  function attachTiltTriggers() {
    const cards = document.querySelectorAll('.landing-feat-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(card, {
          rotationY: x * 0.05,
          rotationX: -y * 0.05,
          transformPerspective: 900,
          ease: 'power1.out',
          duration: 0.25
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotationY: 0,
          rotationX: 0,
          ease: 'power2.out',
          duration: 0.45
        });
      });
    });
  }

  // =========================================================================
  // INTERACTIVE HERO BACKGROUND CANVAS (FLOATING NETWORK NODES & PULSES)
  // =========================================================================

  function HeroNetworkCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let animId;
      let width = canvas.width = window.innerWidth;
      let height = canvas.height = 480;

      const handleResize = () => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = 480;
      };
      window.addEventListener('resize', handleResize);

      // Node particles
      const nodeCount = Math.min(Math.floor(width / 38), 35);
      const nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          r: Math.random() * 2.5 + 2,
          color: i % 3 === 0 ? '#38bdf8' : (i % 3 === 1 ? '#818cf8' : '#34d399')
        });
      }

      // Signal packets
      const packets = [];
      setInterval(() => {
        if (nodes.length > 2 && packets.length < 8) {
          const from = nodes[Math.floor(Math.random() * nodes.length)];
          const to = nodes[Math.floor(Math.random() * nodes.length)];
          if (from !== to) {
            packets.push({ from, to, t: 0, speed: 0.015 + Math.random() * 0.02 });
          }
        }
      }, 700);

      const render = () => {
        ctx.clearRect(0, 0, width, height);

        // Update & Draw Nodes
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.x += n.vx;
          n.y += n.vy;

          if (n.x < 10 || n.x > width - 10) n.vx *= -1;
          if (n.y < 10 || n.y > height - 10) n.vy *= -1;

          // Connect nearby nodes
          for (let j = i + 1; j < nodes.length; j++) {
            const m = nodes[j];
            const dx = n.x - m.x;
            const dy = n.y - m.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 130) {
              const alpha = (1 - dist / 130) * 0.25;
              ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(n.x, n.y);
              ctx.lineTo(m.x, m.y);
              ctx.stroke();
            }
          }

          // Draw node
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = n.color;
          ctx.shadowColor = n.color;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Draw and update packets
        for (let k = packets.length - 1; k >= 0; k--) {
          const p = packets[k];
          p.t += p.speed;
          if (p.t >= 1) {
            packets.splice(k, 1);
            continue;
          }
          const px = p.from.x + (p.to.x - p.from.x) * p.t;
          const py = p.from.y + (p.to.y - p.from.y) * p.t;

          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#f8fafc';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        animId = requestAnimationFrame(render);
      };

      render();

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animId);
      };
    }, []);

    return e('canvas', {
      ref: canvasRef,
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '480px',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.65
      }
    });
  }

  // =========================================================================
  // REACT COMPONENTS
  // =========================================================================

  // Top Sticky Navigation Component
  function LandingNav({ onLaunchDashboard, activeView, onReturnLanding }) {
    return e('nav', { className: 'landing-nav' },
      e('div', { className: 'landing-nav-inner' },
        e('div', { className: 'landing-nav-brand' },
          e('div', { className: 'landing-nav-logo' },
            e('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2 },
              e('circle', { cx: 6, cy: 12, r: 3 }),
              e('circle', { cx: 18, cy: 6, r: 3 }),
              e('circle', { cx: 18, cy: 18, r: 3 }),
              e('line', { x1: 9, y1: 12, x2: 15, y2: 7.5 }),
              e('line', { x1: 9, y1: 12, x2: 15, y2: 16.5 })
            )
          ),
          e('div', null,
            e('div', { className: 'landing-nav-title' }, 'Network Path & Delay Analyzer'),
            e('div', { className: 'landing-nav-sub' }, 'BCSE308P Computer Networks Lab')
          )
        ),
        e('div', { className: 'landing-nav-links' },
          activeView === 'dashboard' ?
            e('button', {
              className: 'btn-back-landing',
              onClick: onReturnLanding
            }, '← Return to Overview') :
            e('button', {
              className: 'landing-nav-link',
              onClick: () => {
                const el = document.getElementById('sandbox-anchor');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }, 'Interactive Sandbox'),
          e('button', {
            className: 'landing-nav-link',
            onClick: () => {
              const el = document.getElementById('features-anchor');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }, 'Core Architecture'),
          e('button', {
            className: 'btn-hero-primary',
            style: { padding: '0.55rem 1.3rem', fontSize: '0.88rem' },
            onClick: () => onLaunchDashboard('tab-prototype')
          }, 'Launch Platform 🚀')
        )
      )
    );
  }

  // Interactive Live DAPS Sandbox Widget (Interactive Trigger on Landing Page)
  function InteractiveSandbox({ onLaunchDashboard }) {
    const [congested, setCongested] = useState(false);
    const [activePath, setActivePath] = useState('P1');
    const [latency, setLatency] = useState(20.0);
    const [statusMessage, setStatusMessage] = useState('P1 active (Baseline shortest path). Zero link bottlenecks.');

    const injectCongestion = () => {
      setCongested(true);
      setStatusMessage('⚠️ Bottleneck injected on Link R1-R2! Queue backlog rising...');
      
      // Animate transition with GSAP
      gsap.to({ val: 20 }, {
        val: 82.4,
        duration: 0.6,
        ease: 'power2.in',
        onUpdate: function() { setLatency(parseFloat(this.targets()[0].val.toFixed(1))); },
        onComplete: () => {
          setTimeout(() => {
            setActivePath('P2');
            setStatusMessage('🔄 DAPS Triggered: Dynamic path switch to P2 (via R3). Queue delay bypassed!');
            gsap.to({ val: 82.4 }, {
              val: 22.5,
              duration: 0.5,
              ease: 'power2.out',
              onUpdate: function() { setLatency(parseFloat(this.targets()[0].val.toFixed(1))); }
            });
          }, 450);
        }
      });
    };

    const resetFlow = () => {
      setCongested(false);
      setActivePath('P1');
      setStatusMessage('Link R1-R2 restored to nominal capacity. Traffic routed via baseline shortest path P1.');
      gsap.to({ val: latency }, {
        val: 20.0,
        duration: 0.4,
        ease: 'power2.out',
        onUpdate: function() { setLatency(parseFloat(this.targets()[0].val.toFixed(1))); }
      });
    };

    return e('div', { className: 'landing-sandbox-card', id: 'sandbox-anchor' },
      e('div', { className: 'sandbox-header' },
        e('div', null,
          e('div', { className: 'hero-badge-pill', style: { marginBottom: '0.5rem' } }, '⚡ Interactive Trigger Demo'),
          e('h3', { style: { fontSize: '1.45rem', fontWeight: 800, color: '#fff' } }, 'Live DAPS Congestion Evasion Engine'),
          e('p', { style: { color: 'var(--text-muted)', fontSize: '0.9rem' } },
            'Experience how our Dynamic Adaptive Path Selection algorithm evades real-time network link degradation.'
          )
        ),
        e('div', { style: { textAlign: 'right' } },
          e('div', { style: { fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' } }, 'Real-Time Delay (RTT)'),
          e('div', {
            style: {
              fontSize: '2rem',
              fontWeight: 800,
              fontFamily: 'JetBrains Mono, monospace',
              color: latency > 50 ? 'var(--rose)' : (latency > 21 ? 'var(--cyan)' : 'var(--teal)')
            }
          }, latency + ' ms')
        )
      ),

      // 3 Paths Grid
      e('div', { className: 'sandbox-paths-grid' },
        // Path 1
        e('div', {
          className: 'sandbox-path-pill ' + (activePath === 'P1' ? 'active ' : '') + (congested ? 'congested' : '')
        },
          e('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' } },
            e('strong', { style: { color: '#fff', fontSize: '0.95rem' } }, 'Path P1: S → R1 → R2 → D'),
            e('span', {
              style: {
                fontSize: '0.75rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                background: congested ? 'rgba(251, 113, 133, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                color: congested ? 'var(--rose)' : 'var(--cyan)',
                fontWeight: 700
              }
            }, congested ? 'CONGESTED (82.4ms)' : 'OPTIMAL (20.0ms)')
          ),
          e('div', { style: { fontSize: '0.82rem', color: 'var(--text-muted)' } },
            'OSPF Static Baseline. Prop Delay: 15ms. Normal Capacity: 10 Mbps.'
          )
        ),

        // Path 2
        e('div', {
          className: 'sandbox-path-pill ' + (activePath === 'P2' ? 'active' : '')
        },
          e('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' } },
            e('strong', { style: { color: '#fff', fontSize: '0.95rem' } }, 'Path P2: S → R3 → D'),
            e('span', {
              style: {
                fontSize: '0.75rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                background: activePath === 'P2' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: activePath === 'P2' ? 'var(--teal)' : 'var(--text-dim)',
                fontWeight: 700
              }
            }, activePath === 'P2' ? 'ACTIVE DAPS ROUTE' : 'STANDBY (22.5ms)')
          ),
          e('div', { style: { fontSize: '0.82rem', color: 'var(--text-muted)' } },
            'DAPS First Alternative. Prop Delay: 20ms. High Capacity: 15 Mbps.'
          )
        ),

        // Path 3
        e('div', {
          className: 'sandbox-path-pill ' + (activePath === 'P3' ? 'active' : '')
        },
          e('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' } },
            e('strong', { style: { color: '#fff', fontSize: '0.95rem' } }, 'Path P3: S → R4 → R5 → D'),
            e('span', {
              style: {
                fontSize: '0.75rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-dim)',
                fontWeight: 700
              }
            }, 'STANDBY (30.0ms)')
          ),
          e('div', { style: { fontSize: '0.82rem', color: 'var(--text-muted)' } },
            'DAPS Secondary Backup. Prop Delay: 25ms. Capacity: 8 Mbps.'
          )
        )
      ),

      // Status Bar
      e('div', {
        style: {
          padding: '0.8rem 1rem',
          borderRadius: '8px',
          background: 'rgba(0, 0, 0, 0.35)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.85rem',
          color: congested ? 'var(--amber-light)' : 'var(--cyan-light)',
          borderLeft: '3px solid ' + (congested ? 'var(--orange)' : 'var(--cyan)'),
          marginBottom: '1.5rem'
        }
      }, statusMessage),

      // Controls
      e('div', { className: 'sandbox-controls' },
        !congested ?
          e('button', {
            className: 'btn-primary',
            style: { background: 'linear-gradient(135deg, #e11d48, #fb7185)' },
            onClick: injectCongestion
          }, '⚡ Inject Bottleneck on Link R1-R2') :
          e('button', {
            className: 'btn-primary',
            style: { background: 'linear-gradient(135deg, #059669, #34d399)' },
            onClick: resetFlow
          }, '🔄 Auto-Recover Link R1-R2'),
        e('button', {
          className: 'btn-hero-secondary',
          style: { padding: '0.65rem 1.4rem', fontSize: '0.9rem' },
          onClick: () => onLaunchDashboard('tab-prototype')
        }, 'Open Full Dynamic Canvas Simulator →')
      )
    );
  }

  // Feature Showcase Grid Component
  function FeatureGrid({ onLaunchDashboard }) {
    const features = [
      {
        icon: '🕹️',
        title: 'Simulation & DAPS Prototype',
        desc: 'Interactive 7-node network simulator with real-time discrete packet flow, link queue animations, dynamic traffic injection, and instant path switching.',
        tags: ['M/M/1/K Queue', 'DAPS Evasion', 'Vectorized Math', '60 FPS Canvas'],
        tab: 'tab-prototype'
      },
      {
        icon: '⏱️',
        title: 'Hop-by-Hop Delay Decomposer',
        desc: 'Analytical breakdown of cumulative end-to-end latency into transmission, propagation, finite queueing, and microsecond processing delays.',
        tags: ['Bottleneck Localization', 'Traffic Profiles S1-S4', 'Delta RTT Spikes'],
        tab: 'tab-analyzer'
      },
      {
        icon: '🌐',
        title: 'Real-Life Implementation & Map',
        desc: 'Live Windows ICMP traceroute tracer with batch sub-300ms Geo-IP resolution, autonomous system lookup, and interactive dark Leaflet world transit mapping.',
        tags: ['Live Tracert', 'Leaflet World Map', 'AS Peering', 'Multi-Hop Jitter'],
        tab: 'tab-real-world'
      },
      {
        icon: '📊',
        title: 'Benchmark Data & Figures',
        desc: 'Rigorous empirical evaluation comparing OSPF baseline against DAPS across 30 random seeds, Student t-test significance (p < 0.001), and live Internet telemetry.',
        tags: ['30-Seed Paired Runs', 'Statistical t-Test', 'Publication Artifacts'],
        tab: 'tab-benchmarks'
      }
    ];

    return e('div', { className: 'landing-features-wrap', id: 'features-anchor' },
      e('h2', { className: 'features-section-title' }, 'Core System Modules'),
      e('p', { className: 'features-section-sub' },
        'A unified research and engineering dashboard designed for comprehensive network performance evaluation.'
      ),
      e('div', { className: 'landing-feature-grid' },
        features.map((f, i) =>
          e('div', {
            key: i,
            className: 'landing-feat-card',
            onClick: () => onLaunchDashboard(f.tab)
          },
            e('div', null,
              e('div', { className: 'feat-icon-badge' }, f.icon),
              e('h3', { className: 'feat-title' }, f.title),
              e('p', { className: 'feat-text' }, f.desc),
              e('div', { className: 'feat-tags' },
                f.tags.map((t, idx) => e('span', { key: idx, className: 'feat-tag' }, t))
              )
            ),
            e('div', { className: 'feat-action-link' },
              'Explore Module',
              e('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5 },
                e('polyline', { points: '9 18 15 12 9 6' })
              )
            )
          )
        )
      )
    );
  }

  // Root React App Component
  function ReactApp() {
    const [view, setView] = useState('landing'); // 'landing' | 'dashboard'

    useEffect(() => {
      // Run the initial GSAP loader
      runLoaderSequence(() => {
        animateLandingEntrance();
      });
    }, []);

    const launchDashboard = (targetTab) => {
      // Animate view transition
      gsap.to('#landing-view', {
        y: -30,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          setView('dashboard');
          const dashboardRoot = document.getElementById('dashboard-view');
          const landingRoot = document.getElementById('landing-view');

          if (landingRoot) landingRoot.classList.add('view-hidden');
          if (dashboardRoot) {
            dashboardRoot.classList.remove('view-hidden');
            window.scrollTo({ top: 0, behavior: 'instant' });

            gsap.fromTo(dashboardRoot, 
              { opacity: 0, y: 25 },
              { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
            );

            // Switch to requested tab
            if (targetTab && window.switchTab) {
              const tabBtn = document.querySelector(`.tab-btn[onclick*="${targetTab}"]`);
              window.switchTab(targetTab, tabBtn);
            }

            // Invalidate Leaflet map size if switching to real-world
            setTimeout(() => {
              if (window.realMap) window.realMap.invalidateSize();
            }, 350);
          }
        }
      });
    };

    const returnLanding = () => {
      const dashboardRoot = document.getElementById('dashboard-view');
      const landingRoot = document.getElementById('landing-view');

      gsap.to(dashboardRoot, {
        y: 20,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          if (dashboardRoot) dashboardRoot.classList.add('view-hidden');
          if (landingRoot) {
            landingRoot.classList.remove('view-hidden');
            setView('landing');
            window.scrollTo({ top: 0, behavior: 'instant' });

            gsap.fromTo(landingRoot,
              { opacity: 0, y: -20 },
              { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
            );
          }
        }
      });
    };

    // Expose returnLanding and launchDashboard to window
    window.returnToLanding = returnLanding;
    window.launchDashboardFromAnywhere = launchDashboard;

    return e('div', null,
      // Landing Navigation
      e(LandingNav, {
        onLaunchDashboard: launchDashboard,
        activeView: view,
        onReturnLanding: returnLanding
      }),

      // Landing View Content
      e('div', { id: 'landing-view' },
        // Hero
        e('div', { className: 'landing-hero' },
          e(HeroNetworkCanvas),
          e('div', { className: 'hero-badge-pill', style: { position: 'relative', zIndex: 1 } },
            e('span', { className: 'pulse-dot' }),
            'BCSE308P Computer Networks Lab • Research-Grade Architecture'
          ),
          e('h1', { className: 'hero-main-title', style: { position: 'relative', zIndex: 1 } },
            'Next-Gen Network Path & ',
            e('span', { className: 'hero-gradient-text' }, 'Hop-by-Hop Delay'),
            ' Analyzer'
          ),
          e('p', { className: 'hero-description', style: { position: 'relative', zIndex: 1 } },
            'High-efficiency real-time packet simulation, finite-buffer M/M/1/K delay decomposition, interactive Leaflet global traceroute telemetry, and empirical OSPF vs DAPS comparative benchmarking.'
          ),

          // Author Ribbon
          e('div', { className: 'hero-author-ribbon', style: { position: 'relative', zIndex: 1 } },
            e('div', { className: 'author-item' },
              e('span', { className: 'author-avatar-dot' }),
              'Abhik Boxi (',
              e('strong', null, '24BCE0741'),
              ')'
            ),
            e('span', { style: { color: 'var(--text-dim)' } }, '•'),
            e('div', { className: 'author-item' },
              e('span', { className: 'author-avatar-dot', style: { background: 'var(--indigo)' } }),
              'Siddharth Saini (',
              e('strong', null, '24BKT0121'),
              ')'
            )
          ),

          // CTA Buttons
          e('div', { className: 'hero-cta-group', style: { position: 'relative', zIndex: 1 } },
            e('button', {
              className: 'btn-hero-primary',
              onClick: () => launchDashboard('tab-prototype')
            },
              e('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
                e('polygon', { points: '5 3 19 12 5 21 5 3' })
              ),
              'Enter Simulation Dashboard'
            ),
            e('button', {
              className: 'btn-hero-secondary',
              onClick: () => launchDashboard('tab-real-world')
            },
              e('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
                e('circle', { cx: 12, cy: 12, r: 10 }),
                e('line', { x1: 2, y1: 12, x2: 22, y2: 12 }),
                e('path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' })
              ),
              'Live World Traceroute'
            ),
            e('button', {
              className: 'btn-hero-secondary',
              onClick: () => launchDashboard('tab-benchmarks')
            },
              e('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
                e('line', { x1: 18, y1: 20, x2: 18, y2: 10 }),
                e('line', { x1: 12, y1: 20, x2: 12, y2: 4 }),
                e('line', { x1: 6, y1: 20, x2: 6, y2: 14 })
              ),
              'Benchmark Evaluation'
            )
          )
        ),

        // Metrics Ribbon
        e('div', { className: 'landing-metrics-ribbon' },
          e('div', { className: 'landing-metric-card' },
            e('div', { className: 'metric-num', style: { color: 'var(--teal)' } }, '100%'),
            e('div', { style: { fontWeight: 700, color: '#fff', marginBottom: '0.2rem' } }, 'Test Suite Passed'),
            e('div', { className: 'metric-desc' }, '48/48 Assertions across M/M/1/K, DAPS & Routing')
          ),
          e('div', { className: 'landing-metric-card' },
            e('div', { className: 'metric-num', style: { color: 'var(--cyan)' } }, '30 Seeds'),
            e('div', { style: { fontWeight: 700, color: '#fff', marginBottom: '0.2rem' } }, 'Paired Statistical Runs'),
            e('div', { className: 'metric-desc' }, 'Validated with Student t-test significance (p < 0.001)')
          ),
          e('div', { className: 'landing-metric-card' },
            e('div', { className: 'metric-num', style: { color: 'var(--indigo)' } }, '4 Scenarios'),
            e('div', { style: { fontWeight: 700, color: '#fff', marginBottom: '0.2rem' } }, 'Dynamic Traffic Profiles'),
            e('div', { className: 'metric-desc' }, 'Evaluated from Low Load (S1) to Link Degradation (S4)')
          ),
          e('div', { className: 'landing-metric-card' },
            e('div', { className: 'metric-num', style: { color: 'var(--orange)' } }, '< 300 ms'),
            e('div', { style: { fontWeight: 700, color: '#fff', marginBottom: '0.2rem' } }, 'Batch Geolocation'),
            e('div', { className: 'metric-desc' }, 'Real-time multi-hop BGP AS & coordinates extraction')
          )
        ),

        // Interactive Sandbox Trigger
        e(InteractiveSandbox, { onLaunchDashboard: launchDashboard }),

        // Feature Grid
        e(FeatureGrid, { onLaunchDashboard: launchDashboard }),

        // Footer
        e('footer', {
          style: {
            textAlign: 'center',
            padding: '3rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            color: 'var(--text-dim)',
            fontSize: '0.85rem'
          }
        },
          e('p', null, 'BCSE308P Computer Networks Lab • Designed & Engineered by Abhik Boxi & Siddharth Saini'),
          e('p', { style: { marginTop: '0.35rem' } }, 'Fully integrated with Discrete Event Python Simulation Backend & Leaflet Telemetry')
        )
      )
    );
  }

  // Mount React Root on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    const rootEl = document.getElementById('react-root');
    if (rootEl && window.ReactDOM) {
      const root = ReactDOM.createRoot(rootEl);
      root.render(e(ReactApp));
    }
  });

})();
