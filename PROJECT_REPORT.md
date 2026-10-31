Innovative Evaluation Practices for BCSE308P - Computer Networks Lab
Fall Semester 2026-27
NETWORK PATH AND DELAY ANALYZER
B.Tech.
in
Computer Science and Engineering
School of Computer Science and Engineering
October 2026

# ABSTRACT
Packets in a network can usually reach their destination through more than one path, but standard routing such as OSPF chooses a path from fixed link costs and does not notice when a link becomes congested. This project builds a Network Path and Delay Analyzer that does two jobs. Its analyzer splits the delay of any path, hop by hop, into propagation, transmission, processing and queueing parts and names the bottleneck link. Its proposed mechanism, Delay-Aware Adaptive Path Selection (DAPS), sends small probe packets along three candidate paths every two seconds, smooths the measured delay, jitter and loss with an exponentially weighted moving average, and moves traffic only when another path is clearly and repeatedly better.
The baseline is an OSPF-style static shortest path. Both schemes were tested in a Python simulation of a seven-node network whose links are M/M/1/K queues with random background load and bursts. Four scenarios were used (low, medium and high load, and a link-degradation event), each run 30 times with paired random seeds and reported as mean ± standard deviation.
In the high-load scenario DAPS reduced mean delay by 16.4% (27.5 ms to 23.0 ms) and packet loss by 76.7%; when a link degraded, mean delay fell by 61.4%. At low load it gave no benefit. Sensitivity tests show that the gain disappears when probes are sent every 10 s or less often, and that DAPS becomes worse than the baseline when the monitored flow is large enough (4 Mbps or more) to congest the path it moves to. The ablation study shows that hysteresis and hold-down mainly reduce path switching rather than delay. All results come from simulation; a real testbed is future work.

# CERTIFICATE
This is to certify that the project report titled "NETWORK PATH AND DELAY ANALYZER" is a bonafide record of the work done by Abhik Boxi (24BCE0741) and Siddharth Saini (24BKT0121) in partial fulfilment of the requirements of the Innovative Evaluation Practices for BCSE308P - Computer Networks Lab during the Fall Semester 2026-2027.
Name and Signature of the Students

# TABLE OF CONTENTS

# 1. INTRODUCTION
1.1 Background and motivation
When one computer sends data to another, the data is cut into packets and every packet travels through a chain of routers. The time a packet needs to go from the sender to the receiver is called the end-to-end delay. At every hop this delay has four parts [1]. Propagation delay is the time the signal needs to travel along the cable; it depends on distance and is fixed. Transmission delay is the time needed to push all bits of the packet onto the link; it equals the packet size divided by the link bandwidth. Processing delay is the time the router needs to read the packet header and decide where to send it. Queueing delay is the time the packet waits in the router's buffer before its turn comes.
The first three parts are almost constant for a given path. Queueing delay is different: it grows quickly when the link is busy, so the same path can be fast at one moment and slow a few seconds later. Two more quantities matter for real-time services such as video calls and online games: jitter, which is the variation of delay from one packet to the next, and packet loss, which happens when a full buffer has to drop packets.
Most networks choose paths with a link-state routing protocol such as OSPF (Open Shortest Path First) [2]. Every router learns a map of the network and runs Dijkstra's shortest-path algorithm [3] using a cost that the administrator has set for every link, usually based on bandwidth. These costs do not change with traffic, so the chosen path stays the same even when it becomes crowded. Tools such as ping and traceroute, which use ICMP messages [4], can show the delay and the hops of a path, but they only measure; they do not explain how much of the delay is queueing, and they do not move traffic.
This is the motivation for the project. A path that looks best on paper may be the worst path during a traffic burst. A small tool that can (i) show where the delay of a path comes from and (ii) steer traffic to a better path when the current one gets congested is useful, and its behaviour is easy to study and explain.
1.2 Problem statement
Given a source S, a destination D and several possible paths between them, two questions are addressed: (a) how can the delay of every path be measured and explained hop by hop, and (b) how can the path be chosen so that delay, jitter and packet loss stay low when the load changes, without making the traffic jump from path to path all the time? The project compares a static OSPF-style path choice (the baseline) with a probe-based adaptive choice (the proposed mechanism). Delay, loss and jitter follow the definitions of the IETF IP Performance Metrics (IPPM) working group [5]–[7].
1.3 Objectives
Build a simulated network in which every link shows realistic delay behaviour (propagation, transmission, processing and queueing delay, and loss).
Implement a path and delay analyzer that gives a per-hop breakdown of delay and points to the bottleneck hop.
Implement the baseline: an OSPF-style static shortest path.
Design and implement the proposed mechanism (DAPS) with smoothing and protection against frequent path changes.
Evaluate baseline and proposed in four scenarios with 30 repeated runs each, using mean delay, 95th-percentile delay, jitter and packet loss.
Analyse the trends and trade-offs, and find the conditions in which the proposed scheme does not work well.
1.4 Scope and limitations
Scope. One source–destination pair; one 2 Mbps flow from S to D; a seven-node topology with three candidate paths; random background traffic on all links; metrics of delay, jitter and loss; four scenarios (three load levels and one link-degradation event).
Limitations. The work is a simulation, not a real network. Link behaviour is described by a queueing model, not by real packet queues. TCP congestion control, packet reordering, routing-protocol messages and many competing adaptive flows are not modelled. A full link failure is not tested; only a loss of link capacity is. These points are discussed again in Section 6.2.
1.5 Mapping to course modules and the lab experiment
Table 1.1 links the project to the topics of the Computer Networks course and to the lab work on measuring and analysing network paths. The project extends the usual ping and traceroute experiments by adding automatic delay analysis and adaptive path choice.
Table 1.1: Mapping of the project to course topics
# 2. LITERATURE SURVEY
2.1 Overview of the existing protocol or scheme
The existing scheme used as the baseline is the link-state routing of OSPF [2]. Each router describes its links in link-state advertisements and floods them through the network. All routers therefore hold the same map and each runs Dijkstra's algorithm [3] on it. On many routers the default link cost is the reference bandwidth divided by the link bandwidth, so a 10 Mbps link with a 100 Mbps reference has cost 10. The cost of a path is the sum of its link costs, and the cheapest path is used.
OSPF is stable, loop-free and needs little control traffic. Its weakness for our purpose is that the cost does not depend on the present load. The path changes only when the topology changes or when an administrator edits a cost. Delay on the chosen path can therefore become high without any reaction. For measurement, ping gives the round-trip time using ICMP echo messages and traceroute finds each hop by sending packets with increasing time-to-live values [4]. Both are measurement tools and make no routing decision.
2.2 Review of related work
Table 2.1 summarises eight earlier works that are close to this project. They cover delay-based routing, traffic engineering, measurement of Internet paths, overlay routing and smoothing of delay samples.
Table 2.1: Review of related work

