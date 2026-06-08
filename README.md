# Malazone.com

**Zero-Commission Digital Marketplace for High-Value Assets in Hawassa, Ethiopia**

Founded & Owned by **Luwa Tesemma Kakawo** — CEO/Founder

---

## 📋 Overview

Malazone is a revolutionary marketplace that **bypasses informal middlemen (Delalas)** and enables transparent digital commerce for:

- **Property** (መሬትና ቤት) — Land, houses, apartments, commercial spaces
- **Motors & EV** (መኪናና ኤሌክትሪክ) — Vehicles, EVs, motorcycles
- **Stay & Halls** (አዳራሽና ጌስት ሃውስ) — Hotels, guesthouses, event halls
- **Ceremony & Clothes** (ልብስና ዲጄ ኪራይ) — Wedding attire, DJ equipment, catering
- **Heavy Machinery** (ከባድ ማሽነሪዎች) — Bulldozers, cranes, excavators

Based in **Hawassa, Sidama Regional State, Ethiopia** (Tabor, Lakefront, Piassa, and nearby localities).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js 18+ with TypeScript
- **Styling**: Tailwind CSS + Lucide React icons
- **Animations**: Framer Motion (lightweight micro-interactions)
- **State**: React Context (Language, Cart, Auth)
- **Build**: Vite (instant HMR on 3G/4G networks)

### Backend
- **Runtime**: Node.js 18+
- **Server**: Express.js 4.18+
- **Image Processing**: Sharp (auto-conversion to WebP, 1200px max width)
- **File Upload**: Multer (memory storage → disk)
- **Database**: MySQL 8 (InnoDB, UTF8MB4, full-text search)
- **Connection**: mysql2/promise (connection pooling)

### DevOps
- **Containerization**: Docker + Docker Compose
- **Deployment**: AWS EC2 / Digital Ocean / Linode
- **SSL**: Let's Encrypt (free HTTPS)
- **CDN**: CloudFront (static assets) or self-hosted

### Performance
- **Compression**: gzip + Brotli
- **Caching**: HTTP cache headers (30 days for images)
- **Rate Limiting**: express-rate-limit (200 requests/15min per IP)
- **Load Time**: <2s on 4G networks (3G fallback)

---

## 📁 Project Structure

```
malazone/
├── src/
│   ├── contexts/
│   │   └── LanguageContext.tsx          ✓ Bilingual state (Amharic/English)
│   ├── components/
│   │   ├── Hero.tsx                     ✓ Full-screen carousel + search
│   │   ├── ListingsGrid.tsx             ✓ Responsive listing cards
│   │   ├── MalaAgentsBanner.tsx         ✓ Agent recruitment UI
│   │   └── Footer.tsx                   ✓ Legal disclaimer + links
│   ├── App.tsx                          (entry point)
│   ├── index.css                        (Tailwind + globals)
│   └── main.tsx                         (React DOM render)
├── routes/
│   ├── listings.js                      ✓ Listings API + image pipeline
│   └── agents.js                        ✓ Agent registration + earnings
├── database/
│   ├── schema.sql                       ✓ MySQL schema (7 tables + views)
│   └── db.js                            ✓ Connection pool & utilities
├── public/
│   ├── uploads/                         (image storage)
│   └── index.html                       (HTML shell)
├── server.js                            ✓ Express server + middleware
├── package.json                         ✓ Dependencies + scripts
├── .env.example                         ✓ Environment template
├── tsconfig.json                        (TypeScript config)
├── tailwind.config.js                   (Tailwind CSS)
└── vite.config.ts                       (Vite bundler config)
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([download](https://nodejs.org/))
- **MySQL** 8+ ([download](https://mysql.com) or use Docker)
- **npm** 9+ (comes with Node)

### 1. Clone & Setup

```bash
git clone https://github.com/malazone/malazone-full.git
cd malazone
npm install
```

### 2. Configure Database

```bash
# Create MySQL database
mysql -u root -p
> CREATE DATABASE malazone CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
> EXIT;

# Import schema
mysql -u root -p malazone < database/schema.sql
```

### 3. Environment Variables

```bash
cp .env.example .env
# Edit .env with your MySQL credentials:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=malazone
```

### 4. Start Development Server

```bash
# Terminal 1: Backend API
npm run dev

# Terminal 2: Frontend (in another terminal)
cd client
npm run dev
```

- API: `http://localhost:4000/api`
- Frontend: `http://localhost:5173`

---

## 🌍 Language System

### Amharic (Primary) + English (Secondary)

The app features **true localization**, not machine translation:

