import { Module } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { ProductController } from '../product/product.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {} 