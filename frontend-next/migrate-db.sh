#!/bin/bash

echo "🚀 Starting database migration for QPay integration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set your database connection string in .env.local"
    exit 1
fi

echo "📊 Current database schema:"
echo "DATABASE_URL: ${DATABASE_URL:0:50}..."

# Run the migration SQL
echo "🔧 Running migration SQL..."
psql "$DATABASE_URL" -f prisma/migrations/add-qpay-fields.sql

if [ $? -eq 0 ]; then
    echo "✅ Database migration completed successfully!"
    echo ""
    echo "📋 New fields added:"
    echo "  - paymentId (QPay payment ID)"
    echo "  - invoiceId (QPay invoice ID)"
    echo "  - qpayStatus (QPay payment status)"
    echo "  - totalAmount (renamed from total)"
    echo "  - userId (now nullable)"
    echo ""
    echo "🎉 Your database is now ready for QPay integration!"
else
    echo "❌ Migration failed. Please check your database connection and try again."
    exit 1
fi
