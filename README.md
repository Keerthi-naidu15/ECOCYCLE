hiiii hellooo......
# EcoCycle™ | Circular Economy Logistics Platform

EcoCycle is a high-performance, full-stack waste management ecosystem designed to bridge the gap between urban households, field logistics agents (Riders), and administrative oversight. The platform leverages geo-spatial tracking, real-time data visualization, and a secure reward system to industrialize the recycling process.

## 🚀 System Architecture

EcoCycle is built on a "Tri-Portal" architecture, ensuring dedicated interfaces for three distinct user roles:

### 1. The Recycler Portal (User Dashboard)
*   **Precision Scheduling:** One-tap collection requests with GPS-validated coordinates.
*   **Immersive Live Tracking:** A state-of-the-art Leaflet.js map interface featuring floating telemetry cards, status steppers, and smooth-motion rider tracking.
*   **Eco-Wallet:** Real-time earnings tracking with transparent valuation based on material-specific market rates.
*   **Impact Ledger:** A comprehensive historical log of all contributions to the circular economy.

### 2. The Field Ops Portal (Rider Dashboard)
*   **Tactical Route Mapping:** Integrated Leaflet maps showing all available and assigned deployment points.
*   **Google Maps Integration:** Deep-linking for turn-by-turn navigation directly to the recycler's verified location.
*   **On-Site Verification:** A secure verification workflow requiring visual evidence (camera integration) and digital weight logging.
*   **Dynamic Valuation:** Live earnings estimation based on material type and verified weight per KG.

### 3. The Command Center (Admin Dashboard)
*   **Logistics Analytics:** High-level data visualization using Recharts to monitor material volumes and network growth.
*   **Cashfree Payout Simulator:** A sophisticated settlement portal that facilitates simulated UPI payments via a realistic gateway redirect flow.
*   **Chain of Custody:** Real-time monitoring of all field activities to ensure system integrity.

## 🛠 Tech Stack

*   **Frontend:** React 19 (ES6 Modules)
*   **Styling:** Tailwind CSS (Custom "Sage & Dark Teal" branding)
*   **Mapping:** Leaflet.js (Geo-spatial visualization using CartoDB tiles)
*   **Icons:** Lucide-React
*   **Charts:** Recharts
*   **Storage:** Persistent LocalStorage-based Mock Backend (Production-simulated data flow)

## 🛡 Security & Design Principles

*   **Geo-Verification:** All collection requests are tied to precise browser-level geolocation.
*   **Responsive UI:** Optimized for both mobile-first field operations and desktop-grade administration.
*   **Atomic Design:** Modular component structure for rapid scaling and maintenance.
*   **Graceful Degradation:** The mapping system handles missing GPS data with sensible fallbacks and user notifications.

---
**EcoCycle™** — *Precision logistics for a zero-waste future.*
