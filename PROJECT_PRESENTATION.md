# Project Review Presentation Deck
### Network Path and Delay Analyzer (BCSE308P Computer Networks Lab)
**Authors**:
- **Abhik Boxi** (`24BCE0741`) — Mathematical Modeling, Delay Decomposer, Simulation & React Frontend
- **Siddharth Saini** (`24BKT0121`) — Routing Algorithm (DAPS), 30-Run Statistical Tests & Live Traceroute

---

## Slide 1: Title Slide
- **Title**: NETWORK PATH AND DELAY ANALYZER
- **Subtitle**: Per-Hop Delay Decomposition, Adaptive Path Selection (DAPS) & Live Internet Telemetry
- **Course**: BCSE308P – Computer Networks Lab Project (Fall Semester 2026–27)
- **School**: School of Computer Science and Engineering (SCOPE)
- **Team Members**:
  - Abhik Boxi (`24BCE0741`)
  - Siddharth Saini (`24BKT0121`)

---

## Slide 2: Motivation & Problem Statement
### The Limitations of Current Routing
- **OSPF & Static Metrics**: Link-state routing uses static metrics ($\text{Cost} = 100/\text{Bandwidth}$) computed once via Dijkstra's algorithm.
- **Blind to Dynamic Congestion**: Metrics do not reflect runtime queueing. Even under heavy traffic bursts, traffic remains pinned to the primary link.
- **Buffer Saturation**: Bursts cause buffer overflow and queueing delays, degrading voice/video services (high jitter and packet drops).
- **Passive Diagnostics Only**: Tools like Ping and Traceroute measure latency, but cannot decompose delays nor reroute traffic.

### Our Solution & Research Goals
- **Component 1 — Hop-by-Hop Analyzer**: Decomposes path latency into propagation ($d_{prop}$), transmission ($d_{tx}$), processing ($d_{proc}$), and queueing ($d_{queue}$) delays to pinpoint bottleneck links.
- **Component 2 — DAPS (Proposed Mechanism)**: Actively probes candidate paths every 2s, applies EWMA smoothing to delay/jitter/loss, and intelligently steers traffic.
- **Anti-Flapping Protection**: Employs a 10% hysteresis margin and 2-cycle hold-down to eliminate route oscillation.
- **Rigorous Statistical Validation**: Evaluated across 30 paired seed runs in 4 realistic scenarios (S1–S4) using Student's $t$-tests ($p < 0.001$).
- **Live Internet Telemetry**: Real-world Windows traceroute with sub-300ms batch Geo-IP and dark Leaflet world map.

---

## Slide 3: System Architecture & Test Topology
### Network Topology Specification
- 7 Nodes: Source ($S$), Core Routers ($R_1$ to $R_5$), Destination ($D$)
- 8 Bidirectional Links with capacities from 8 to 20 Mbps and propagation delays from 2.0 to 8.0 ms.
- Router interface buffers modeled as finite $M/M/1/K$ queues ($K=64$ packets).

### Candidate Paths Catalog from Source (S) to Destination (D)
- **Path P1 ($S \to R_1 \to R_2 \to D$)**: 3 hops, static cost = 20.0, fixed prop = 10.0 ms (Default OSPF shortest path).
- **Path P2 ($S \to R_3 \to R_4 \to D$)**: 3 hops, static cost = 22.5, fixed prop = 12.0 ms (First alternative bypass).
- **Path P3 ($S \to R_1 \to R_5 \to R_4 \to D$)**: 4 hops, static cost = 30.0, fixed prop = 14.0 ms (Second alternative via $R_5$).

---

## Slide 4: Link Delay Model & M/M/1/K Queueing Analysis
### M/M/1/K Queueing Formulation
- **Overcoming M/M/1 Singularity**: In pure $M/M/1$, delay becomes infinite as utilization $\rho \to 1.0$. Real routers have finite buffers.
- **Finite Buffer ($K = 64$ packets)**: Loss probability is strictly bounded:
  $$p_{loss} = \frac{(1 - \rho)\rho^K}{1 - \rho^{K+1}}$$
- **Mean System Time ($W$)**: Derived from average occupancy $N_{avg}$ and effective arrival rate $\lambda_{eff} = \rho \cdot \mu \cdot (1 - p_{loss})$.
- **Queueing Delay**: $d_{queue} = \max(W - d_{tx}, 0)$. Stays bounded even when bursts push $\rho > 1$.
- **Processing Delay**: Fixed at $0.1\,\text{ms}$ per hop.

### Hop-by-Hop Delay Decomposition
- Total delay breakdown: $d_{path} = \sum (d_{prop} + d_{tx} + d_{proc} + d_{queue})$.
- **Bottleneck Link Identification**: Programmatically identifies the link with the maximum queue backlog share:
  $$\text{Share}\% = \frac{d_{queue}^{worst}}{d_{total}} \times 100$$
- *Example*: Under Link Degradation (S4), Link $R_1\text{-}R_2$ suffers $123\,\text{ms}$ queueing, accounting for $90\%$ of total path delay.

---

