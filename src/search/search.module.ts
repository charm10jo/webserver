import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionService } from 'src/connection/connection.service';
import { Coordinates } from 'src/util/coordinates';
import { TypeOrmExModule } from 'src/util/typeorm-ex.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
    imports: [],
    controllers: [SearchController],
    providers: [SearchService, ConnectionService, Coordinates]
})
export class SearchModule {}
