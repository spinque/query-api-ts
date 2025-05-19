import * as snowball from './snowball/snowball';
import { stopwords as dutch } from './snowball/stopwords/dutch';
import { stopwords as english } from './snowball/stopwords/english';

export interface SnippetOptions {
  /**
   * Maximum number of characters the snippet may be.
   */
  size?: number;

  /**
   * Whether to highlight terms using <mark> elements. Defaults to false.
   */
  highlight?: boolean;

  /**
   * Lists of stopwords to ignore while finding the best snippet.
   */
  stopwords?: 'dutch' | 'english';

  /**
   * Stemmer to use when comparing query terms with text terms.
   */
  stemmer?: snowball.StemmerAlgorithm;
}

const DEFAULT_SIZE = 512;
const DEFAULT_HIGHLIGHT = false;
const DEFAULT_STOPWORDS = undefined;
const DEFAULT_STEMMER = undefined;

/**
 * Takes a piece of text and a text query and returns a snippet of the text that best matches the query.
 */
export const getSnippet = (text: string, query: string, options: SnippetOptions = {}): string => {
  // In case of empty text, return empty snippet
  if (!text) {
    return '';
  }

  // Prevent problems by cutting off extremely large texts
  const maxTextSize = Math.pow(2, 16);
  text = text.slice(0, maxTextSize);

  const size = options.size || DEFAULT_SIZE;

  // If there's no query, there's nothing to match on so just return the truncated text
  if (!query) {
    return truncate(text, size);
  }

  const stemmer = options.stemmer || DEFAULT_STEMMER;
  const stopwords = options.stopwords || DEFAULT_STOPWORDS;
  const processor = new TextProcessor(stopwords, stemmer);

  let snippet = findBestSnippet(text, query, logWeightedTermFrequency, processor, size);

  if (options.highlight || DEFAULT_HIGHLIGHT) {
    return highlight(snippet, query, processor);
  }

  return snippet;
}

/**
 * Find the best snippet of a text for a query, given a scoring function and text processor.
 */
const findBestSnippet = (text: string, query: string, score: (docterms: string[], qterms: string[]) => number, processor: TextProcessor, size: number) => {
  const qterms = processor.tokenize(query);
  const sentences = splitIntoSentences(text);

  let bestScore = -1;
  let bestSnippet = '';

  for (let i = 0; i < sentences.length; i++) {
    let snippet = '';

    let j = i;
    while (j < sentences.length && snippet.length < size) {
      snippet += ' ' + sentences[j];
      j++;
    }

    if (snippet.length > size) {
      let trimmed = snippet.slice(0, size);
      const lastSpace = trimmed.lastIndexOf(' ');
      snippet = trimmed.slice(0, lastSpace) + '...';
    }

    const snippetTerms = processor.tokenize(snippet);

    const _score = score(snippetTerms, qterms);

    if (_score > bestScore) {
      bestScore = _score;
      bestSnippet = snippet.trim();
    }
  }

  return bestSnippet;
}

/**
 * Highlight matching words by wrapping in <mark> tags
 */
const highlight = (snippet: string, query: string, processor: TextProcessor) => {
  const qterms = processor.tokenize(query);
  return snippet.replace(/\b\w+\b/g, (word) => {
    const processed = processor.tokenize_one(word);
    if (processed !== null && qterms.includes(processed)) {
      return `<mark>${word}</mark>`;
    }
    return word;
  });
}

/**
 * Truncates a piece of text to the desired maximum length and appends '...' to the end.
 */
export const truncate = (text: string, size = 512): string => {
  if (text.length <= size) {
    return text;
  }
  return `${text.slice(0, size - 3)}...`;
}

/**
 * Split text into sentence using a Regular Expression.
 */
export const splitIntoSentences = (text: string): string[] => {
  return text.match(/[^.!?]+[.!?]+/g) || [];
}


/**
 * Scoring function to rank snippets by. Plain term frequency over all query terms
 */
const termFrequency = (docterms: string[], qterms: string[]) => {
  let score = 0;
  qterms.forEach(qterm => {
    score += docterms.filter(s => s === qterm).length;
  });
  return score;
}

/**
 * Scoring function to rank snippets by. Takes the log of term frequency per distinct query term.
 */
const logWeightedTermFrequency = (docterms: string[], qterms: string[]) => {
  let score = 0;
  qterms.forEach(qterm => {
    score += Math.log(1 + docterms.filter(s => s === qterm).length);
  });
  return score;
}


// Dictionary of stopword lists per language
const STOPWORDS_PER_LANG = { dutch, english };

/**
 * Cache the stemmer in memory to prevent calling `newStemmer` often.
 */
const cachedStemmers: {
  [stemmer in snowball.StemmerAlgorithm]?: snowball.Stemmer;
} = {};

const getStemmer = (stemmer: snowball.StemmerAlgorithm): snowball.Stemmer => {
  if (!cachedStemmers[stemmer]) {
    cachedStemmers[stemmer] = snowball.newStemmer(stemmer);
  }
  return cachedStemmers[stemmer] as snowball.Stemmer;
}

class TextProcessor {

  private stemmer: (word: string) => string;
  private stopwords: Set<string>;

  constructor(stopwords?: 'dutch' | 'english', stemmer?: snowball.StemmerAlgorithm) {
    if (stopwords) {
      this.stopwords = STOPWORDS_PER_LANG[stopwords];
    } else {
      this.stopwords = new Set();
    }
    if (stemmer) {
      this.stemmer = getStemmer(stemmer).stem;
    } else {
      this.stemmer = (word: string) => word;
    }
  }

  tokenize(text: string) {
    // split on word boundaries to get list of words
    const words: string[] = text.match(/\b\w+\b/g) || [];

    return words.reduce((acc, word) => {
      const processed = this.tokenize_one(word);
      return processed ? [...acc, processed] : acc;
    }, [] as string[]);
  }

  /**
   * Processed one word by checking the list of stopwords and stemming
   * @param word 
   * @returns null if the word should be ignored
   */
  tokenize_one(word: string) {
    word = word.toLowerCase();
    // Ignore if the word is in the list of stopwords
    if (this.stopwords.has(word)) {
      return null;
    }
    // Return the list with the new word
    return this.stemmer(word);
  }
}