## Slide 5: Proposed Mechanism: DAPS Algorithm & Logic
### Four Core Steps of DAPS
1. **Active Probing (Every 2s)**: Dispatches 4 lightweight probe packets (64 bytes) along candidate paths P1, P2, and P3 to sample delay ($d$), jitter ($j$), and packet loss ($l$).
2. **EWMA Smoothing**: Filters transient sample noise:
   $$\bar{D}_t = (1 - \alpha)\bar{D}_{t-1} + \alpha D_t, \quad \alpha = 0.30$$
3. **Composite Score Formulation**:
   $$S = \bar{D} + w_J \bar{J} + w_L \bar{L}, \quad (w_J = 1.0,\, w_L = 1000.0)$$
   *(A 1% packet loss is penalized equivalent to a 10 ms delay).*
4. **Anti-Flapping Protection**:
   - **Hysteresis ($H = 0.10$)**: Alternative path must offer at least a 10% lower score than the current path.
   - **Hold-Down ($C = 2$)**: Candidate path must persistently win for 2 consecutive cycles (4s) before traffic forwarding shifts.

---

## Slide 6: Experimental Setup & Scenarios
### Four Realistic Evaluation Scenarios
- **S1 (Low Load, factor = 0.5)**: Link utilization ~15–23%. Queues near zero; baseline is optimal.
- **S2 (Medium Load, factor = 1.0)**: Link utilization ~30–45%. Occasional background traffic bursts.
- **S3 (High Load Peak, factor = 1.5)**: Link utilization ~45–68%. Heavy bursts push links to buffer saturation ($\rho \approx 1.0$).
- **S4 (Link Degradation Event)**: Medium load, but at $t = 100\text{--}200\,\text{s}$, Link $R_1\text{-}R_2$ loses 60% capacity ($10 \to 4\,\text{Mbps}$). Static OSPF fails to detect capacity loss.

### Statistical Rigor
- **30 Paired Random Seeds**: Every test executed across 30 identical background load realizations.
- **Student's $t$-Test**: $p < 0.001$ confirms high statistical significance in congested scenarios.
- **Standards Compliant**: Metrics align with IETF IPPM RFC standards.

---

## Slide 7: Experimental Results: Baseline vs. Proposed (30 Runs)

| Scenario | Metric | Baseline (OSPF) | Proposed (DAPS) | Improvement | Statistical Significance |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **S1 (Low)** | Mean Delay | $13.14 \pm 0.17\,\text{ms}$ | $13.22 \pm 0.22\,\text{ms}$ | $-0.6\%$ | Neutral ($p < 0.05$) |
| **S2 (Med)** | Mean Delay | $16.48 \pm 2.07\,\text{ms}$ | $15.55 \pm 0.80\,\text{ms}$ | **+5.6%** | $p < 0.01$ |
| **S2 (Med)** | Packet Loss | $0.16 \pm 0.23\%$ | $0.03 \pm 0.03\%$ | **+81.4%** | $p < 0.001$ |
| **S3 (High)** | Mean Delay | $27.51 \pm 5.27\,\text{ms}$ | $23.01 \pm 2.41\,\text{ms}$ | **+16.4%** | $p < 0.001$ |
| **S3 (High)** | 95th-pct Delay | $71.00 \pm 20.24\,\text{ms}$ | $44.61 \pm 9.60\,\text{ms}$ | **+37.2%** | $p < 0.001$ |
| **S3 (High)** | Packet Loss | $2.57 \pm 1.75\%$ | $0.60 \pm 0.39\%$ | **+76.7%** | $p < 0.001$ |
| **S4 (Degr)** | Mean Delay | $26.61 \pm 3.12\,\text{ms}$ | $20.70 \pm 1.45\,\text{ms}$ | **+22.2%** | $p < 0.001$ |
| **S4 (Degr)** | Event Delay | $44.38\,\text{ms}$ | $17.13\,\text{ms}$ | **+61.4%** | $p < 0.001$ |
| **S4 (Degr)** | Packet Loss | $3.10 \pm 1.89\%$ | $0.25 \pm 0.21\%$ | **+91.9%** | $p < 0.001$ |

---

## Slide 8: Time-Series Dynamics (S3 & S4)
- **Baseline Behavior (Orange)**: Remains pinned to P1 throughout the 300s run. In S3, background bursts create severe latency spikes up to $93\,\text{ms}$. Under S4 degradation, delay explodes to $135\,\text{ms}$ with 42% packet loss.
- **DAPS Adaptation (Blue)**: Actively detects queue build-ups and migrates traffic to P2/P3 in 2–4 seconds, maintaining delay at $18\,\text{ms}$.
- **Controlled Path Switching**: Smooth switches occur only when statistically necessary, preventing oscillation.

---

