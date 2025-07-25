export class CreateProductDto {
  name: string;
  price: number;
  userId: number;
  description?: string;
  stock?: number;
  imageUrl?: string;
} 