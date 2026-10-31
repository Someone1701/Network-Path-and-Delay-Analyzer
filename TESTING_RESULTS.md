# Comprehensive Testing & Evaluation Results
### Network Path and Delay Analyzer (BCSE308P Computer Networks Lab)
**Authors**: Abhik Boxi (24BCE0741) & Siddharth Saini (24BKT0121)

---

## 1. Automated Unit Test Suite Summary

- **Total Test Cases**: 8
- **Passed**: 8 (100% Success Rate)
- **Failures / Errors**: 0
- **Execution Time**: 0.233 seconds
- **Assertions Verified**: 54 across graph topology, $M/M/1/K$ math, routing, delay decomposition, hysteresis, and end-to-end simulation.

| Test ID | Test Method | Test Suite | Assertions | Result | Tested Component |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **T1** | `test_topology_nodes_and_links` | `TestNetworkModel` | 4 | **PASS** | `netmodel.py` (7 nodes, 8 links, link attributes) |
| **T2** | `test_candidate_paths` | `TestNetworkModel` | 5 | **PASS** | `routing.py` (P1=20.0, P2=22.5, P3=30.0) |
| **T3** | `test_mm1k_properties` | `TestNetworkModel` | 8 | **PASS** | `netmodel.py` (M/M/1/K finite queue, singularity removal at $\rho=1.0$) |
| **T4** | `test_delay_decomposition` | `TestAnalyzer` | 15 | **PASS** | `analyzer.py` ($d_{tx} + d_{prop} + d_{queue} + d_{proc}$, bottleneck localization) |
| **T5** | `test_hysteresis_and_holddown` | `TestDAPSDecisionLogic` | 6 | **PASS** | `routing.py` (anti-flapping, 10% threshold, 2-cycle holddown) |
| **T6** | `test_short_simulation_runs` | `TestSimulation` | 10 | **PASS** | `simulate.py` (10s paired simulation run extraction) |
| **T7** | `test_all_scenarios_execute` | `TestSimulation` | 4 | **PASS** | `simulate.py` (scenarios S1, S2, S3, S4 execution verification) |
| **T8** | `test_analyzer_empty_path` | `TestSimulation` | 2 | **PASS** | `analyzer.py` (edge case handling of empty or disconnected nodes) |

---

## 2. Statistical Simulation Benchmark Results (30 Paired Seeds)

Every scenario (S1–S4) was executed across **30 independent random seeds** with paired seeds shared identically between the Baseline (OSPF) and Proposed (DAPS) routing mechanisms:

| Scenario | Load Profile | Metric | Baseline (OSPF) | Proposed (DAPS) | Improvement | Statistical Significance |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **S1** | Low Load ($\rho \approx 0.30$) | Mean Delay (ms) | $13.14 \pm 0.17$ | $13.22 \pm 0.22$ | $-0.6\%$ | $p < 0.05$ (neutral) |
| **S1** | Low Load ($\rho \approx 0.30$) | Packet Loss (%) | $0.00 \pm 0.00$ | $0.00 \pm 0.00$ | $0.0\%$ | N/A |
| **S2** | Med Load ($\rho \approx 0.60$) | Mean Delay (ms) | $16.48 \pm 2.07$ | $15.55 \pm 0.80$ | **+5.6%** | $p < 0.01$ |
| **S2** | Med Load ($\rho \approx 0.60$) | 95th-pct Delay (ms) | $29.44 \pm 11.45$ | $20.87 \pm 1.98$ | **+29.1%** | $p < 0.001$ |
| **S2** | Med Load ($\rho \approx 0.60$) | Packet Loss (%) | $0.16 \pm 0.23$ | $0.03 \pm 0.03$ | **+81.4%** | $p < 0.001$ |
| **S3** | High Load Peak ($\rho \approx 0.90$) | Mean Delay (ms) | $27.51 \pm 5.27$ | $23.01 \pm 2.41$ | **+16.4%** | $p < 0.001$ |
| **S3** | High Load Peak ($\rho \approx 0.90$) | 95th-pct Delay (ms) | $71.00 \pm 20.24$ | $44.61 \pm 9.60$ | **+37.2%** | $p < 0.001$ |
| **S3** | High Load Peak ($\rho \approx 0.90$) | Jitter (ms) | $14.25 \pm 5.11$ | $7.97 \pm 1.94$ | **+44.1%** | $p < 0.001$ |
| **S3** | High Load Peak ($\rho \approx 0.90$) | Packet Loss (%) | $2.57 \pm 1.75$ | $0.60 \pm 0.39$ | **+76.7%** | $p < 0.001$ |
| **S4** | Link Degradation (R1-R2 at 40%) | Mean Delay (ms) | $26.61 \pm 3.12$ | $20.70 \pm 1.45$ | **+22.2%** | $p < 0.001$ |
| **S4** | Link Degradation (R1-R2 at 40%) | 95th-pct Delay (ms) | $79.24 \pm 18.50$ | $36.08 \pm 7.12$ | **+54.5%** | $p < 0.001$ |
| **S4** | Link Degradation (R1-R2 at 40%) | Jitter (ms) | $12.87 \pm 4.30$ | $5.76 \pm 1.82$ | **+55.3%** | $p < 0.001$ |
| **S4** | Link Degradation (R1-R2 at 40%) | Packet Loss (%) | $3.10 \pm 1.89$ | $0.25 \pm 0.21$ | **+91.9%** | $p < 0.001$ |

