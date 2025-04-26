import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from './modules/database/database.module';
import { UserModule } from './modules/user/user.module';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { ConversationModule } from './modules/conversation/conversation.module';
import { BotModule } from './modules/bot/bot.module';
import { dbConfig } from './config/database';
import { QnAModule } from './modules/qna/qna.module';
import { AuthModule } from './modules/auth/auth.module';
import * as path from 'path';
import { UnresolvedQueryModule } from './modules/message/unresolved-message.module';
import { ProfileModule } from './modules/profile/profile.module';
import { RequestLoggerMiddleware } from './internal/middlewares/request-logger.middleware';
import { GeminiModule } from './modules/gemini/gemini.module';
import { SearchModule } from './search/search.module';
import { MonitoringModule } from './monitoring/monitoring.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.resolve(__dirname, 'i18n'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
    }),
    MongooseModule.forRoot(dbConfig.mongodb.URI),
    AuthModule,
    DatabaseModule,
    UserModule,
    UnresolvedQueryModule,
    ConversationModule,
    BotModule,
    QnAModule,
    ProfileModule,
    GeminiModule,
    SearchModule,
    MonitoringModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply RequestLoggerMiddleware for specific methods
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes(
        { path: '*', method: RequestMethod.POST },
        { path: '*', method: RequestMethod.PATCH },
        { path: '*', method: RequestMethod.PUT },
        { path: '*', method: RequestMethod.DELETE },
      );
  }
}
