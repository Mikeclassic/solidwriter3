import readingTime from 'reading-time';

export interface SEOMetrics {
  wordCount: number;
  readingTime: number; // in minutes
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  solidScore: number; // 0-100
}

export interface KeywordAnalysis {
  keyword: string;
  count: number;
  density: number; // percentage
  positions: number[]; // word positions where keyword appears
}

export class SEOScoringEngine {
  private keywordList: string[] = [];
  
  constructor(targetKeywords: string[] = []) {
    this.keywordList = targetKeywords;
  }

  analyzeContent(content: string, targetKeywords?: string[]): SEOMetrics {
    const words = this.tokenizeText(content);
    const wordCount = words.length;
    
    // Calculate reading time
    const readingStats = readingTime(content);
    const readingTime = Math.ceil(readingStats.minutes);
    
    // Calculate readability score (simplified Flesch Reading Ease)
    const readabilityScore = this.calculateReadability(content);
    
    // Analyze keywords
    const keywords = targetKeywords || this.keywordList;
    const keywordDensity = this.calculateKeywordDensity(words, keywords);
    
    // Calculate overall Solid Score
    const solidScore = this.calculateSolidScore({
      wordCount,
      readingTime,
      readabilityScore,
      keywordDensity
    });

    return {
      wordCount,
      readingTime,
      readabilityScore,
      keywordDensity,
      solidScore
    };
  }

  private tokenizeText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  private calculateReadability(content: string): number {
    const sentences = content.split(/[.!?]+/).length;
    const words = this.tokenizeText(content).length;
    const syllables = this.countSyllables(content);
    
    if (words === 0 || sentences === 0) return 0;
    
    // Simplified Flesch Reading Ease formula
    const fleschScore = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    
    // Normalize to 0-100 scale
    return Math.max(0, Math.min(100, fleschScore));
  }

  private countSyllables(text: string): number {
    const words = this.tokenizeText(text);
    let syllableCount = 0;
    
    words.forEach(word => {
      const syllables = word.match(/[aeiouy]+/g)?.length || 1;
      syllableCount += Math.max(1, syllables);
    });
    
    return syllableCount;
  }

  private calculateKeywordDensity(words: string[], keywords: string[]): Record<string, number> {
    const density: Record<string, number> = {};
    const totalWords = words.length;
    
    keywords.forEach(keyword => {
      const keywordWords = keyword.toLowerCase().split(' ');
      let count = 0;
      
      // Count exact keyword matches
      for (let i = 0; i <= words.length - keywordWords.length; i++) {
        const match = keywordWords.every((kw, j) => words[i + j] === kw);
        if (match) count++;
      }
      
      density[keyword] = totalWords > 0 ? (count / totalWords) * 100 : 0;
    });
    
    return density;
  }

  private calculateSolidScore(metrics: {
    wordCount: number;
    readingTime: number;
    readabilityScore: number;
    keywordDensity: Record<string, number>;
  }): number {
    const { wordCount, readingTime, readabilityScore, keywordDensity } = metrics;
    
    // Scoring factors
    let score = 0;
    
    // Word count score (optimal: 1000-2500 words)
    if (wordCount >= 1000 && wordCount <= 2500) {
      score += 25;
    } else if (wordCount >= 500) {
      score += 15;
    } else {
      score += 5;
    }
    
    // Reading time score (optimal: 3-10 minutes)
    if (readingTime >= 3 && readingTime <= 10) {
      score += 20;
    } else if (readingTime >= 2) {
      score += 12;
    } else {
      score += 5;
    }
    
    // Readability score (optimal: 60-80)
    if (readabilityScore >= 60 && readabilityScore <= 80) {
      score += 25;
    } else if (readabilityScore >= 40) {
      score += 15;
    } else {
      score += 5;
    }
    
    // Keyword density score
    const keywordScores = Object.values(keywordDensity).map(density => {
      // Optimal density: 1-3%
      if (density >= 1 && density <= 3) return 30;
      if (density >= 0.5) return 20;
      return 5;
    });
    
    score += keywordScores.reduce((sum, s) => sum + s, 0) / keywordScores.length;
    
    return Math.round(Math.min(100, score));
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  }

  getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  }

  getRecommendations(metrics: SEOMetrics): string[] {
    const recommendations: string[] = [];
    const { wordCount, readingTime, readabilityScore, keywordDensity } = metrics;
    
    if (wordCount < 1000) {
      recommendations.push('Consider adding more content (aim for 1000+ words)');
    } else if (wordCount > 2500) {
      recommendations.push('Consider condensing content for better engagement');
    }
    
    if (readingTime > 10) {
      recommendations.push('Content may be too long for most readers');
    } else if (readingTime < 3) {
      recommendations.push('Consider expanding content for more depth');
    }
    
    if (readabilityScore < 60) {
      recommendations.push('Improve readability by using shorter sentences and simpler words');
    }
    
    Object.entries(keywordDensity).forEach(([keyword, density]) => {
      if (density > 3) {
        recommendations.push(`Keyword "${keyword}" density is too high (${density.toFixed(1)}%)`);
      } else if (density < 0.5) {
        recommendations.push(`Consider using keyword "${keyword}" more frequently`);
      }
    });
    
    return recommendations;
  }
}

export const seoScoringEngine = new SEOScoringEngine();
