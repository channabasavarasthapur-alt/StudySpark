export interface GeneratedCapsuleContent {
  summary: string
  keyConcepts: string[]
  importantTerms: string[]
  quickRevisionPoints: string[]
  practiceQuestions: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

const sentenceEndPattern = /(?<=[.!?])\s+/
const headingPattern = /^(#{1,6}\s+)?([A-Z][A-Za-z0-9 /&()-]{2,60}):\s*(.*)$/
const bulletPattern = /^[-*\u2022\d.)\s]+/
const stopWords = new Set([
  'about',
  'after',
  'also',
  'because',
  'before',
  'between',
  'class',
  'define',
  'definition',
  'definitions',
  'during',
  'each',
  'example',
  'examples',
  'figure',
  'figures',
  'from',
  'have',
  'info',
  'into',
  'more',
  'must',
  'note',
  'notes',
  'only',
  'other',
  'should',
  'study',
  'than',
  'that',
  'their',
  'there',
  'these',
  'this',
  'through',
  'tip',
  'tips',
  'when',
  'where',
  'which',
  'while',
  'with',
])

function cleanWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function uniq(values: string[]) {
  const seen = new Set<string>()

  return values.filter((value) => {
    const key = value.toLowerCase()

    if (!value || seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function splitSentences(notes: string) {
  return notes
    .replace(/\r/g, '')
    .split(/\n{2,}|(?<=[.!?])\s+/)
    .flatMap((block) => block.split(sentenceEndPattern))
    .map((sentence) => cleanWhitespace(sentence.replace(bulletPattern, '')))
    .filter((sentence) => sentence.length >= 24)
}

function splitLines(notes: string) {
  return notes
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function scoreSentence(sentence: string, index: number) {
  const lower = sentence.toLowerCase()
  const keywordScore = [
    'important',
    'because',
    'therefore',
    'causes',
    'effect',
    'process',
    'function',
    'difference',
    'advantage',
    'disadvantage',
    'definition',
    'formula',
    'principle',
    'law',
  ].reduce((score, keyword) => score + (lower.includes(keyword) ? 2 : 0), 0)
  const lengthScore = sentence.length > 80 && sentence.length < 220 ? 2 : 0
  const positionScore = index < 3 ? 2 : 0

  return keywordScore + lengthScore + positionScore
}

function getTopSentences(sentences: string[], count: number) {
  return sentences
    .map((sentence, index) => ({ sentence, index, score: scoreSentence(sentence, index) }))
    .sort((first, second) => second.score - first.score || first.index - second.index)
    .slice(0, count)
    .sort((first, second) => first.index - second.index)
    .map((item) => item.sentence)
}

function extractSubject(notes: string) {
  const subjectMatch = notes.match(/^subject:\s*(.+)$/im)

  return subjectMatch?.[1] ? subjectMatch[1].trim() : null
}

function extractHeadings(lines: string[]) {
  return lines
    .map((line) => line.match(headingPattern))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => cleanWhitespace(match[2]))
    .filter((heading) => !/^subject$/i.test(heading))
}

function extractImportantTerms(notes: string, lines: string[]) {
  const headingTerms = extractHeadings(lines)
  const definitionTerms = Array.from(notes.matchAll(/\b([A-Z][A-Za-z0-9 -]{2,40})\s+(?:is|are|means|refers to|describes)\b/g)).map(
    (match) => cleanWhitespace(match[1]),
  )
  const capitalizedTerms = Array.from(notes.matchAll(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\b/g)).map((match) => match[0])
  const wordFrequency = new Map<string, number>()

  notes
    .toLowerCase()
    .match(/\b[a-z][a-z-]{4,}\b/g)
    ?.forEach((word) => {
      if (!stopWords.has(word)) {
        wordFrequency.set(word, (wordFrequency.get(word) ?? 0) + 1)
      }
    })
  const frequentTerms = [...wordFrequency.entries()]
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
    .map(([word]) => word.replace(/\b\w/g, (letter) => letter.toUpperCase()))

  return uniq([...headingTerms, ...definitionTerms, ...capitalizedTerms, ...frequentTerms])
    .filter((term) => {
      const normalized = term.toLowerCase()

      return term.length >= 3 && !stopWords.has(normalized) && !/^(subject|chapter|topic)$/i.test(term)
    })
    .slice(0, 8)
}

function extractKeyConcepts(sentences: string[], lines: string[], terms: string[]) {
  const bulletConcepts = lines
    .filter((line) => /^[-*\u2022]|\d+[.)]/.test(line))
    .map((line) => cleanWhitespace(line.replace(bulletPattern, '')))
    .filter((line) => line.length >= 12)
  const termConcepts = terms.map((term) => {
    const sentence = sentences.find((candidate) => candidate.toLowerCase().includes(term.toLowerCase()))

    return sentence ? `${term}: ${sentence}` : term
  })

  return uniq([...bulletConcepts, ...termConcepts, ...getTopSentences(sentences, 5)])
    .map((concept) => (concept.length > 150 ? `${concept.slice(0, 147)}...` : concept))
    .slice(0, 6)
}

function makeRevisionPoints(sentences: string[], concepts: string[]) {
  const source = concepts.length > 0 ? concepts : getTopSentences(sentences, 5)

  return uniq(
    source.map((item) => {
      const cleanItem = item.replace(/^(.{3,45}):\s*/, '')

      return cleanItem.length > 130 ? `${cleanItem.slice(0, 127)}...` : cleanItem
    }),
  ).slice(0, 5)
}

function makePracticeQuestions(terms: string[], concepts: string[], subject: string | null) {
  const questionSource = terms.length > 0 ? terms : concepts.map((concept) => concept.split(':')[0])
  const baseQuestions = questionSource.slice(0, 4).map((term) => `Explain ${term} in your own words.`)
  const compareQuestion =
    questionSource.length >= 2 ? `Compare ${questionSource[0]} and ${questionSource[1]}.` : `List the most important points from ${subject ?? 'these notes'}.`

  return uniq([...baseQuestions, compareQuestion, `Why is ${questionSource[0] ?? subject ?? 'this topic'} important for revision?`]).slice(0, 5)
}

function getDifficulty(notes: string, terms: string[]) {
  const wordCount = notes.split(/\s+/).filter(Boolean).length

  if (wordCount > 450 || terms.length >= 7) {
    return 'Hard'
  }

  if (wordCount > 180 || terms.length >= 4) {
    return 'Medium'
  }

  return 'Easy'
}

export function generateCapsuleFromNotes(notes: string): GeneratedCapsuleContent {
  const cleanedNotes = notes.trim()
  const lines = splitLines(cleanedNotes)
  const sentences = splitSentences(cleanedNotes)
  const subject = extractSubject(cleanedNotes)
  const importantTerms = extractImportantTerms(cleanedNotes, lines)
  const keyConcepts = extractKeyConcepts(sentences, lines, importantTerms)
  const quickRevisionPoints = makeRevisionPoints(sentences, keyConcepts)
  const summarySentences = getTopSentences(sentences, 3)
  const fallbackSummary = keyConcepts.slice(0, 2).join(' ')
  const summary = summarySentences.length > 0 ? summarySentences.join(' ') : fallbackSummary
  const practiceQuestions = makePracticeQuestions(importantTerms, keyConcepts, subject)

  if (!summary || keyConcepts.length === 0) {
    throw new Error('Add more complete notes so StudySpark can identify concepts, terms, and revision points.')
  }

  return {
    summary,
    keyConcepts,
    importantTerms,
    quickRevisionPoints,
    practiceQuestions,
    difficulty: getDifficulty(cleanedNotes, importantTerms),
  }
}
