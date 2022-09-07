import { Database, Statement } from "sql.js";
import { Bookmark, Content } from "./interfaces";

export class Repository {
    db: Database

    constructor(db: Database) {
        this.db = db
    }

    async getAllBookmark(): Promise<Bookmark[]> {
        const res = this.db.exec(`select Text, ContentID, annotation from Bookmark;`)
        const bookmakrs: Bookmark[] = []

        res[0].values.forEach(row => {
            bookmakrs.push({
                text: row[0]?.toString() ?? "",
                contentId: row[1]?.toString() ?? "",
                note: row[2]?.toString()
            })
        });

        return bookmakrs
    }

    async getContentByContentId(contentId: string): Promise<Content | null> {
        const statement = this.db.prepare(
            `select 
                Title, ContentID, ChapterIDBookmarked, BookTitle from content
                where ContentID = $id;`,
            { $id: contentId },
        )
        const contents = this.parseContentStatement(statement)
        statement.free()

        if (contents.length > 1) {
            throw new Error("filtering by contentId yielded more then 1 result")
        }

        return contents.pop() || null
    }

    async getAllContent(limit = 100): Promise<Content[]> {
        const statement = this.db.prepare(
            `select Title, ContentID, ChapterIDBookmarked, BookTitle from content limit $limit`,
            { $limit: limit },
        )

        const contents = this.parseContentStatement(statement)
        statement.free()

        return contents
    }

    async getAllContentByBookTitle(bookTitle: string): Promise<Content[]> {
        const statement = this.db.prepare(
            `select Title, ContentID, ChapterIDBookmarked, BookTitle  from "content" where BookTitle = $bookTitle order by ContentID`,
            { $bookTitle: bookTitle },
        )

        const contents = this.parseContentStatement(statement)
        statement.free()

        return contents
    }

    private parseContentStatement(statement: Statement): Content[] {
        const contents: Content[] = []

        while (statement.step()) {
            const row = statement.get();
            contents.push({
                title: row[0]?.toString() ?? "",
                contentId: row[1]?.toString() ?? "",
                chapterIdBookmarked: row[2]?.toString(),
                bookTitle: row[3]?.toString()
            })
        }

        return contents
    }
}