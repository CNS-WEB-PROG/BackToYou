# BackToYou — Campus Lost & Found Platform

**BackToYou** is a full-stack web application designed for campus environments to help students easily report, browse, and recover lost and found items. The platform features an intelligent backend matching engine that automatically detects overlapping reports and logs potential connections, streamlining the recovery process.

## Key Features

* **Intelligent Auto-Matching:** Built-in PHP algorithm checks new listings against existing opposites in the database, pairing relevant lost and found items based on shared titles and categories.
* **Context-Aware Dynamic Forms:** A unified client-side validation engine adjusts reporting rules and input fields dynamically depending on whether an item is reported as "Lost" or "Found".
* **Rich Category Browsing:** Clean grid-based filtering interface complete with custom-colored visual font icons mapped directly to specific asset categories.
* **Client-Side Validation & Safeguards:** Live image preview system built with maximum-size limitations (10MB constraint) protecting server infrastructure from oversized binaries.
* **Pagination & Smooth Viewports:** Content catalog loads paginated fragments (6 items per page) alongside interactive, smooth-scrolling page buttons.

## 📂 Project Architecture & File Directory

The platform uses a modular component architecture separating clean frontend layout templates from core backend operational APIs.

```
backtoyou/
├── index.html                    # Platform landing gateway
│
├── css/
│   └── style.css                 # Global styling layout rules
│
├── js/
│   └── main.js                   # Unified validation, filtering & feed engine
│
├── pages/
│   ├── browse.html               # Paginated system item feed
│   ├── dashboard.html            # User account personal listings management
│   ├── login.html                # Security portal entrance
│   ├── register.html             # Account processing registration form
│   ├── report-found.html         # Item retention discovery form
│   └── report-lost.html          # Item misplacement report form
│
├── api/
│   ├── config.php                # Global database connection initialization
│   ├── items.php                 # Ingestion and feed query logic handlers
│   ├── login.php                 # User authentication session gate
│   ├── register.php              # Account verification execution pipeline
│   └── upload.php                # Binary image processing utility
│
└── uploads/                      # Server file directory for reported item photos

```

## Local Installation & Setup

1. **Clone the Project:** Move the entire `backtoyou` root folder into your local environment's web server directory (e.g., `C:/xampp/htdocs/backtoyou/`).
2. **Start Services:** Open your **XAMPP Control Panel** and turn on both the **Apache** web server and **MySQL** database server modules.
3. **Import Database:** Setup your database tables inside phpMyAdmin (`http://localhost/phpmyadmin`) based on your team's provided SQL schema configuration.
4. **Configure Access:** Open `api/config.php` and update the parameters (`$dbname`, `$username`, `$password`) to match your local runtime variables.
5. **Launch:** Navigate to `http://localhost/backtoyou/index.html` in any web browser to access the portal.
