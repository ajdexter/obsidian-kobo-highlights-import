import * as chai from 'chai';
import { readFileSync } from 'fs';
import SqlJs, { Database } from 'sql.js';
import { binary } from '../binaries/sql-wasm';
import { Repository } from '../database/repository';
import { HighlightService } from './Highlight';

describe('HighlightService', async function () {
    let db: Database
    let repo: Repository
    let service: HighlightService

    before(async function () {
        const SQLEngine = await SqlJs({
            wasmBinary: binary
        })

        db = new SQLEngine.Database(readFileSync("KoboReader.sqlite"))
        repo = new Repository(db)
        service = new HighlightService(repo)
    })

    after(function () {
        db.close()
    })

    it('getAllHighlight', async function () {
        chai.expect(await service.getAllHighlight()).length.above(0)
    });
});