2.3 Research gap and justification of novelty
The ARPANET experience shows that reacting directly to measured delay can make traffic oscillate, and that smoothing the measurements and limiting the size of each change helps [8], [9]. Measurement studies show that better alternate paths exist for many source–destination pairs [12], [13], and overlay systems use active probing to exploit them [14]. Offline weight tuning improves OSPF but cannot follow short bursts [11].
What is missing at the scale of a student lab is a small, complete and repeatable tool that (i) explains where the delay of a path comes from, (ii) chooses between a few candidate paths using smoothed delay, jitter and loss, (iii) protects itself against path flapping, and (iv) is tested honestly against an OSPF-style baseline, including the conditions in which it fails. This project provides such a tool. Its novelty is therefore the combination and the careful evaluation, not a new class of routing algorithm; this is stated clearly in Section 3.4.
# 3. PROPOSED SYSTEM
3.1 System architecture or topology
The test network (Figure 3.1) has seven nodes: a source host S, a destination host D and five routers R1 to R5, joined by eight links. Each link has its own bandwidth and propagation delay (Table 3.1). One flow of 2 Mbps runs from S to D; this is the traffic whose delay we want to keep low. Every link also carries background traffic from other users, which changes randomly with time. Three loop-free paths lead from S to D (Table 3.2).

Figure 3.1: Test topology. P1 (solid) is the baseline path; P2 and P3 are alternatives
Table 3.1: Link parameters (mean background utilisation is given at load factor 1.0)

Figure 3.2 shows the software architecture. The network model and the background traffic generator create the link conditions. The probe engine, the estimator and the path selector form the proposed mechanism (DAPS). The baseline and DAPS each carry the same foreground flow, and the analyzer and metrics module records the results and produces the per-hop reports and graphs.

Figure 3.2: Architecture of the Network Path and Delay Analyzer
3.2 Baseline mechanism description
The baseline imitates OSPF [2]. Every link gets the cost 100 Mbps ÷ bandwidth, so a 20 Mbps link costs 5, a 10 Mbps link costs 10 and the 8 Mbps link costs 12.5. Dijkstra's algorithm [3] then finds the cheapest path from S to D. This is P1 with a total cost of 20 (Table 3.2). The costs never change during a run, so the baseline keeps using P1 however busy it becomes. This is how a normal OSPF network behaves when nobody changes the configuration and no link goes down.
Table 3.2: Candidate paths from S to D

3.3 Proposed mechanism: algorithm, pseudocode, flowchart
Delay-Aware Adaptive Path Selection (DAPS) keeps the three cheapest loop-free paths as candidates. Traffic starts on P1. DAPS then repeats the following steps (Figure 3.3).
Probe. Every 2 seconds, four small probe packets (64 bytes) are sent along each candidate path. For each path the mean delay d, the jitter j (mean absolute difference between delays of consecutive probes) and the loss ratio l are computed. If all four probes are lost, d is set to 400 ms so that the path is avoided.
Smooth. Each value is smoothed with an exponentially weighted moving average (EWMA): new estimate = α × new sample + (1 − α) × old estimate. With α = 0.3 a new sample counts for 30%, so one unlucky measurement cannot decide alone. TCP uses the same idea to estimate round-trip time [15].
Score. Each path gets a score S = D + wJ × J + wL × L, where D, J and L are the smoothed delay (ms), jitter (ms) and loss ratio. We use wJ = 1 and wL = 1000 ms, which means that 1% loss is treated like 10 ms of extra delay. A lower score is better.
Switch carefully. Let B be the path with the lowest score. Traffic moves to B only if (a) the score of B is lower than (1 − h) times the score of the current path, with h = 0.10 (hysteresis, a safety margin like the gap in a thermostat), and (b) B wins in two checks in a row (hold-down). Otherwise the traffic stays where it is.
Example. If the current path P1 has score 40 ms and P2 has 30 ms, then 30 < 0.9 × 40 = 36, so P2 becomes the pending target. If P2 is still clearly better at the next probe round (2 s later), traffic moves to P2.
Pseudocode
DAPS(paths P1..Pk, interval T, probes n, alpha, wJ, wL, h, N)
  current <- P1 ; pendingTarget <- none ; pending <- 0
  every T seconds:
    for each path Pi:
      send n probes along Pi
      d <- mean delay of received probes   (400 ms if all lost)
      j <- mean |difference| of consecutive probe delays
      l <- fraction of probes lost
      D[i] <- alpha*d + (1-alpha)*D[i]     (first round: D[i] <- d)
      J[i], L[i] <- updated in the same way
      score[i] <- D[i] + wJ*J[i] + wL*L[i]
    best <- path with the smallest score
    if best != current and score[best] < (1-h) * score[current]:
      if best == pendingTarget: pending <- pending + 1
      else: pendingTarget <- best ; pending <- 1
      if pending >= N: current <- best ; pending <- 0   // switch
    else:
      pending <- 0
  every second: send the foreground flow on current


