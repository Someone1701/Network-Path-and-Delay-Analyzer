# Network Path and Delay Analyzer
### BCSE308P Computer Networks Lab Project
**Authors**:
- **Abhik Boxi** (`24BCE0741`)
- **Siddharth Saini** (`24BKT0121`)

---

## 1. Project Overview

The **Network Path and Delay Analyzer (PDA)** is an end-to-end research-grade network simulation and live Internet telemetry platform. It accomplishes two primary networking objectives:
1. **Microsecond Delay Decomposition**: Mathematically decomposes path delay across every hop into propagation ($d_{prop}$), transmission ($d_{tx}$), finite-buffer $M/M/1/K$ queueing ($d_{queue}$), and nodal processing ($d_{proc}$) delays, isolating the exact link bottleneck.
2. **Dynamic Adaptive Path Selection (DAPS)**: Evaluates a dynamic probing routing mechanism (using EWMA smoothing, hysteresis, and hold-down confirmation) that autonomously steers traffic around transient congestion bursts and link degradation, outperforming static OSPF Dijkstra routing.
3. **Real-Life Internet Telemetry & World Map**: Integrates Windows ICMP traceroute with sub-300ms batch Geo-IP resolution and interactive Leaflet world mapping to analyze real public Internet hops and empirical jitter.
4. **Interactive Dashboard**: Modern React 18 & GSAP web platform with 60 FPS discrete packet animation, interactive congestion evasion sandbox, and comprehensive benchmark reporting.

---

## 2. Submission Artifacts Checklist

| Requirement | Artifact File / Directory | Description |
| :--- | :--- | :--- |
| **Network Topology** | [`topology/TOPOLOGY.md`](./topology/TOPOLOGY.md)<br>[`topology/topology.json`](./topology/topology.json) | Complete 7-node, 8-link topology specification, IP subnets (`10.0.1.0/30`-`10.0.8.0/30`), interface mapping, link physical properties, buffer size ($K=64$), and candidate paths (P1, P2, P3). |
| **Device Configurations** | [`device_configurations/`](./device_configurations/) | Production-grade Cisco IOS / Quagga / FRRouting configuration files for all 7 network nodes (`S`, `R1`, `R2`, `R3`, `R4`, `R5`, `D`), detailing interfaces, OSPF area 0, queue limits, and DAPS daemon. |
| **Testing Results** | [`TESTING_RESULTS.md`](./TESTING_RESULTS.md)<br>[`results/unit_test_output.log`](./results/unit_test_output.log) | Full documentation of 8/8 unit tests passed, 30-seed paired simulation statistical evaluation (S1–S4) with Student's $t$-test ($p < 0.001$), and live public edge telemetry benchmarks. |
| **Dashboard Source Code** | [`web/`](./web/)<br>[`web_server.py`](./web_server.py) | Complete source code: `index.html`, `style.css`, `app.js`, `react-app.js`, and multi-threaded Python backend server. |
| **Functionality Demonstration** | [`USER_MANUAL.md`](./USER_MANUAL.md)<br>[`screenshots/`](./screenshots/) | Comprehensive operational guide with 8 high-resolution PNG demonstrations covering preloader, landing hero, DAPS sandbox, simulator lab, delay analyzer, world map, and benchmarks. |

---

## 3. Requirements & Installation

Python 3.10+ with standard scientific libraries:
```bash
pip install -r requirements.txt
```

---

## 4. Quick Start & Execution

### 1. Launch Interactive Web Dashboard
```bash
python web_server.py 8000
```
Open your browser at **`http://localhost:8000`** to experience:
- GSAP cybernetic preloader and React 18 landing page
- Live DAPS Congestion Evasion Sandbox trigger
- 60 FPS discrete packet simulation prototype
- Hop-by-hop delay decomposition and bottleneck detector
- Real-life traceroute with dark Leaflet world map
- Telemetry benchmarks and comparative matrix

### 2. Run Automated Test Suite
```bash
python -m unittest -v test_pda.py
```
*Executes all 8 unit tests across graph topology, $M/M/1/K$ math, delay decomposition, hysteresis, and simulation in < 0.25 seconds.*

### 3. Run Live Demonstration (CLI)
```bash
python main.py demo --scenario S3 --seed 1
python main.py demo --scenario S4 --seed 3
```

### 4. Run Hop-by-Hop Bottleneck Analysis
```bash
python main.py analyze --scenario S4 --seed 3 --at 150
```

### 5. Regenerate All Experimental Benchmarks & Figures
```bash
python main.py experiments
```

---

## 5. Academic Documentation
- **Formal Project Report**: [`Network_Path_and_Delay_Analyzer_Report.docx`](./Network_Path_and_Delay_Analyzer_Report.docx)
- **Presentation Deck**: [`Network_Path_and_Delay_Analyzer_Presentation.pptx`](./Network_Path_and_Delay_Analyzer_Presentation.pptx)
- **Viva Voce Preparation Guide**: [`VIVA_PREPARATION.md`](./VIVA_PREPARATION.md)
