# Развёртывание «След» на VPS

> **Важно:** бесплатный хостинг Reg.ru — это PHP-хостинг. Для Node.js приложения нужен **VPS** (виртуальный сервер).
> Варианты: Reg.ru VPS (~300 ₽/мес), Timeweb Cloud, Selectel, Aéza.

## Требования к серверу

- Ubuntu 22.04+ (или Debian 12)
- 1 vCPU, 1 GB RAM минимум (рекомендуется 2 GB)
- 20 GB SSD
- SSH-доступ (root или sudo-пользователь)

---

## 1. Подключение к серверу

```bash
ssh root@ВАШ_IP
```

## 2. Обновление системы

```bash
apt update && apt upgrade -y
```

## 3. Установка Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v  # v20.x.x
```

## 4. Установка PostgreSQL 15 + PostGIS

```bash
apt install -y postgresql postgresql-contrib postgis postgresql-15-postgis-3

sudo -u postgres createuser --interactive  # имя: sled, суперюзер: нет
sudo -u postgres createdb sled -O sled
sudo -u postgres psql -c "ALTER USER sled WITH PASSWORD 'ВАШ_ПАРОЛЬ';"
sudo -u postgres psql -d sled -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

## 5. Установка Redis

```bash
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server
```

## 6. Клонирование проекта

```bash
cd /opt
git clone https://github.com/YOUR_USERNAME/sled.git
cd sled
```

Или скопируйте файлы через `scp`:

```bash
scp -r ./sled root@ВАШ_IP:/opt/sled
```

## 7. Настройка окружения

### Backend

```bash
cd /opt/sled/backend
cp .env.example .env
nano .env
```

Заполните:

```env
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sled
DB_USER=sled
DB_PASS=ВАШ_ПАРОЛЬ
REDIS_HOST=localhost
REDIS_PORT=6379
VK_APP_ID=54534326
VK_APP_SECRET=ваш_защищённый_ключ
VK_SERVICE_KEY=ваш_сервисный_ключ
VK_CALLBACK_URL=https://xn----ctbhdsns0ae.xn--p1ai/api/v1/auth/vk/callback
VK_AUTH_MODE=vkid
JWT_SECRET=сгенерируйте_длинный_случайный_ключ_64_символа
JWT_REFRESH_SECRET=сгенерируйте_другой_длинный_случайный_ключ
FRONTEND_URL=https://xn----ctbhdsns0ae.xn--p1ai
```

Генерация случайного ключа:

```bash
openssl rand -hex 32
```

### Frontend

```bash
cd /opt/sled/frontend
cp .env.local.example .env.local
nano .env.local
```

```env
NEXT_PUBLIC_VK_MAPS_API_KEY=ваш_ключ_vk_maps
NEXT_PUBLIC_API_URL=https://xn----ctbhdsns0ae.xn--p1ai/api/v1
NEXT_PUBLIC_WS_URL=https://xn----ctbhdsns0ae.xn--p1ai
NEXT_PUBLIC_VK_APP_ID=54534326
NEXT_PUBLIC_VK_REDIRECT_URL=https://xn----ctbhdsns0ae.xn--p1ai/api/v1/auth/vk/callback
```

## 8. Миграции базы данных

```bash
cd /opt/sled/backend
sudo -u postgres psql -d sled -f src/database/migrations/001_init.sql
sudo -u postgres psql -d sled -f src/database/migrations/002_postgis.sql
sudo -u postgres psql -d sled -f src/database/migrations/003_indexes.sql
sudo -u postgres psql -d sled -f src/database/migrations/004_post_reports.sql
sudo -u postgres psql -d sled -f src/database/seeds/regions.sql
```

### Переменные `NEXT_PUBLIC_*` (важно)

В Next.js значения `NEXT_PUBLIC_…` **попадают в бандл при `npm run build`**. Если ключа карт не было в `.env.local` до сборки, на сайте будет ошибка загрузки VK Maps. После смены ключа или URL API нужно снова выполнить `npm run build` и перезапустить PM2.