Figure 3.3: Flowchart of the DAPS decision procedure
3.4 Novelty statement
Table 3.3 shows exactly what differs between the baseline and the proposed mechanism.
Table 3.3: Difference between baseline and proposed mechanism

What is new, and what is not. Delay-based routing, active probing, EWMA smoothing and hysteresis are each known ideas [8], [9], [14], [15]. The contribution of this project is (i) putting them together in one lightweight, end-host style mechanism that uses a composite score of delay, jitter and loss over a small set of candidate paths, (ii) the analyzer that explains the delay of each path, and (iii) an honest evaluation with an ablation study that shows which parts of the mechanism actually help and in which conditions it fails (Section 5).
3.5 Assumptions and design decisions
Data packets are 1000 bytes and probe packets are 64 bytes.
Each link is an M/M/1/K queue (random arrivals, random service times, one server, room for K = 64 packets) [16]. Queueing delay of a packet is taken as exponentially distributed around the mean given by the model.
The foreground flow is one steady 2 Mbps flow. Its load is added to the links of the path it uses, so a path switch also moves this load.
Background traffic is random: a base level per link, a slow sine-wave change, and on/off bursts (mean length 12 s, +30% utilisation). Both schemes see exactly the same background traffic in a given run.
Probes see the same queues as data packets. Their own load is tiny and is only counted as overhead.
The candidate set is fixed: the three loop-free paths with the lowest static cost.
A link degradation is modelled as a loss of link capacity. It is not a link-down event, so OSPF would not detect it and the baseline keeps its path.
Delay is measured directly in the simulation, so clock synchronisation between nodes is not an issue.
Time advances in steps of one second; each run lasts 300 s. In each second 20 foreground packets are sampled as representative of the flow.
The DAPS parameters were fixed before the experiments from common practice (for example α = 0.3 as a moderate smoothing weight) and were not tuned on the results.
# 4. IMPLEMENTATION
4.1 Tools, platform, versions and hardware
The project is written in Python. All experiments and graphs in this report were produced by the code listed in Table 4.3, with fixed random seeds, so anyone who runs it gets the same numbers.
Table 4.1: Tools, platform and versions

4.2 Simulation or testbed setup
The topology and link values are given in Figure 3.1 and Table 3.1. Table 4.2 lists all parameters of the simulation. Each run lasts 300 s with a time step of 1 s. In every step the program (1) computes the background utilisation of each link, (2) lets the scheme choose a path (DAPS probes every 2 s), (3) computes the delay and loss of every link from the queue model and (4) samples 20 packets of the foreground flow along the chosen path.
Table 4.2: Simulation parameters

4.3 Code structure and explanation of key modules
The code has six files (Table 4.3). The third column shows the suggested division of work between the two team members, so that each member can explain a clear part during the viva.
Table 4.3: Code structure

Link model (netmodel.py)
For a link with service rate μ (packets per second) and arrival rate λ, the offered load is ρ = λ / μ. For the M/M/1/K queue with buffer K [16] the loss probability is P_K = (1 − ρ) ρ^K / (1 − ρ^(K+1)), and the mean number of packets in the system is N = ρ / (1 − ρ) − (K + 1) ρ^(K+1) / (1 − ρ^(K+1)). The mean time in the system is W = N / (λ (1 − P_K)). The queueing delay used in the analyzer is W minus the transmission time of one packet. A finite buffer is used because bursts sometimes push ρ above 1, where the simple M/M/1 formula would give infinite delay. The function is listed in Appendix A.
Background traffic (netmodel.py)
For every run and link, the utilisation is the sum of a base level, a slow sine wave and on/off bursts (Table 4.2). The same seed always gives the same traffic, so baseline and proposed are compared on identical conditions. The degradation event of scenario S4 reduces the capacity of link R1–R2 to 40% between t = 100 s and t = 200 s.
DAPS (routing.py)
The class DAPS keeps the EWMA values D, J and L for the three candidate paths. The method probe sends the probes and updates them, score builds the combined score and decide applies the hysteresis and hold-down rule. The code is in Appendix A and follows the pseudocode of Section 3.3 line by line.
Analyzer (analyzer.py)
Given a path and the state of the links at one moment, the analyzer prints, for every hop, the link utilisation and the propagation, transmission, queueing and total delay, the loss, and the cumulative delay, like a traceroute report. It then names the hop with the largest queueing delay as the bottleneck. Listing 4.1 shows an output for scenario S3 at t = 120 s, where the 2 Mbps flow is assumed to use the path shown.
Listing 4.1: Output of the analyzer (S3, seed 3, t = 120 s)
[S3, seed 3, t = 120 s] Baseline path P1
Path: S -> R1 -> R2 -> D
Hop Link      Util    Prop     Tx   Queue   Total  Loss%     Cum
1   S-R1      0.53    2.00   0.40    0.45    2.95   0.00    2.95
2   R1-R2     1.00    6.00   0.80   26.04   32.94   1.69   35.88
3   R2-D      0.50    2.00   0.40    0.41    2.91   0.00   38.79
End-to-end mean delay = 38.79 ms (all times in ms)
Bottleneck hop: R1-R2 (queueing 26.04 ms = 67% of path delay)

