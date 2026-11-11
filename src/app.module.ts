import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './case/products/product.module';
import { CategoryModule } from './case/categories/category.module';
import { SpotModule } from './case/spots/spot.module';
import { GuestCheckModule } from './case/guest-checks/guest-check.module';
import { OrderModule } from './case/orders/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseURL = configService.get<string>('DATABASE_URL');
        const dbSchema = configService.get<string>('DATABASE_SCHEMA', 'public');

        if (!databaseURL) {
          throw new Error('A variável de ambiente DATABASE_URL não foi encontrada!');
        }

        return {
          type: 'postgres',
          url: databaseURL,
          schema: dbSchema,
          autoLoadEntities: true,
          synchronize: true,
          ssl: false
        }
      }
    }),
    CategoryModule,
    ProductModule,
    SpotModule,
    GuestCheckModule,
    OrderModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}