## 9. Установка зависимостей и сборка

```bash
cd /opt/sled/backend
npm ci
npm run build

cd /opt/sled/frontend
npm ci
npm run build
```

## 10. Установка PM2 (менеджер процессов)

```bash
npm install -g pm2

cd /opt/sled/backend
pm2 start dist/main.js --name sled-api

cd /opt/sled/frontend
pm2 start npm --name sled-web -- start

pm2 save
pm2 startup  # следуйте инструкции в терминале
```

Полезные команды:

```bash
pm2 status          # статус процессов
pm2 logs            # логи
pm2 restart all     # перезапуск
pm2 monit           # мониторинг
```

## 11. Установка и настройка Nginx

```bash
apt install -y nginx
```

Создайте конфиг:

```bash
nano /etc/nginx/sites-available/sled
```

```nginx
server {
    listen 80;
    server_name xn----ctbhdsns0ae.xn--p1ai твой-след.рф;

    # Редирект на HTTPS (после настройки certbot)
    # return 301 https://$host$request_uri;

    location /api/v1/ {
        proxy_pass http://127.0.0.1:3001/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Активируйте:

```bash
ln -s /etc/nginx/sites-available/sled /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

## 12. SSL-сертификат (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d xn----ctbhdsns0ae.xn--p1ai
```

Certbot автоматически:

- Получит сертификат
- Настроит Nginx на HTTPS
- Добавит редирект с HTTP на HTTPS
- Настроит автообновление

## 13. DNS-настройка домена

В панели Reg.ru → Домены → `твой-след.рф` → DNS:


| Тип | Имя | Значение   |
| --- | --- | ---------- |
| A   | @   | ВАШ_IP_VPS |
| A   | www | ВАШ_IP_VPS |


Применение DNS занимает от 15 минут до 24 часов.

## 14. Настройка VK приложения

В настройках VK приложения (id 54534326):

- **Базовый домен**: `xn----ctbhdsns0ae.xn--p1ai`
- **Доверенный Redirect URL**: `https://xn----ctbhdsns0ae.xn--p1ai/api/v1/auth/vk/callback`

Если VK не принимает Punycode, попробуйте:

- `https://твой-след.рф/api/v1/auth/vk/callback`

## 15. Файрвол

```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

## 16. Обновление приложения

```bash
cd /opt/sled
git pull

cd backend && npm ci && npm run build
cd ../frontend && npm ci && npm run build

pm2 restart all
```

---

## Быстрая проверка

1. Откройте `https://твой-след.рф` в браузере
2. Должна появиться страница входа с логотипом «След»
3. Нажмите «Войти через VK» — должна пройти авторизация
4. Перейдите на страницу карты — карта VK Maps в тёмной теме
5. На телефоне: Safari → Поделиться → На экран «Домой» → приложение открывается без браузера

## 17. Панель администратора

Админ-панель доступна по скрытому адресу:

```
https://твой-след.рф/szh-admin
```

Логин и пароль задаются в `backend/.env`:

```env
ADMIN_LOGIN=admin
ADMIN_PASSWORD=SledAdmin2024!
```

**Обязательно смените пароль перед запуском в продакшен!**

Функции админ-панели:

- Dashboard с реальной статистикой из БД
- Управление пользователями (бан/разбан)
- Аналитика (графики за 14 дней)
- Модерация постов
- Обнаружение GPS-спуфинга (подозрительные пользователи)

---

## Решение проблем

- **502 Bad Gateway**: PM2 процессы упали → `pm2 restart all && pm2 logs`
- **VK OAuth ошибка**: проверьте Redirect URL в настройках VK и `VK_CALLBACK_URL` в `.env`
- **База данных**: `sudo -u postgres psql -d sled` → проверьте таблицы
- **SSL не работает**: `certbot renew --dry-run`