[S3, seed 3, t = 120 s] Alternative path P2
Path: S -> R3 -> R4 -> D
Hop Link      Util    Prop     Tx   Queue   Total  Loss%     Cum
1   S-R3      0.55    2.00   0.40    0.48    2.98   0.00    2.98
2   R3-R4     1.13    8.00   1.00   55.34   64.44  11.51   67.42
3   R4-D      0.63    2.00   0.40    0.68    3.18   0.00   70.60
End-to-end mean delay = 70.60 ms (all times in ms)
Bottleneck hop: R3-R4 (queueing 55.34 ms = 78% of path delay)

In this snapshot the middle link R1–R2 of P1 is fully loaded (utilisation 1.00) and its queueing delay of 26.04 ms is 67% of the path delay. The alternative P2 is even worse (70.60 ms), because its link R3–R4 is overloaded (utilisation 1.13). The analyzer therefore shows both where the problem is and that no candidate is better at this moment.
Simulation loop and metrics (simulate.py)
The function run executes one 300 s run for a given scheme, scenario and seed. It records the delay of every delivered foreground packet and counts lost packets. From these it computes the mean delay, the 95th-percentile delay, jitter and loss ratio, plus the number of path switches and the number of probes sent. The command line (main.py) can run baseline and proposed side by side and lets any parameter be changed, which is used in the live demonstration (Appendix A, Listing A.5).
4.4 Challenges faced and how they were solved
Table 4.4: Challenges faced and how they were solved

# 5. EXPERIMENTAL SETUP AND PERFORMANCE EVALUATION
5.1 Performance metrics and why they were chosen
The following metrics were measured for the 2 Mbps foreground flow. Delay, loss and delay variation follow the IPPM definitions [5]–[7].
Mean end-to-end delay (ms). The average delay of all delivered packets. It shows the overall speed of the path and is the main metric.
95th-percentile delay (ms). 95% of packets are faster than this value. It shows the bad moments that the mean hides; real-time applications suffer from these.
Jitter (ms). The mean absolute difference between the delays of two consecutive delivered packets [7]. Voice and video need small jitter.
Packet loss (%). Lost packets divided by sent packets [6]. Loss forces retransmission or spoils real-time media.
Path switches per run and probe overhead. These measure the cost of the proposed scheme: unstable paths and extra traffic.
5.2 Scenarios and parameter values
Four scenarios were used (Table 5.1). The first three change only the load level and match the scenario names of the course template. The fourth adds a sudden capacity loss on the baseline's own path. Every scenario was run 30 times for each scheme (seeds 1 to 30). For each metric the mean and the sample standard deviation (SD) over the 30 runs are reported. Improvement (%) is (baseline − proposed) ÷ baseline × 100, so a positive value means the proposed scheme is better. A paired t-test on the 30 pairs and the 95% confidence interval of the difference are given in Appendix B.
Table 5.1: Scenarios and run settings

5.3 Results: tables and graphs, baseline vs proposed
Table 5.2 gives the results in the format required by the course template. Figure 5.1 shows the same data as bar charts, with the standard deviation as error bars.
Table 5.2: Results: baseline vs proposed (mean ± SD of 30 runs; delay and jitter in ms, loss in %)
In S1 the loss is zero for both schemes, so no percentage can be calculated.

Figure 5.1: Baseline vs proposed in the four scenarios (error bars show one SD)
The cost of the proposed scheme is shown in Table 5.3. Probe traffic is very small, but the number of path switches grows with the load.
Table 5.3: Cost of the proposed scheme per 300 s run

Figure 5.2 shows one run (seed 3) over time. In S3 the baseline shows repeated delay peaks of up to 93 ms and spends 34% of the seconds above 40 ms, while DAPS spends 9% of the seconds above 40 ms (vertical lines mark path switches). In S4 the baseline stays on the degraded link R1–R2 during the whole window from 100 s to 200 s, with a mean delay of 135 ms in this run, while DAPS had already left P1 at t = 98 s (because of a burst) and stays at about 18 ms. This single run is only an illustration; the averages over 30 runs are in Table 5.2.

