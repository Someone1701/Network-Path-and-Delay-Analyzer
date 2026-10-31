# User Manual & Implemented Functionality Guide
### Network Path and Delay Analyzer (BCSE308P Computer Networks Lab)
**Authors**: Abhik Boxi (24BCE0741) & Siddharth Saini (24BKT0121)

---

## 1. Project Overview & Architecture

The **Network Path and Delay Analyzer** is a full-stack, research-grade network simulation and telemetry platform. It bridges theoretical discrete-event mathematical modeling ($M/M/1/K$ queuing, dynamic adaptive path routing) with real-world public Internet telemetry.

### Complete Source Code Architecture

```
pda/
├── analyzer.py               # Microsecond hop-by-hop delay decomposition & bottleneck detector
├── netmodel.py               # 7-node network topology, M/M/1/K finite buffer model, background traffic
├── routing.py                # OSPF Dijkstra baseline & Proposed DAPS path selection with EWMA & hysteresis
├── simulate.py               # End-to-end discrete event simulation pipeline across scenarios S1-S4
├── experiments.py            # 30-seed paired simulation batch runner, sensitivity sweeps, ablation studies
├── figures.py                # High-resolution research visualization generator
├── web_server.py             # Multi-threaded HTTP API server for simulation & real traceroute
├── test_pda.py               # Comprehensive unit test suite (8 test cases, 54 assertions)
│
├── topology/                 # Topology specifications & interface mappings
│   ├── topology.json         # Machine-readable node, link, and subnet definitions
│   └── TOPOLOGY.md           # Network topology diagram, IP addressing plan & link characteristics
│
├── device_configurations/    # Router configuration files
│   ├── S_Source.cfg          # Ingress Gateway & DAPS agent daemon
│   ├── R1_CoreRouter.cfg     # Upper Ingress Core Router
│   ├── R2_CoreRouter.cfg     # Upper Egress Core Router
│   ├── R3_CoreRouter.cfg     # Middle High-Capacity Core Router
│   ├── R4_CoreRouter.cfg     # Lower Egress Core Router
│   ├── R5_CoreRouter.cfg     # Lower Transit Intermediate Router
│   ├── D_Destination.cfg     # Destination Gateway & Sink
│   └── README.md             # Router configuration guide
│
├── web/                      # Interactive Web Dashboard Source Code
│   ├── index.html            # Core HTML structure, GSAP preloader DOM, Leaflet container
│   ├── style.css             # Lightened luminous CSS tokens, glassmorphic cards, animations
│   ├── app.js                # Canvas simulator, packet animations, Leaflet controller, telemetry
│   └── react-app.js          # React 18 landing page, interactive DAPS sandbox, GSAP triggers
│
├── screenshots/              # High-Resolution UI & Telemetry Demonstrations (8 PNGs)
├── results/                  # Raw experimental datasets, CSV summaries, and execution logs
└── figures/                  # Publication-ready generated research plots
```

---

## 2. Step-by-Step Execution Guide

### Step 1: Starting the Platform
Launch the integrated web server on port 8000:
```powershell
python web_server.py 8000
```
Open your web browser at:
```
http://localhost:8000
```

### Step 2: Experiencing the GSAP Preloader & React Landing Page
1. **Preloader Animation**: When the page loads, a GSAP timeline animates dual orbital radar rings, a central pulsing packet core, and a numerical progress bar from `0%` to `100%`.
2. **React 18 Landing Page**:
   - Observe the interactive network canvas in the hero background, with live packet pulses flowing between floating nodes.
   - Note the project credentials: **Abhik Boxi (24BCE0741) & Siddharth Saini (24BKT0121)**.
   - Review the metrics ribbon displaying `100%` Unit Test Pass Rate, `30` Paired Seeds, `4` Dynamic Scenarios, and `< 300 ms` Batch Geolocation.

### Step 3: Testing the Interactive DAPS Congestion Evasion Sandbox
1. On the landing page, scroll to the **Live DAPS Congestion Evasion Engine** card.
2. Click **"⚡ Inject Bottleneck on Link R1-R2"**.
3. **Observed Behavior**:
   - Path P1 turns red with delay rising to `82.4 ms`.
   - DAPS evaluates the score, detects the queue backlog, and triggers an automatic path switch to **Path P2 (via R3)**.
   - Traffic smoothly recovers to **`22.5 ms`**, demonstrating dynamic congestion avoidance.
4. Click **"🔄 Auto-Recover Link"** to restore baseline capacity.

---

## 3. Demonstrating Dashboard Modules

Click **"Launch Platform 🚀"** or **"Enter Simulation Dashboard"** to enter the workspace:

### Module 1: 🕹️ Simulation & DAPS Prototype Lab
- **Live Canvas**: Discretely animates packet flows between S, R1–R5, and D at 60 FPS.
- **Traffic Controls**: Select between **DAPS (Adaptive)** and **Baseline (Static OSPF)** routing modes.
- **Live Injection**: Click **"Inject Link Degradation"** to throttle link R1-R2. Watch DAPS switch the active flow to P2 while OSPF continues to route through the bottleneck causing queue buildup and packet drops.
- **Telemetry Cards**: Live packet delivery counter, packet drops, path switches, and a 60-second real-time latency history chart.

### Module 2: ⏱️ Hop-by-Hop Delay Decomposer
- Select a snapshot scenario (e.g., **S4 — Link Degradation**) and snapshot time $t=150\,\text{s}$.
- Click **"Analyze Candidate Paths"**.
- **Output Generated**:
  - Exact numerical decomposition: $d_{total} = d_{trans} + d_{prop} + d_{queue} + d_{proc}$.
  - Bottleneck link identification: Highlights link with the highest queue backlog share ($d_{queue}/d_{total}$).
  - Candidate paths comparison: P1 vs P2 vs P3.

### Module 3: 🌐 Real-Life Implementation & World Map
- Select a preset destination (e.g., `google.com`, `1.1.1.1`, `microsoft.com`) or enter any custom hostname/IP.
- Click **"Run Live Traceroute"**.
- **Output Generated**:
  - Dispatches Windows `tracert` with optimized `-w 400` probe timeouts.
  - Sub-300ms batch Geo-IP resolution extracts carrier ISP, Autonomous System (ASN), country, and latitude/longitude.
  - Plotted on an interactive **Leaflet Esri World Dark Gray Canvas** map with pinpoint markers and transit lines.
  - Hop-by-hop latency table with Min, Avg, Max RTT, empirical jitter ($|\Delta RTT|$), and intermediate router delay spikes.

### Module 4: 📊 Benchmark Data & Figures
- **Part 1**: Real-World Internet Telemetry Benchmarks table with 6 public endpoints, bottleneck router detection, and **"🚀 Trace Live"** buttons.
- **Part 2**: Theory vs. Real-World Comparative Matrix contrasting synthetic 7-node simulation against live BGP Internet transit.
- **Part 3**: Official 30-run paired simulation results across scenarios S1, S2, S3, and S4 with Student's $t$-test values ($p < 0.001$).
- **Part 4**: Generated publication research figures (`fig_results.png`, `fig_timeseries.png`, `fig_sensitivity.png`, `fig_failure.png`).

---

## 4. Running Unit Tests via CLI

Run the full automated test suite anytime:
```powershell
python -m unittest -v test_pda.py
```
**Expected Output**: `Ran 8 tests in 0.233s — OK`
Detailed logs are archived in [`results/unit_test_output.log`](./results/unit_test_output.log).