---

## 3. Real-World Internet Telemetry Benchmark Results

Live ICMP multi-hop traceroute telemetry with batch sub-300ms Geo-IP and autonomous system extraction:

| Destination Service | Target IP & Autonomous System | Hops | Min RTT | Avg RTT | Max RTT | Jitter | Bottleneck Location | Delay Spike ($\Delta RTT$) | Latency Grade |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :---: | :---: |
| **Google Search & CDN** | `142.251.126.100` (AS15169 Google LLC) | 11 | 25.0 ms | **26.0 ms** | 27.0 ms | 2.0 ms | Gujarat Edge Gateway (Reliance Jio) | +95.7 ms | **FAST (<30ms)** |
| **Cloudflare Anycast DNS** | `1.1.1.1` (AS13335 Cloudflare, Inc.) | 7 | 1.0 ms | **1.3 ms** | 2.0 ms | 1.0 ms | Local Aggregation Router (`136.233.9.2`) | +2.2 ms | **ULTRA-FAST (<5ms)** |
| **Cloudflare Web Edge** | `104.16.132.229` (AS13335 Cloudflare) | 8 | 8.0 ms | **9.4 ms** | 11.0 ms | 3.0 ms | Chennai IXP / Peering Exchange | +6.8 ms | **FAST (<30ms)** |
| **Google Public DNS** | `8.8.8.8` (AS15169 Google LLC) | 9 | 24.0 ms | **25.2 ms** | 26.0 ms | 2.0 ms | Jio Core Inter-AS Gateway | +21.4 ms | **FAST (<30ms)** |
| **Microsoft Azure Edge** | `20.112.52.29` (AS8075 Microsoft Corp) | 14 | 41.0 ms | **44.5 ms** | 49.0 ms | 8.0 ms | Mumbai Carrier Peering Exchange | +32.1 ms | **MODERATE (<50ms)** |
| **GitHub Global Anycast** | `20.207.73.82` (AS8075 Microsoft Corp) | 13 | 38.0 ms | **41.2 ms** | 45.0 ms | 7.0 ms | Trans-Continental Subsea Gateway | +27.8 ms | **MODERATE (<50ms)** |

---

## 4. Generated Artifact Files & Raw Data
- **Summary CSV**: [`results/summary.csv`](./results/summary.csv)
- **Raw Seed Data**: [`results/raw_runs.csv`](./results/raw_runs.csv)
- **Sensitivity Grid**: [`results/sensitivity.csv`](./results/sensitivity.csv)
- **Ablation Study**: [`results/ablation.csv`](./results/ablation.csv)
- **Figures**: [`figures/fig_results.png`](./figures/fig_results.png), [`figures/fig_timeseries.png`](./figures/fig_timeseries.png), [`figures/fig_sensitivity.png`](./figures/fig_sensitivity.png), [`figures/fig_failure.png`](./figures/fig_failure.png)
- **Unit Test Execution Log**: [`results/unit_test_output.log`](./results/unit_test_output.log)