Figure 5.2: Delay over time in one run (seed 3), scenarios S3 and S4
5.4 Analysis and discussion
Trend with load. The benefit of DAPS grows as the load grows: −0.6% in S1, 5.6% in S2 and 16.4% in S3 for mean delay. The reason is the shape of the queueing curve. Queueing delay grows roughly like 1 / (1 − ρ), so a small difference in utilisation between two paths becomes a large difference in delay when both are busy, but is invisible when both are nearly empty. At low load delay is mostly propagation delay, and the static cost already picks the path with the smallest propagation delay (P1, 10 ms). In S1 DAPS is even slightly worse, 13.22 ms against 13.14 ms. The difference is tiny (0.08 ms) but statistically visible because the runs vary little. DAPS switches about 3.0 times per run in S1, probably because noise in four probes sometimes exceeds the 10% margin, and the alternative paths have longer propagation delay.
Tail, jitter and loss gain more than the mean. In S3 the 95th-percentile delay falls by 37.2%, jitter by 44.1% and loss by 76.7%, compared with 16.4% for the mean. The harm of a static path is concentrated in the burst periods, and these are exactly the moments that DAPS avoids. DAPS also makes results more predictable: the SD of mean delay in S3 is 2.41 ms against 5.27 ms for the baseline.
Link degradation. In S4 the baseline cannot notice that R1–R2 lost 60% of its capacity, because its cost is static. The analyzer shows what happens on the baseline path at t = 150 s (Appendix B, Listing B.2): R1–R2 has utilisation 1.73, a queueing delay of 123.27 ms (90% of the path delay) and 42% loss, while P2 at the same moment has only 15.73 ms. DAPS reduces mean delay by 61.4% (44.4 ms to 17.1 ms) and loss from 13.69% to 0.20%.
Which parts of DAPS matter? (ablation). Table 5.4 removes one part at a time in S3 (30 runs each, paired with the full DAPS). The main gain comes from probing and adapting, not from the extra features. Smoothing (α = 1 means no smoothing) does not change delay significantly (p = 0.234) but it cuts path switches from 39.9 to 25.8. Without hysteresis and hold-down the scheme switches 72.0 times per run, and its delay is 22.19 ms, about 3.6% lower than the full scheme. In other words, the stability features trade a little delay for far fewer path changes, which matters in a real network because every change can reorder packets. The jitter and loss terms of the score did not help here: a delay-only score gives slightly lower delay (22.59 ms) and fewer switches. A likely reason is that in an M/M/1/K queue delay, jitter and loss all rise with the same utilisation, so they carry the same information. In a real network with, for example, wireless loss, the extra terms could matter more; this was not tested.
Table 5.4: Ablation in scenario S3 (mean of 30 runs; p-value is a paired t-test on delay against full DAPS)

