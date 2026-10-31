# Network Device Configurations Architecture
### Network Path and Delay Analyzer (BCSE308P Computer Networks Lab)
**Authors**: Abhik Boxi (24BCE0741) & Siddharth Saini (24BKT0121)

---

## 1. Directory Overview

This directory provides the production-grade Cisco IOS / Quagga / FRRouting router configurations for the 7 simulated network devices:

| Configuration File | Device ID | Role | Loopback IP | Physical Interfaces |
| :--- | :---: | :--- | :---: | :--- |
| [`S_Source.cfg`](./S_Source.cfg) | **S** | Ingress Source & DAPS Agent Daemon | `10.0.0.1/32` | `Gi0/0` (to R1), `Gi0/1` (to R3) |
| [`R1_CoreRouter.cfg`](./R1_CoreRouter.cfg) | **R1** | Core Ingress Branch Router | `10.0.0.2/32` | `Gi0/0` (to S), `Gi0/1` (to R2), `Gi0/2` (to R5) |
| [`R2_CoreRouter.cfg`](./R2_CoreRouter.cfg) | **R2** | Upper Core Egress Router | `10.0.0.3/32` | `Gi0/0` (to R1), `Gi0/1` (to D) |
| [`R3_CoreRouter.cfg`](./R3_CoreRouter.cfg) | **R3** | Middle Transit Router | `10.0.0.4/32` | `Gi0/0` (to S), `Gi0/1` (to R4) |
| [`R4_CoreRouter.cfg`](./R4_CoreRouter.cfg) | **R4** | Lower Core Egress Router | `10.0.0.5/32` | `Gi0/0` (to R3), `Gi0/1` (to D), `Gi0/2` (to R5) |
| [`R5_CoreRouter.cfg`](./R5_CoreRouter.cfg) | **R5** | Detour Intermediate Router | `10.0.0.6/32` | `Gi0/0` (to R1), `Gi0/1` (to R4) |
| [`D_Destination.cfg`](./D_Destination.cfg) | **D** | Egress Destination Host / Sink | `10.0.0.7/32` | `Gi0/0` (to R2), `Gi0/1` (to R4) |

---

## 2. Queueing & Buffer Management ($M/M/1/K$)

Each router interface implements a strict hardware FIFO queue buffer limit:
```cisco
queue-limit 64 packets
```
Under heavy Poisson arrival bursts ($\lambda > \mu$), queue backlog builds up to $K=64$ packets. When the buffer is saturated, arrival packets experience tail-drop packet loss ($p_{loss} > 0$), accurately mirroring our discrete mathematical $M/M/1/K$ queue model.

---

## 3. OSPF Cost & Reference Bandwidth

All routers run **OSPF Area 0** with:
```cisco
router ospf 1
 auto-cost reference-bandwidth 100
```
This sets link metric:
$$\text{Cost} = \frac{100\,\text{Mbps}}{\text{Bandwidth}}$$
- 20 Mbps link &rarr; Cost = 5
- 10 Mbps link &rarr; Cost = 10
- 8 Mbps link &rarr; Cost = 12.5 (rounded to 12 in OSPF integer metric)

---

## 4. DAPS Agent Daemon Deployment on Node S

Node **S** runs the DAPS client daemon:
- **Probe Cycle**: Dispatches 4 probe packets every 2 seconds on paths P1, P2, and P3.
- **EWMA Smoothing**: $\alpha = 0.30$ to prevent oscillating reactions to instantaneous jitter.
- **Anti-Flapping Mechanics**: Requires $\ge 10\%$ score improvement ($H=0.10$) sustained over 2 consecutive confirmation cycles ($C=2$).
