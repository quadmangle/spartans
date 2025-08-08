# OPS Mobile & Tablet Annex v1.1

This annex extends the OPS Cyber Sec Core Framework to mobile phone and tablet
platforms. It defines the minimum safeguards required to protect OPS services
on these devices and aligns each control with NIST CSF, CISA Cyber Essentials,
and PCI DSS requirements.

## Scope

The controls apply to any mobile or tablet device that accesses OPS data,
performs OPS administration, or processes payment information.

## Controls

- All devices must be enrolled in a managed device inventory.
- Access to OPS services requires multi-factor authentication.
- Data at rest and in transit must be encrypted using industry-standard
  algorithms.
- Applications must be updated within 30 days of a critical patch release.
- Lost or stolen devices must be reported within 24 hours and remotely wiped.

## Control Matrix

| Control | Objective | NIST CSF | CISA | PCI DSS |
| --- | --- | --- | --- | --- |
| Device inventory | Maintain an accurate list of authorized devices | ID.AM-1 | 1.1 | 2.4 |
| Managed configuration | Enforce baseline settings through MDM | PR.IP-1 | 2.3 | 2.2 |
| Encryption | Protect data in transit and at rest | PR.DS-1, PR.PT-4 | 3.4 | 3.4, 4.1 |
| Access control | Require MFA and least privilege | PR.AC-1 | 5.1 | 7.1, 8.3 |
| Vulnerability management | Patch OS and apps within 30 days | PR.MA-1 | 6.3 | 6.2 |
| Continuous monitoring | Detect anomalous device activity | DE.CM-1 | 4.3 | 10.6 |
| Incident response | Remotely wipe and notify stakeholders | RS.RP-1 | 4.1 | 12.10 |
| Recovery | Re-provision devices with hardened baseline | RC.RP-1 | 6.5 | 12.10.5 |