Sensitivity to parameters. Figure 5.3 shows how the improvement in S3 depends on three settings (all other settings at their default). (a) The probe interval matters most: the gain is 19.4% at 1 s, 16.4% at 2 s, 6.5% at 5 s, and becomes negative (−2.5% and −5.2%) at 10 s and 20 s, because the information is older than the bursts it should catch. A faster probe interval gains more but doubles the probe traffic (1 s probing costs 0.31% of the flow's bytes) and raises switches to 51.1 per run. (b) The smoothing weight α has little effect on delay (14.1% to 16.4%) but a larger α produces more switches. (c) A larger hysteresis h gave slightly better results in this model (17.6% at h = 0.30 with only 12.9 switches). We kept h = 0.10 because it was chosen before the experiments; choosing h from these results would risk over-fitting to this topology.

Figure 5.3: Sensitivity of the delay improvement in S3 (bars of 30 runs per point)
Effect of burst length. When the mean burst length is changed from 2 s to 50 s (Appendix B, Table B.3), the improvement of DAPS rises from 6.6% to 20.6%. DAPS helps most when congestion lasts much longer than the probe interval and helps least when it is as short as the probe interval.
5.5 Critical evaluation: strengths, weaknesses, failure conditions
Strengths
Large gains where static routing is weakest: 16.4% lower mean delay and 76.7% lower loss at high load, and 61.4% lower delay after a link degradation, with a small standard deviation.
Very small probe overhead (0.15% of the flow's bytes at the default 2 s interval) and no change to routers.
The analyzer explains the result: the bottleneck hop and the share of queueing in the path delay are visible for every path.
Results are repeatable (fixed seeds), paired, and supported by a t-test, an ablation study and a sensitivity study.
Weaknesses
No benefit at low load, and a tiny loss (−0.6% in S1) from needless switches.
About 26 path switches in 300 s at high load; the effect of reordering on TCP is not modelled.
The baseline is deliberately simple. A tuned OSPF with equal-cost multipath or optimised weights [11] would narrow the gap, and a baseline that reacts to link failure would do better in S4 if the link went fully down. The gains are therefore upper estimates for this model.
Background traffic on each link is independent, so an uncongested alternative usually exists. Real networks may have correlated congestion.
The jitter and loss terms of the score did not show a benefit in this model.
Conditions where the proposed scheme fails
Figure 5.4 and Table 5.5 show two clear failure conditions that we found by testing, and Table 5.5 also lists conditions that follow from the design but were not tested.

Figure 5.4: Failure analysis: (a) probe interval against burst length; (b) flow size
Table 5.5: Conditions in which DAPS performs worse than or equal to the baseline


## 5.6 Real-World Internet Telemetry Benchmarking Results
In addition to the 30-seed paired simulation runs, live telemetry benchmarks were collected across 6 major public Internet edge endpoints:
1. **Google Search & CDN (142.251.126.100 / AS15169 Google LLC)**: 11 hops, Avg RTT = 26.0 ms, Jitter = 2.0 ms. Primary bottleneck detected at intermediate hop 3 (Reliance Jio Gujarat Edge Gateway) with a +95.7 ms delta spike.
2. **Cloudflare Anycast DNS (1.1.1.1 / AS13335 Cloudflare, Inc.)**: 7 hops, Avg RTT = 1.3 ms, Jitter = 1.0 ms. Lowest latency edge with zero dropped probes.
3. **Cloudflare Web Edge (104.16.132.229 / AS13335)**: 8 hops, Avg RTT = 9.4 ms, Jitter = 3.0 ms. Peering detected at Chennai IXP.
4. **Google Public DNS (8.8.8.8 / AS15169 Google LLC)**: 9 hops, Avg RTT = 25.2 ms, Jitter = 2.0 ms.
5. **Microsoft Azure Edge (20.112.52.29 / AS8075 Microsoft Corp)**: 14 hops, Avg RTT = 44.5 ms, Jitter = 8.0 ms. Peering through Mumbai Carrier Exchange.
6. **GitHub Fastly Anycast (20.207.73.82 / AS8075 Microsoft Corp)**: 13 hops, Avg RTT = 41.2 ms, Jitter = 7.0 ms. Trans-continental optical subsea path.

This live data demonstrates the direct applicability of our simulation concepts: router queue backlogs physically manifest as empirical Jitter ($|\Delta RTT|$), and physical IXP routing mirrors DAPS's dynamic avoidance of congested transit paths.

# 6. CONCLUSION AND FUTURE WORK
6.1 Summary of work and key findings
The project built a Network Path and Delay Analyzer and a probe-based adaptive path selection scheme (DAPS), and compared it with an OSPF-style static baseline in a simulated seven-node network. The main findings, each from 30 paired runs, are:
High load (S3): mean delay 27.51 ms → 23.01 ms (16.4% lower); 95th-percentile delay 37.2% lower; jitter 44.1% lower; packet loss 2.57% → 0.60% (76.7% lower).
Link degradation (S4): mean delay 44.4 ms → 17.1 ms (61.4% lower) and loss 13.69% → 0.20%.
Medium load (S2): mean delay 5.6% lower, jitter 37.7% lower. Low load (S1): no benefit; mean delay −0.6% (0.08 ms worse).
Cost: 0.15% extra bytes for probes, and 25.8 path switches per 300 s at high load.
What matters: probing and adapting give the gain; smoothing, hysteresis and hold-down mainly cut path switches (72.0 → 25.8 per run) at a cost of about 3.6% delay; the jitter and loss terms of the score gave no clear benefit.
Where it fails: probe intervals of 10 s or more (−2.5% and −5.2%), and a monitored flow of 4 Mbps or more (−4.4% and −25.5%) because the flow congests the path it moves to.
Table 6.1 shows how each objective of Section 1.3 was met.
Table 6.1: Outcome of the project against the objectives

6.2 Limitations
All results come from a simulation with a queueing-model link; real routers, TCP behaviour and packet reordering are not modelled.
Only one monitored flow and one source–destination pair were studied; many hosts using DAPS together were not tested.
The baseline is a simple static OSPF-style scheme; tuned weights or equal-cost multipath were not compared.
Background traffic is independent per link and Poisson-like; real traffic can be self-similar and correlated.
Parameters were not tuned; the sensitivity study shows that better settings exist (for example a larger hysteresis), but choosing them on the same scenarios would over-fit.
The probes of a candidate path do not include the load that the flow itself would add.
6.3 Future enhancements
Port the analyzer and DAPS to a real testbed (for example Mininet with traffic shaping, or ns-3) and use real ping and traceroute measurements and packet captures.
Predict the load that the flow adds to a candidate path before comparing scores, to remove self-induced congestion for large flows.
Add random delays or per-flow decisions so that many hosts do not switch at the same moment.
Adapt the probe interval automatically: probe often when delay is changing and rarely when it is stable.
Test link-down events with a baseline that reconverges, correlated congestion, and real traffic traces.
Model the effect of path changes on TCP throughput and packet reordering.
# 7. REFERENCES
[1]	J. F. Kurose and K. W. Ross, Computer Networking: A Top-Down Approach, 8th ed. Pearson, 2021.
[2]	J. Moy, "OSPF Version 2," RFC 2328, IETF, Apr. 1998.
[3]	E. W. Dijkstra, "A note on two problems in connexion with graphs," Numerische Mathematik, vol. 1, no. 1, pp. 269–271, 1959.
[4]	J. Postel, "Internet Control Message Protocol," RFC 792, IETF, Sep. 1981.
[5]	G. Almes, S. Kalidindi, and M. Zekauskas, "A one-way delay metric for IPPM," RFC 2679, IETF, Sep. 1999.
[6]	G. Almes, S. Kalidindi, and M. Zekauskas, "A one-way packet loss metric for IPPM," RFC 2680, IETF, Sep. 1999.
[7]	C. Demichelis and P. Chimento, "IP packet delay variation metric for IP performance metrics (IPPM)," RFC 3393, IETF, Nov. 2002.
[8]	J. M. McQuillan, I. Richer, and E. C. Rosen, "The new routing algorithm for the ARPANET," IEEE Trans. Commun., vol. 28, no. 5, pp. 711–719, May 1980.
[9]	A. Khanna and J. Zinky, "The revised ARPANET routing metric," in Proc. ACM SIGCOMM, 1989, pp. 45–56.
[10]	R. G. Gallager, "A minimum delay routing algorithm using distributed computation," IEEE Trans. Commun., vol. 25, no. 1, pp. 73–85, Jan. 1977.
[11]	B. Fortz and M. Thorup, "Internet traffic engineering by optimizing OSPF weights," in Proc. IEEE INFOCOM, 2000, pp. 519–528.
[12]	V. Paxson, "End-to-end routing behavior in the Internet," IEEE/ACM Trans. Netw., vol. 5, no. 5, pp. 601–615, Oct. 1997.
[13]	S. Savage et al., "The end-to-end effects of Internet path selection," in Proc. ACM SIGCOMM, 1999, pp. 289–299.
[14]	D. Andersen, H. Balakrishnan, F. Kaashoek, and R. Morris, "Resilient overlay networks," in Proc. ACM SOSP, 2001, pp. 131–145.
[15]	V. Paxson, M. Allman, J. Chu, and M. Sargent, "Computing TCP's retransmission timer," RFC 6298, IETF, Jun. 2011.
[16]	L. Kleinrock, Queueing Systems, Volume 1: Theory. New York, NY, USA: Wiley, 1975.
Appendix A: Important source code or configuration listings
The complete source code, README and result files are supplied with this report (folder pda). The key parts are listed here.
Listing A.1: M/M/1/K link model (netmodel.py)
def mm1k(rho, mu, K=BUFFER_K):
    """Mean sojourn time (s) and loss probability of an M/M/1/K queue.

    rho = offered load, mu = service rate (packets/s). Works for rho > 1 too.
    The point rho = 1 is a removable singularity, so it is nudged away.
    """
    rho = np.clip(np.asarray(rho, dtype=float), 1e-6, 3.0)
    rho = np.where(np.abs(rho - 1.0) < 1e-6, 1.0 + 1e-6, rho)
    rk1 = rho ** (K + 1)
    p_loss = (1 - rho) * rho ** K / (1 - rk1)
    n_avg = rho / (1 - rho) - (K + 1) * rk1 / (1 - rk1)
    lam_eff = rho * mu * (1 - p_loss)
    return n_avg / lam_eff, p_loss

Listing A.2: DAPS class (routing.py)
class DAPS:
    """Delay-Aware Adaptive Path Selection (proposed mechanism).

    Every probe_interval seconds it sends n_probes small probes on each
    candidate path, smooths delay / jitter / loss with an EWMA, builds one score
    per path, and moves traffic only if another path is clearly and
    persistently better (hysteresis + hold-down).
    """

    def __init__(self, g, k=3, alpha=0.3, probe_interval=2, n_probes=4,
                 w_jitter=1.0, w_loss=1000.0, hysteresis=0.10, confirm=2,
                 use_jitter_loss=True):
        self.paths = candidate_paths(g, k)
        self.links = [path_links(g, p) for p in self.paths]
        self.alpha, self.interval, self.n_probes = alpha, probe_interval, n_probes
        self.w_j, self.w_l = w_jitter, w_loss
        self.h, self.confirm = hysteresis, confirm
        self.use_jl = use_jitter_loss
        self.cur = 0                       # start on the static best path
        self.D = self.J = self.L = None
        self.pending_target, self.pending = None, 0
        self.switches = 0
        self.probe_packets = 0

    def score(self):
        s = self.D.copy()
        if self.use_jl:
            s += self.w_j * self.J + self.w_l * self.L
        return s

    def probe(self, state, rng):
        n = len(self.paths)
        d, j, l = np.zeros(n), np.zeros(n), np.zeros(n)
        for i, lk in enumerate(self.links):
            x = sample_path(state, lk, self.n_probes, rng, bits=PROBE_BITS)
            ok = x[~np.isnan(x)]
            l[i] = 1.0 - len(ok) / self.n_probes
            d[i] = ok.mean() if len(ok) else 400.0   # all lost: large delay
            j[i] = np.abs(np.diff(ok)).mean() if len(ok) > 1 else 0.0
        self.probe_packets += self.n_probes * len(self.paths)
        if self.D is None:
            self.D, self.J, self.L = d, j, l
        else:
            a = self.alpha
            self.D = a * d + (1 - a) * self.D
            self.J = a * j + (1 - a) * self.J
            self.L = a * l + (1 - a) * self.L

    def decide(self):
        s = self.score()
        best = int(np.argmin(s))
        if best != self.cur and s[best] < (1 - self.h) * s[self.cur]:
            if self.pending_target == best:
                self.pending += 1
            else:
                self.pending_target, self.pending = best, 1
            if self.pending >= self.confirm:
                self.cur = best
                self.switches += 1
                self.pending_target, self.pending = None, 0
        else:
            self.pending_target, self.pending = None, 0
        return self.cur

Listing A.3: Per-hop analyzer (analyzer.py)
def analyze_path(g, path, state):
    """Break the delay of a path into its components, hop by hop."""
    rows, cum = [], 0.0
    for hop, (a, b) in enumerate(zip(path[:-1], path[1:]), start=1):
        i = g[a][b]["idx"]
        total = state["total"][i]
        cum += total
        rows.append(dict(hop=hop, link=link_name(i), to=b, util=float(state["rho"][i]),
                         prop=float(state["prop"][i]), tx=float(state["tx"][i]),
                         queue=float(state["queue"][i]), total=float(total),
                         loss=float(state["loss"][i] * 100), cum=cum))
    worst = max(rows, key=lambda r: r["queue"])
    return rows, worst

Listing A.4: Main loop of one simulation run (simulate.py)
    for t in range(T):
        if sel is not None and t % sel.interval == 0:
            sel.probe(link_state(bg, t, cur_links, fg_rate), rng)
            before = sel.cur
            sel.decide()
            if sel.cur != before:
                switch_t.append(t)
            cur_links = sel.links[sel.cur]
        st = link_state(bg, t, cur_links, fg_rate)
        d = sample_path(st, cur_links, PKTS_PER_STEP, rng)
        sent += len(d); lost += int(np.isnan(d).sum())
        ok = d[~np.isnan(d)]
        all_d.append(ok)
        step_mean.append(ok.mean() if len(ok) else np.nan)
        path_id.append(sel.cur if sel is not None else 0)

Listing A.5: Commands used for the demonstration
python main.py demo --scenario S3 --seed 1
python main.py demo --scenario S3 --seed 1 --probe-interval 10 --hysteresis 0.2
python main.py demo --scenario S3 --fg-rate 4
python main.py analyze --scenario S4 --seed 3 --at 150
python main.py experiments      # all runs, CSV files and figures (1-2 minutes)
Any parameter (probe interval, EWMA weight, hysteresis, hold-down, scenario, flow rate, burst length) can be changed on the command line, which allows baseline and proposed to be compared live with a new parameter value on request.
Appendix B: Additional screenshots, packet captures, raw result tables
The project is a simulation, so no real packet captures exist; packets are generated and measured inside the program. In a real testbed these would be Wireshark or tcpdump captures. The screenshots below are the text outputs of the program.
Listing B.1: Live comparison (demo) with default and with slow probing
Scenario S3, seed 1, proposed parameters: {'alpha': 0.3, 'probe_interval': 2, 'hysteresis': 0.1, 'confirm': 2}
Metric                    Baseline    Proposed   Improvement
Mean delay (ms)              26.61       20.70         22.2%
95th pct delay (ms)          79.24       36.08         54.5%
Jitter (ms)                  12.87        5.76         55.3%
Packet loss (%)               3.10        0.25         91.9%
Path switches                    0          21
Probe packets sent               0        1800

Scenario S3, seed 1, proposed parameters: {'alpha': 0.3, 'probe_interval': 10, 'hysteresis': 0.1, 'confirm': 2}
Metric                    Baseline    Proposed   Improvement
Mean delay (ms)              26.61       29.90        -12.4%
95th pct delay (ms)          79.24       78.28          1.2%
Jitter (ms)                  12.87       13.15         -2.2%
Packet loss (%)               3.10        2.42         22.0%
Path switches                    0           7
Probe packets sent               0         360

The second run shows the failure condition of Section 5.5: with a 10 s probe interval DAPS is 12.4% worse than the baseline for this seed.
Listing B.2: Analyzer output for all sampled cases
[S3, seed 3, t = 120 s] Baseline path P1
Path: S -> R1 -> R2 -> D
Hop Link      Util    Prop     Tx   Queue   Total  Loss%     Cum
1   S-R1      0.53    2.00   0.40    0.45    2.95   0.00    2.95
2   R1-R2     1.00    6.00   0.80   26.04   32.94   1.69   35.88
3   R2-D      0.50    2.00   0.40    0.41    2.91   0.00   38.79
End-to-end mean delay = 38.79 ms (all times in ms)
Bottleneck hop: R1-R2 (queueing 26.04 ms = 67% of path delay)

[S3, seed 3, t = 120 s] Alternative path P2
Path: S -> R3 -> R4 -> D
Hop Link      Util    Prop     Tx   Queue   Total  Loss%     Cum
1   S-R3      0.55    2.00   0.40    0.48    2.98   0.00    2.98
2   R3-R4     1.13    8.00   1.00   55.34   64.44  11.51   67.42
3   R4-D      0.63    2.00   0.40    0.68    3.18   0.00   70.60
End-to-end mean delay = 70.60 ms (all times in ms)
Bottleneck hop: R3-R4 (queueing 55.34 ms = 78% of path delay)

[S4, seed 3, t = 150 s] Baseline path P1
Path: S -> R1 -> R2 -> D
Hop Link      Util    Prop     Tx   Queue   Total  Loss%     Cum
1   S-R1      0.30    2.00   0.40    0.17    2.67   0.00    2.67
2   R1-R2     1.73    6.00   2.00  123.27  131.37  42.30  134.05
3   R2-D      0.39    2.00   0.40    0.25    2.75   0.00  136.80
End-to-end mean delay = 136.80 ms (all times in ms)
Bottleneck hop: R1-R2 (queueing 123.27 ms = 90% of path delay)

[S4, seed 3, t = 150 s] Alternative path P2
Path: S -> R3 -> R4 -> D
Hop Link      Util    Prop     Tx   Queue   Total  Loss%     Cum
1   S-R3      0.34    2.00   0.40    0.21    2.71   0.00    2.71
2   R3-R4     0.54    8.00   1.00    1.18   10.28   0.00   12.99
3   R4-D      0.38    2.00   0.40    0.24    2.74   0.00   15.73
End-to-end mean delay = 15.73 ms (all times in ms)
Bottleneck hop: R3-R4 (queueing 1.18 ms = 8% of path delay)

Table B.1: Full result statistics (30 paired runs): paired t-test p-value and 95% confidence interval of the difference (baseline − proposed)

Table B.2: Ablation in scenario S2 (mean of 30 runs)

Table B.3: Sensitivity study in scenario S3 (30 runs per value; improvement in mean delay against the baseline under the same traffic)

Table B.4: Effect of foreground flow rate in scenario S3

Table B.5: Delay improvement (%) in S3 for each probe interval and mean burst length