import { TypeOrmModuleOptions } from "@nestjs/typeorm"
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as config from 'config'
import { Users } from "src/user/entity/user.entity";
const dbConfig = config.get('db');
require('dotenv').config();

export const typeOrmConfig : TypeOrmModuleOptions = {
    type: 'mysql',
    host: dbConfig.host,
    port: 3306,
    username: dbConfig.username,
    password:  dbConfig.password,
    database: dbConfig.database,
    //entities: [__dirname + '/**/*.entity{.ts,.js}'],
    entities: [Users],
    synchronize: dbConfig.synchronize,
}