#!/bin/bash

# LUMINA Estate Systems - Setup Checker
# This script verifies your local environment is ready

echo "🏡 LUMINA Estate Systems - Setup Checker"
echo "========================================"
echo ""

# Check Node.js version
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"

    # Check if version is 18 or higher
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | tr -d 'v')
    if [ $MAJOR_VERSION -ge 18 ]; then
        echo "✅ Node.js version is compatible (18+)"
    else
        echo "⚠️  Warning: Node.js 18+ recommended, you have $NODE_VERSION"
    fi
else
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo ""

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm installed: v$NPM_VERSION"
else
    echo "❌ npm not found"
    exit 1
fi
echo ""

# Check if dependencies are installed
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules folder exists"

    # Check for key packages
    if [ -d "node_modules/next" ]; then
        echo "✅ Next.js installed"
    fi
    if [ -d "node_modules/@supabase/supabase-js" ]; then
        echo "✅ Supabase client installed"
    fi
    if [ -d "node_modules/react" ]; then
        echo "✅ React installed"
    fi
else
    echo "⚠️  node_modules not found. Run: npm install"
fi
echo ""

# Check for .env.local
echo "🔐 Checking environment variables..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local file exists"

    # Check if it has required variables
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        if grep -q "your_supabase_project_url" .env.local; then
            echo "⚠️  NEXT_PUBLIC_SUPABASE_URL needs to be updated"
        else
            echo "✅ NEXT_PUBLIC_SUPABASE_URL is configured"
        fi
    else
        echo "❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
    fi

    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        if grep -q "your_supabase_anon_key" .env.local; then
            echo "⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY needs to be updated"
        else
            echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is configured"
        fi
    else
        echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local"
    fi
else
    echo "❌ .env.local file not found"
    echo "   Create it by copying .env.example:"
    echo "   cp .env.example .env.local"
    echo "   Then edit it with your Supabase credentials"
fi
echo ""

# Check if database migrations exist
echo "🗄️  Checking database files..."
if [ -f "supabase/migrations/20250101000000_initial_schema.sql" ]; then
    echo "✅ Database migration file exists"
    echo "   Make sure to run this in Supabase SQL Editor!"
else
    echo "❌ Migration file not found"
fi
echo ""

# Check if project can build
echo "🔨 Checking if project structure is valid..."
if [ -f "next.config.ts" ] && [ -f "package.json" ] && [ -f "tsconfig.json" ]; then
    echo "✅ All configuration files present"
else
    echo "❌ Missing configuration files"
fi
echo ""

# Summary
echo "========================================"
echo "📋 Setup Summary"
echo "========================================"
echo ""

if [ -f ".env.local" ] && [ -d "node_modules" ]; then
    echo "✅ You're almost ready to go!"
    echo ""
    echo "Next steps:"
    echo "1. Create Supabase project at https://supabase.com"
    echo "2. Run the migration SQL (supabase/migrations/*.sql)"
    echo "3. Update .env.local with your Supabase credentials"
    echo "4. Run: npm run dev"
    echo "5. Open http://localhost:3000"
    echo ""
    echo "See TESTING.md for detailed instructions!"
else
    echo "⚠️  Setup incomplete"
    echo ""
    echo "Required steps:"
    if [ ! -d "node_modules" ]; then
        echo "1. Run: npm install"
    fi
    if [ ! -f ".env.local" ]; then
        echo "2. Create .env.local file (see .env.example)"
    fi
    echo ""
    echo "See TESTING.md for detailed instructions!"
fi
echo ""
