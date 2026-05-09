#!/bin/bash
echo "🚀 Setting up KidFaceBook API..."

# Install dependencies
npm install

# Create directories
mkdir -p uploads temp output assets/fonts

# Create .env if not exists
if [ ! -f .env ]; then
  cp .env.example .env 2>/dev/null || echo "Created .env from template"
fi

echo "✅ Setup complete!"
echo ""
echo "To start development server:"
echo "  npm run dev"
echo ""
echo "To build for production:"
echo "  npm run build"
echo "  npm start"
