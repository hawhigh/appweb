#!/bin/bash
set -e

APP_DIR="/var/www/agency-os"

echo "🚀 Starting Remote Setup..."

# Determine Upload Directory (Handle sudo)
if [ -n "$SUDO_USER" ]; then
    UPLOAD_DIR="/home/$SUDO_USER/upload"
else
    UPLOAD_DIR="$HOME/upload"
fi
echo "📍 Using Source Directory: $UPLOAD_DIR"

# 1. Update & Install Dependencies
echo "📦 Installing System Dependencies (Node.js, Nginx, git)..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git build-essential

# 2. Setup Directory
echo "📂 Setting up App Directory $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# 3. Move Artifacts (Assumes they were SCP'd to ~/upload)
echo "🚚 Moving files from $UPLOAD_DIR..."
if [ -d "$UPLOAD_DIR/dist" ]; then
    rm -rf $APP_DIR/dist
    mv $UPLOAD_DIR/dist $APP_DIR/dist
fi
if [ -d "$UPLOAD_DIR/src" ]; then
    rm -rf $APP_DIR/src
    mv $UPLOAD_DIR/src $APP_DIR/src
fi
cp $UPLOAD_DIR/package.json $APP_DIR/
cp $UPLOAD_DIR/tsconfig.json $APP_DIR/
cp $UPLOAD_DIR/.env $APP_DIR/ || echo "⚠️ No .env found, skipping..."

# 4. Install App Dependencies
echo "📥 Installing App Dependencies..."
cd $APP_DIR
npm install --production --no-audit

# 5. Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/agency-os > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    root $APP_DIR/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/agency-os /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# 6. Setup Systemd Service for Bot
echo "🤖 Configuring Telegram Bot Service..."
sudo tee /etc/systemd/system/agency-bot.service > /dev/null <<EOF
[Unit]
Description=Agency OS Telegram Bot
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/npm run telegram-bot
Restart=always
# Environment="TELEGRAM_BOT_TOKEN=..." # Loaded from .env file by app
EnvironmentFile=$APP_DIR/.env

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable agency-bot
sudo systemctl restart agency-bot

echo "✅ Deployment Complete! Visit your IP to see the app."
echo "✅ Bot service status:"
sudo systemctl status agency-bot --no-pager
