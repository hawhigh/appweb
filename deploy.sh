#!/bin/bash
set -e

# Configuration
VM_USER="renmac"
VM_IP="34.58.43.104"
REMOTE_Script_PATH="scripts/remote-setup.sh"

echo "🔥 Deploying Agency OS to $VM_IP..."

# 1. Build
echo "🏗️ Building Frontend..."
npm run build

# 2. Prepare Upload
echo "📦 Preparing Upload..."
rm -rf deploy_artifact
mkdir -p deploy_artifact/upload
cp -r dist deploy_artifact/upload/
cp -r src deploy_artifact/upload/
cp package.json deploy_artifact/upload/
cp tsconfig.json deploy_artifact/upload/
cp scripts/remote-setup.sh deploy_artifact/upload/

# 3. Upload
echo "🚀 Uploading to VM (Authenticating as $VM_USER)..."
scp -r deploy_artifact/upload $VM_USER@$VM_IP:~/

# 4. Execute Remote Setup
echo "🔧 Executing Remote Setup..."
ssh $VM_USER@$VM_IP "chmod +x ~/upload/remote-setup.sh && ~/upload/remote-setup.sh"

echo "🎉 Deployment Script Finished."
