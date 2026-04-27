# Deploy CRM-SG (React + Express + MySQL)

Panduan ini untuk Ubuntu VPS dengan Nginx + PM2.

## 0) Install Node.js + npm (wajib, sekali saja per server)

Disarankan pakai Node LTS terbaru dari NodeSource (sudah include `npm`):

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## 1) Upload project ke server

```bash
git clone <repo-url> /var/www/crm-sg
cd /var/www/crm-sg
npm ci
```

## 2) Build frontend

```bash
npm run build
```

Hasil build frontend ada di `client/dist`.

## 3) Setup MySQL (wajib)

Install MySQL server:

```bash
sudo apt update
sudo apt install -y mysql-server
sudo systemctl enable mysql
sudo systemctl start mysql
```

Buat user database khusus aplikasi:

```bash
sudo mysql -e "CREATE DATABASE IF NOT EXISTS ecard_platform_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'crm_sg_user'@'127.0.0.1' IDENTIFIED BY 'GantiPasswordKuat!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON ecard_platform_db.* TO 'crm_sg_user'@'127.0.0.1'; FLUSH PRIVILEGES;"
```

Opsional (kalau mau pakai data lama), import SQL:

```bash
mysql -u crm_sg_user -p ecard_platform_db < /srv/CRM-SG/db/ecard_platform_db\ new.sql
```

## 4) Setup environment backend

Buat `server/.env`:

```env
NODE_ENV=production
PORT=5050
CLIENT_URL=https://crm.yourdomain.com
JWT_SECRET=ganti-dengan-secret-panjang
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=crm_sg_user
MYSQL_PASSWORD=GantiPasswordKuat!
MYSQL_DATABASE=ecard_platform_db
DEMO_USER_PASSWORD=matikan-atau-ganti-password-demo
```

Catatan:
- Backend akan auto create table, migrate kolom, dan seed data demo saat start pertama.
- Jika `users` sudah berisi data (misal setelah import SQL), seed demo tidak dijalankan ulang.

## 5) Jalankan backend pakai PM2

```bash
npm i -g pm2
pm2 start server/ecosystem.config.cjs
pm2 save
pm2 startup
```

## 6) Setup Nginx

Copy template `deploy/nginx.crm-sg.conf` ke `/etc/nginx/sites-available/crm-sg`.

Sesuaikan:
- `server_name` jadi domain kamu
- `root` pastikan ke `/var/www/crm-sg/client/dist`

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/crm-sg /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 7) SSL (Let's Encrypt)

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d crm.yourdomain.com
```

## 8) Checklist quick test

```bash
curl http://127.0.0.1:5050/api/health
pm2 logs crm-sg-api --lines 100
```

Buka `https://crm.yourdomain.com`, lalu test login.

## 9) Update setelah ada perubahan code

```bash
cd /var/www/crm-sg
git pull
npm ci
npm run build
pm2 restart crm-sg-api
```