## Slide 9: Ablation Study & Parameter Sensitivity
### Ablation: Why Anti-Flapping Matters
- **Full DAPS (Default)**: $23.01\,\text{ms}$ delay, 25.8 path switches.
- **No Hysteresis ($H=0$) & No Hold-down ($C=1$)**: Delay is $22.19\,\text{ms}$, but path switches jump from 25.8 to **72.0** per run!
- **Engineering Trade-off**: DAPS sacrifices just 3.6% delay in exchange for cutting path switches by **64%**, preventing out-of-order packets in TCP streams.
- **Probe Interval Sensitivity**:
  - 1s probe: 19.4% gain (higher overhead)
  - 2s probe: **16.4% gain (optimal sweet spot, 0.15% overhead)**
  - $\ge$ 10s probe: Negative gain ($-2.5\%$ to $-5.2\%$) due to stale measurements.

---

## Slide 10: Critical Evaluation: When Does DAPS Fail?
1. **Slow Probing ($\ge 10\,\text{s}$ interval)**: Background bursts have a mean duration of 12s. Slow probing renders measurements stale, causing DAPS to move into past congestion.
2. **Self-Induced Congestion (Heavy Flows $\ge 4\,\text{Mbps}$)**: Moving a large flow carries its own queue load to the destination path, causing severe bouncing ($-25.5\%$ penalty at 6 Mbps).
3. **Low Load Scenarios (S1)**: Nothing to gain. Probing noise triggers ~3 needless switches to paths with higher propagation delay ($-0.6\%$ penalty).

---

## Slide 11: Real-Life Internet Implementation & World Map
- **High-Speed Traceroute Engine**: Dispatches Windows `tracert` with `-w 400` probe timers.
- **Batch Geo-IP Resolution (< 300 ms)**: Parallel batch queries resolve carrier ISP, Autonomous System (ASN), city, and coordinates for all hops simultaneously.
- **Interactive Leaflet World Map**: Dark Gray Canvas basemap rendering physical transit paths and glowing hop markers.
- **Empirical Jitter Discovery**: Proves that router queue backlogs in the physical Internet translate directly to empirical jitter ($|\Delta RTT|$) and intermediate transit spikes.

---

## Slide 12: Real-World Telemetry Benchmarks
- **Google Search CDN (`142.251.126.100` / AS15169)**: 11 hops | Avg RTT: 26.0 ms | Bottleneck: Gujarat Jio Gateway (+95.7 ms spike).
- **Cloudflare Anycast (`1.1.1.1` / AS13335)**: 7 hops | Avg RTT: 1.3 ms | Ultra-low jitter (1.0 ms).
- **Cloudflare Web Edge (`104.16.132.229`)**: 8 hops | Avg RTT: 9.4 ms | Peering via Chennai IXP.
- **Microsoft Azure Edge (`20.112.52.29` / AS8075)**: 14 hops | Avg RTT: 44.5 ms | Carrier exchange in Mumbai.
- **GitHub Fastly Anycast (`20.207.73.82`)**: 13 hops | Avg RTT: 41.2 ms | Trans-continental optical subsea path.

---

## Slide 13: Team Division & Viva Presentation Split
### Abhik Boxi (`24BCE0741`)
- **Modules Owned**: `netmodel.py` (M/M/1/K queue math), `analyzer.py` (delay decomposer), `simulate.py`, `web/react-app.js` (React landing page & GSAP preloader).
- **Viva Focus Topics**:
  - Derivation of $M/M/1/K$ queueing formula & handling $\rho \ge 1.0$.
  - 4 physical delay components ($d_{prop}, d_{tx}, d_{proc}, d_{queue}$).
  - Bottleneck hop percentage calculation.
  - Interactive DAPS Congestion Evasion Sandbox.

### Siddharth Saini (`24BKT0121`)
- **Modules Owned**: `routing.py` (DAPS algorithm), `experiments.py` (30-run statistical tests), `web_server.py` (live traceroute & batch Geo-IP), Leaflet World Map integration.
- **Viva Focus Topics**:
  - DAPS active probing, EWMA smoothing ($\alpha = 0.30$).
  - Anti-flapping logic: Hysteresis ($H=0.10$) and Hold-down ($C=2$).
  - Student's $t$-test statistical validation ($p < 0.001$).
  - Failure boundary analysis & real-world telemetry benchmarks.

---

## Slide 14: Conclusion & Future Roadmap
### Summary of Achievements
- Delivered a complete, reproducible Network Path and Delay Analyzer in Python and React 18.
- Demonstrated that DAPS reduces mean delay by **16.4%**, 95th-percentile tail delay by **37.2%**, and packet loss by **76.7%** in high-load networks.
- Achieved **61.4%** delay reduction during active link degradation events.
- Validated that hysteresis and hold-down cut path flapping by **64%**.
- Bridged theoretical discrete simulation to physical networks with live ICMP traceroute and Leaflet world mapping.

### Future Roadmap
1. **P4 Programmable Hardware Switches**: Offload DAPS active probing and score calculations directly to hardware ASIC pipelines.
2. **Multi-Path TCP (MPTCP)**: Split heavy flows across multiple candidate paths simultaneously to overcome single-path bottleneck capacities.
3. **Distributed Multi-Host Coordination**: Implement decentralized randomized backoffs to prevent multiple hosts from synchronizing onto the same backup path.
