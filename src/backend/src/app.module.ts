import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RomModule } from './rom/rom.module';
import {BullModule} from "@nestjs/bullmq";
import {TypeOrmModule} from "@nestjs/typeorm";
import {RomEntity} from "./rom/rom.entity";
import { resolve } from 'path';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {EnvironmentEnum} from "../environment.enum";
import {ServeStaticModule} from "@nestjs/serve-static";
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>(EnvironmentEnum.REDIS_HOST),
          port: configService.get<number>(EnvironmentEnum.REDIS_PORT),
        }
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'sqlite',
        database: resolve(
            __dirname,
            '../..',
            configService.get<string>(EnvironmentEnum.DB_PATH),
        ),
        entities: [RomEntity],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => [
        {
          rootPath: resolve(
              __dirname,
              '../..',
              configService.get<string>(EnvironmentEnum.FE_PATH),
          ),
          exclude: ['/api/(.*)'],
        },
      ],
      inject: [ConfigService],
    }),
    RomModule,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