```typescript
// All text is handled via LanguageContext
const { t, toggleLanguage } = useLanguage();

// Amharic labels:
// zoneProperty: "መሬትና ቤት" (Land & House)
// intentionBuy: "ለመግዛት" (To Buy)
// listingVerifiedBadge: "ካርታ ተረጋግጧል" (Carta Verified)

// English labels:
// zoneProperty: "Property"
// intentionBuy: "To Buy"
// listingVerifiedBadge: "Carta Verified"
```

Instant language switching **without page reload**.

---

## 📊 Database Schema

### Core Tables
1. **users** — Sellers, agents, buyers (indexed by phone)
2. **listings** — Property, motors, stay, ceremony, machinery (indexed by category + location)
3. **agents** — Mala-Agents gig workers (Hawassa youth)
4. **agent_earnings** — Commission ledger for TeleBirr payouts
5. **favorites** — User wishlist
6. **inquiries** — Buyer questions/messages
7. **audit_logs** — Compliance & debugging

### Key Features
- **UTF8MB4**: Full Amharic character support
- **Composite indexes**: Optimized for search queries (category + location + active)
- **Soft-delete**: `is_active` flag for GDPR compliance
- **Decimal(15,2)**: Precise financial calculations (no float rounding)
- **JSON columns**: Flexible image URLs, amenities arrays
- **Foreign keys**: Referential integrity with cascading deletes

---

## 📸 Image Upload Pipeline

### How It Works
1. **Frontend**: User selects JPG/PNG files (up to 8 × 5MB)
2. **Multer**: Receives files in memory (not disk)
3. **Sharp**: Processes each image:
   - Resizes to max 1200px width (maintains aspect ratio)
   - Converts to WebP at 80% quality (effort=4 for speed)
4. **Disk**: Saves compressed WebP to `/public/uploads/`
5. **Response**: Returns array of `/uploads/mala_uuid.webp` URLs

**Benefit**: Reduces bandwidth by 60–70% on 3G/4G networks.

```javascript
// Sharp pipeline in routes/listings.js
const processImage = async (buffer) => {
  const filename = `mala_${uuidv4()}.webp`;
  await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toFile(path.join(UPLOAD_DIR, filename));
  return `/uploads/${filename}`;
};
```

---

## 🤝 Direct Contact — Zero Commission

Every listing card displays:
- **☎️ Call Button** → Dials seller directly (`href="tel:..."`)
- **💬 WhatsApp Button** → Opens chat (`href="https://wa.me/..."`)

**No middlemen. No commission. Full price to the seller.**

```typescript
// In ListingsCard component
<a href={`tel:${listing.phone}`} className="...">
  Call
</a>
<a href={`https://wa.me/${listing.whatsapp}?text=${message}`} target="_blank">
  WhatsApp
</a>
```

---

## 🎯 Mala-Agents Program

### For Hawassa Youth & University Students

- **Earnings**: Up to 1,000 ETB/day for listing submissions
- **Registration**: Free, no upfront costs
- **Payment**: Direct TeleBirr transfer
- **How it works**:
  1. Register with full name + phone
  2. Submit property/vehicle details to Malazone
  3. When listing sells/rents, earn commission → TeleBirr

**API Endpoint**:
```bash
POST /api/agents/register
{
  "full_name": "Yonas Kebede",
  "phone": "0911000001",
  "sub_city": "Tabor Sub-City"
}
```

---

## ⚠️ Legal Disclaimer

**CRITICAL FOR USERS**:

> Before making any digital payment, **independently verify all land registry maps (Carta)** at the Hawassa Municipal Administration Bureau.
>
> Malazone Technologies PLC accepts **no legal liability** for any transactions involving unverified property titles.

This disclaimer appears prominently in the **Footer** (in Amharic & English).

---

## 🔐 Security

### Authentication
- Phone number as primary identifier (OAuth not required)
- Simple verification token flow (email/SMS)
- CORS policy whitelisted origins only

### Data Protection
- TLS 1.2+ for all HTTPS
- Password hashing (bcrypt, future)
- SQL injection prevention (prepared statements)
- Rate limiting (200 requests/15min per IP)
- HELMET security headers

### Compliance
- GDPR-compliant soft-delete
- Audit logs for all transactions
- User data minimal (name, phone, location)

---

## 📈 Performance Targets

### Desktop (Ethernet)
- Page load: <1s
- TTI (Time to Interactive): <1.5s

### Mobile (4G)
- Page load: <2s
- TTI: <2.5s

### Mobile (3G)
- Page load: <3s
- TTI: <4s

**Achieved through**:
- Gzip compression (text, JSON)
- WebP images (60–70% smaller)
- Code splitting + lazy loading
- Minimized CSS/JS bundles
- HTTP/2 push for critical assets

---

## 🔧 API Endpoints

### Listings
```
GET    /api/listings                      (fetch all + filter)
GET    /api/listings/:id                  (single listing detail)
POST   /api/listings                      (create with image upload)
DELETE /api/listings/:id                  (soft-delete)
```

**Query parameters**:
```
?category=property
?location_key=hawassa_tabor
?intention=buy|rent|hourly
?sort=newest|price_asc|price_desc|popular
?limit=20&offset=0
```

### Agents
```
POST   /api/agents/register               (agent sign-up)
GET    /api/agents/:phone                 (profile + earnings)
POST   /api/agents/earnings/record        (commission tracking)
GET    /api/agents/leaderboard/top        (top earners)
GET    /api/agents/stats/program          (program overview)
```

### Health
```
GET    /api/health                        (server status)
```

---

## 🐳 Docker Deployment

### Docker Compose (local development)

```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: malazone
      MYSQL_ROOT_PASSWORD: root
    ports:
      - "3306:3306"
    volumes:
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  api:
    build: .
    environment:
      DB_HOST: db
      DB_USER: root
      DB_PASSWORD: root
      DB_NAME: malazone
    ports:
      - "4000:4000"
    depends_on:
      - db
