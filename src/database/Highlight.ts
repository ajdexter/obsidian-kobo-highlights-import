import { Bookmark, Content, Highlight } from "./interfaces";
import { Repository } from "./repository";

export class HighlightService {
    repo: Repository

    constructor(repo: Repository) {
        this.repo = repo
    }

    async getAllHighlight() {
        const highlights: Highlight[] = []

        const bookmarks = await this.repo.getAllBookmark()
        for (const bookmark of bookmarks) {
            const content = await this.repo.getContentByContentId(bookmark.contentId)

            if (content == null) {
                throw Error("bookmark seems to link to a non existing content")
            }

            if (content.chapterIdBookmarked == null) {
                highlights.push({
                    bookmark: bookmark,
                    content: await this.findRightContentForBookmark(bookmark, content)
                })
                continue
            }

            highlights.push({
                bookmark: bookmark,
                content: content
            })
        }

        return highlights.sort(function (a, b): number {
            if (!a.content.bookTitle || !b.content.bookTitle) {
                throw new Error("bookTitle must be set");
            }

            return a.content.bookTitle.localeCompare(b.content.bookTitle ?? "") ||
                a.content.title.localeCompare(b.content.title);
        })
    }

    private async findRightContentForBookmark(bookmark: Bookmark, originalContent: Content): Promise<Content> {
        if (!originalContent.bookTitle) {
            throw new Error("bookTitle field must be set")
        }

        const contents = await this.repo.getAllContentByBookTitle(originalContent.bookTitle)
        const potential = await this.repo.getContentByContentId(`${originalContent.contentId}-1`)
        if (potential && potential.chapterIdBookmarked) {
            return potential
        }

        let foundContent: Content | null = null

        for (const c of contents) {
            if (c.chapterIdBookmarked) {
                foundContent = c
            }

            if (c.contentId === bookmark.contentId && foundContent) {
                return foundContent
            }
        }

        console.warn(`was not able to find chapterIdBookmarked for book ${originalContent.bookTitle}`)

        return originalContent
    }
}