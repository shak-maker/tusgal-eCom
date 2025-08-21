# Database Migration for QPay Integration

## 🚀 **What You Need to Do:**

Your database schema needs to be updated to support QPay integration. Here are the steps:

## 📋 **Option 1: Prisma Migration (Recommended)**

### Step 1: Update Schema
The `prisma/schema.prisma` file has been updated with new fields:
- `paymentId` - QPay payment ID
- `invoiceId` - QPay invoice ID  
- `qpayStatus` - QPay payment status
- `totalAmount` - renamed from `total`
- `userId` - now nullable (for guest orders)

### Step 2: Generate Migration
```bash
cd frontend-next
npx prisma migrate dev --name add-qpay-fields
```

### Step 3: Apply Migration
```bash
npx prisma db push
```

## 📋 **Option 2: Manual SQL Migration**

If you prefer to run SQL directly:

### Step 1: Run Migration Script
```bash
cd frontend-next
./migrate-db.sh
```

### Step 2: Or run SQL manually in your database:
```sql
-- Add new columns
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "invoiceId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "qpayStatus" TEXT;

-- Rename total to totalAmount
ALTER TABLE "Order" RENAME COLUMN "total" TO "totalAmount";

-- Make userId nullable
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;
```

## 🔧 **What Changes:**

### **Order Table:**
- ✅ `paymentId` - Stores QPay payment ID
- ✅ `invoiceId` - Stores QPay invoice ID
- ✅ `qpayStatus` - Stores QPay payment status
- ✅ `totalAmount` - Renamed from `total` for clarity
- ✅ `userId` - Now nullable (guest orders supported)

### **OrderStatus Enum:**
- ✅ `PAID` - New status for successful payments
- ✅ `FAILED` - New status for failed payments

## 🧪 **Test After Migration:**

1. **Check database** - New fields should exist
2. **Test order creation** - Orders should save with new fields
3. **Check admin panel** - Orders should display correctly
4. **Verify QPay integration** - Payment flow should work

## ⚠️ **Important Notes:**

- **Backup your database** before migration
- **Test in development** first
- **Check existing data** after migration
- **Verify all fields** are properly added

## 🆘 **If Migration Fails:**

1. **Check database connection** in `.env.local`
2. **Verify Prisma client** is up to date
3. **Check database permissions**
4. **Review error messages** for specific issues

## 🎯 **Expected Result:**

After migration, your database will support:
- ✅ QPay payment tracking
- ✅ Guest order creation
- ✅ Complete payment status
- ✅ Admin order management
- ✅ Full order history

## 📞 **Need Help?**

If you encounter issues:
1. Check the error messages
2. Verify your database connection
3. Ensure Prisma is properly configured
4. Check database permissions

Your QPay integration will work perfectly once the database is updated! 🎉