```

Run:
```bash
docker-compose up --build
```

---

## 📦 Production Deployment

### AWS EC2 Checklist

```bash
# 1. SSH into instance
ssh -i key.pem ec2-user@your-instance-ip

# 2. Install Node + MySQL client
sudo yum install -y nodejs npm mysql

# 3. Clone repo + install deps
git clone https://github.com/malazone/malazone-full.git
cd malazone && npm ci --production

# 4. Copy production .env
cp .env.example .env
# Edit .env with RDS endpoint, S3 bucket, etc.

# 5. Start with PM2 (keeps running)
npm install -g pm2
pm2 start server.js --name "malazone-api"
pm2 startup
pm2 save

# 6. Nginx reverse proxy + SSL
sudo yum install -y nginx certbot python3-certbot-nginx
# Configure /etc/nginx/sites-enabled/malazone.conf
sudo systemctl restart nginx
sudo certbot --nginx -d malazone.com
```

### Environment Variables for Production
```bash
NODE_ENV=production
DB_HOST=rds-instance-endpoint.amazonaws.com
DB_USER=malazone_prod
DB_PASSWORD=strong_random_password_min_32_chars
CORS_ORIGINS=https://malazone.com,https://www.malazone.com
UPLOAD_DIR=/var/malazone/uploads
```

---

## 📋 Checklist: Before Launch

- [ ] Database schema imported (`mysql < database/schema.sql`)
- [ ] Environment variables configured (`.env` file)
- [ ] Images test-uploaded (Sharp pipeline verified)
- [ ] Bilingual UI tested (Amharic ↔ English toggle works)
- [ ] Agent registration tested (TeleBirr integration ready)
- [ ] Legal disclaimer visible in Footer
- [ ] Phone validation regex working (09XXXXXXXX and +2519XXXXXXXX)
- [ ] Rate limiting enabled (200 req/15min per IP)
- [ ] HTTPS enabled (Let's Encrypt SSL)
- [ ] Database backups automated
- [ ] Logs aggregated (Sentry or CloudWatch)
- [ ] CDN configured for `/uploads` folder

---

## 🤝 Contributing

Malazone welcomes contributions from the Hawassa tech community and Ethiopian diaspora engineers.

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📞 Support & Contact

**Hawassa Office**
- Address: Hawassa, Sidama Regional State, Ethiopia
- Phone: +251 911 XXX XXXX
- Email: support@malazone.com

**CEO**
- Name: Luwa Tesemma Kakawo
- Title: Founder & CEO

---

## 📄 License

**Proprietary Software © 2026 Malazone Technologies PLC**

All rights reserved. Unauthorized copying, distribution, or modification is prohibited.

For licensing inquiries: legal@malazone.com

---

## 🙏 Acknowledgments

- **Hawassa Community** for inspiring this zero-commission marketplace
- **Sidama Regional State** for supporting local digital commerce
- **Ethiopian Developers** who built tools and infrastructure

---

**Built with ❤️ in Hawassa, Ethiopia**

*"ምንም ደላላ የለም — ቀጥታ ግንኙነት"* (No Middlemen — Direct Connection)
