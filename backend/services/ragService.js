const fs = require('fs');
const path = require('path');

class RAGService {
    constructor() {
        this.knowledgeBaseDir = path.join(__dirname, '..', 'knowledge-base');
        this.chunks = [];
        this.initialized = false;
        this.initialize();
    }

    initialize() {
        try {
            if (!fs.existsSync(this.knowledgeBaseDir)) {
                console.warn('Knowledge base directory not found at:', this.knowledgeBaseDir);
                return;
            }

            const files = fs.readdirSync(this.knowledgeBaseDir).filter(f => f.endsWith('.md'));
            const allChunks = [];

            for (const file of files) {
                const filePath = path.join(this.knowledgeBaseDir, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const parsedChunks = this.parseMarkdownIntoChunks(file, content);
                allChunks.push(...parsedChunks);
            }

            this.chunks = allChunks;
            this.initialized = true;
            console.log(`RAG Service initialized with ${this.chunks.length} chunks from ${files.length} documents.`);
        } catch (err) {
            console.error('Failed to initialize RAG Service:', err.message);
        }
    }

    parseMarkdownIntoChunks(fileName, content) {
        const lines = content.split('\n');
        const chunks = [];
        let currentTitle = fileName.replace('.md', '').replace(/-/g, ' ');
        let currentSection = '';
        let currentContent = [];

        for (const line of lines) {
            if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ')) {
                if (currentContent.length > 0) {
                    chunks.push({
                        docId: fileName,
                        title: currentSection ? `${currentTitle} > ${currentSection}` : currentTitle,
                        content: currentContent.join('\n').trim(),
                        tokens: this.tokenize(currentContent.join(' ') + ' ' + currentSection + ' ' + currentTitle)
                    });
                    currentContent = [];
                }
                currentSection = line.replace(/^#+\s*/, '').trim();
                if (line.startsWith('# ')) {
                    currentTitle = currentSection;
                }
            } else {
                currentContent.push(line);
            }
        }

        if (currentContent.length > 0) {
            chunks.push({
                docId: fileName,
                title: currentSection ? `${currentTitle} > ${currentSection}` : currentTitle,
                content: currentContent.join('\n').trim(),
                tokens: this.tokenize(currentContent.join(' ') + ' ' + currentSection + ' ' + currentTitle)
            });
        }

        return chunks;
    }

    tokenize(text) {
        if (!text) return [];
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(t => t.length > 1 && !this.isStopWord(t));
    }

    isStopWord(word) {
        const stopWords = new Set([
            'the', 'and', 'for', 'are', 'with', 'this', 'that', 'you', 'your',
            'can', 'how', 'what', 'where', 'when', 'why', 'who', 'which', 'all',
            'from', 'about', 'into', 'some', 'than', 'then', 'them', 'these', 'have'
        ]);
        return stopWords.has(word);
    }

    search(query, topK = 4) {
        if (!this.initialized || this.chunks.length === 0) {
            this.initialize();
        }

        if (!query || this.chunks.length === 0) {
            return [];
        }

        const queryTokens = this.tokenize(query);
        if (queryTokens.length === 0) {
            return this.chunks.slice(0, topK);
        }

        const queryLower = query.toLowerCase();

        const scored = this.chunks.map(chunk => {
            let score = 0;
            const contentLower = chunk.content.toLowerCase();
            const titleLower = chunk.title.toLowerCase();

            // Exact phrase matching in title or content
            if (titleLower.includes(queryLower)) {
                score += 15;
            }
            if (contentLower.includes(queryLower)) {
                score += 10;
            }

            // Token overlap scoring
            const chunkTokenSet = new Set(chunk.tokens);
            for (const qToken of queryTokens) {
                if (titleLower.includes(qToken)) {
                    score += 6;
                }
                if (chunkTokenSet.has(qToken)) {
                    score += 3;
                }
            }

            return {
                docId: chunk.docId,
                title: chunk.title,
                content: chunk.content,
                score
            };
        });

        // Filter and sort by score descending
        return scored
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }
}

module.exports = new RAGService();
