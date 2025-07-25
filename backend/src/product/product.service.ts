import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    return this.prisma.product.create({ data });
  }
} 