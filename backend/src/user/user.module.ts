import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserController } from '../user/user.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {} 