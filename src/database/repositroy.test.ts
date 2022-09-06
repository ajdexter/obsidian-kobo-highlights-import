import * as chai from 'chai';
import { readFileSync } from 'fs';
import SqlJs, { Database } from 'sql.js';
import { binary } from '../binaries/sql-wasm';
import { Repository } from '../database/repository';

describe('repository', async function () {
    let db: Database
    let repo: Repository

    before(async function () {
        const SQLEngine = await SqlJs({
            wasmBinary: binary
        })

        db = new SQLEngine.Database(readFileSync("KoboReader.sqlite"))
        repo = new Repository(db);
    })

    after(function () {
        db.close()
    })

    it('getAllBookmark', async function () {
        chai.expect(await repo.getAllBookmark()).length.above(0)
    });
    it('getAllContent', async function () {
        chai.expect(await repo.getAllContent()).length.above(0)
    });
    it('getContentByContentId', async function () {
        chai.expect(await repo.getContentByContentId("23ba3dcf-3543-476c-984b-2f746c859763!OEBPS!Text/chapter017.xhtml")).not.null
    });
    it('getContentByContentId no results', async function () {
        chai.expect(await repo.getContentByContentId("")).null
    });
});
