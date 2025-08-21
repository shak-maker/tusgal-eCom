-- Migration: Add QPay Integration Fields to Orders Table
-- Run this SQL in your database to add the new fields

-- Add new columns to the Order table
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "invoiceId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "qpayStatus" TEXT;

-- Rename 'total' column to 'totalAmount' if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Order' AND column_name = 'total') THEN
        ALTER TABLE "Order" RENAME COLUMN "total" TO "totalAmount";
    END IF;
END $$;

-- Make userId nullable if it's not already
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;

-- Add updatedAt to OrderItem if it doesn't exist
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to set default values
UPDATE "Order" SET "status" = 'PENDING' WHERE "status" IS NULL;
UPDATE "Order" SET "paid" = false WHERE "paid" IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS "Order_paymentId_idx" ON "Order"("paymentId");
CREATE INDEX IF NOT EXISTS "Order_invoiceId_idx" ON "Order"("invoiceId");
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
