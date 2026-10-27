# Network Path and Delay Analyzer

Python simulation of a 7-node network that (1) breaks the delay of any path into
propagation, transmission, processing and queueing parts, and (2) compares an
OSPF-style static path (baseline) with Delay-Aware Adaptive Path Selection (DAPS).

## Requirements
Python 3.10+ with `numpy`, `scipy`, `pandas`, `networkx`, `matplotlib`, and `python-pptx`.
```bash
pip install -r requirements.txt
```

## Project Files
| File | Purpose |
|---|---|
| `netmodel.py` | Topology, M/M/1/K finite buffer link model, background traffic generator |
| `routing.py` | Baseline Dijkstra path, candidate paths, DAPS class (probing, EWMA, hysteresis, hold-down) |
| `analyzer.py` | Per-hop delay breakdown (propagation, transmission, processing, queueing) and bottleneck finder |
| `simulate.py` | One simulation run, scenarios S1-S4, metric calculation |
| `experiments.py` | 30 paired runs, statistics, sensitivity study, ablation study |
| `figures.py` | Generates all publication-quality figures from `results/*.csv` into `figures/` |
| `main.py` | Command-line interface (`demo`, `analyze`, `experiments`) |
| `test_pda.py` | Automated unit and integration test suite |
| `web_server.py` | Interactive local web dashboard server (HTTP + REST API) |
| `web/` | Modern frontend UI (HTML5, CSS3, JS) for simulation controls & visual analytics |
| `Network_Path_and_Delay_Analyzer_Report.docx` | Comprehensive project report document |
| `Network_Path_and_Delay_Analyzer_Presentation.pptx` | Project review slide deck |
| `make_presentation.py` | Script generating PowerPoint review deck |
| `VIVA_PREPARATION.md` | Oral exam & viva guide (15 key questions, model answers, and team split) |

## Quick Start & Usage

### 1. Launch Interactive Web Dashboard
```bash
python web_server.py
```
*Open http://localhost:8000 in your browser to interactively test scenarios, tune parameters, and visualize network topology and delay breakdowns.*

### 2. Run Live Demonstration (CLI)
```bash
python main.py demo --scenario S3 --seed 1
python main.py demo --scenario S3 --probe-interval 5 --hysteresis 0.20
```

### 3. Run Hop-by-Hop Bottleneck Analysis
```bash
python main.py analyze --scenario S4 --seed 3 --at 150
```

### 4. Run Automated Tests
```bash
python -m unittest test_pda.py
```

### 5. Regenerate All Results & Figures
```bash
python main.py experiments
```

### 6. Generate Review Presentation Slides
```bash
python make_presentation.py
```
*(The slide deck is saved as `Network_Path_and_Delay_Analyzer_Presentation.pptx`)*

