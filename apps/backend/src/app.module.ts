import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { configuration, validate } from './config';
import { ParametersModule } from './parameters/parameters.module';
import { PromptTemplatesModule } from './prompt-templates/prompt-templates.module';
import { GeneratedPromptsModule } from './generated-prompts/generated-prompts.module';
import { GenerationsModule } from './generations/generations.module';
import { GenerationResultsModule } from './generation-results/generation-results.module';
import { QueuesModule } from './queues/queues.module';

@Module({
  imports: [
    // Централизованная конфигурация
    ConfigModule.forRoot({
      load: [configuration],
      validate,
      isGlobal: true,
    }),
    // MongoDB с использованием ConfigService
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
    }),
    // Redis/BullMQ с использованием ConfigService
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
        },
      }),
    }),
    ParametersModule,
    PromptTemplatesModule,
    GeneratedPromptsModule,
    GenerationsModule,
    GenerationResultsModule,
    QueuesModule,
  ],
})
export class AppModule {}
