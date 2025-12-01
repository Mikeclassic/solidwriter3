import { prisma } from '@/lib/prisma';
import { pipeline } from '@xenova/transformers';

// Singleton for the embedding model
let embeddingModel: any = null;

async function getEmbeddingModel() {
  if (!embeddingModel) {
    embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embeddingModel;
}

export interface VoiceProfileData {
  name: string;
  description?: string;
  samples: string[];
  userId: string;
}

export interface SimilarityMatch {
  profileId: string;
  name: string;
  similarity: number;
  samples: string[];
}

export class VoiceProfileEngine {
  private async embedText(text: string): Promise<number[]> {
    try {
      const model = await getEmbeddingModel();
      const result = await model(text);
      // Convert tensor to array if needed
      return Array.from(result.data);
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate text embedding');
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async createVoiceProfile(data: VoiceProfileData): Promise<string> {
    const { name, description, samples, userId } = data;
    
    if (!samples || samples.length === 0) {
      throw new Error('At least one writing sample is required');
    }

    // Combine all samples into one text for embedding
    const combinedText = samples.join('\n\n');
    
    // Generate embedding
    const embedding = await this.embedText(combinedText);
    
    // Save to database
    const profile = await prisma.voiceProfile.create({
      data: {
        name,
        description,
        samples: JSON.stringify(samples),
        embedding,
        userId,
        model: 'all-MiniLM-L6-v2',
        dimensions: embedding.length,
      },
    });

    return profile.id;
  }

  async findSimilarProfiles(
    queryText: string,
    userId: string,
    limit: number = 5
  ): Promise<SimilarityMatch[]> {
    // Generate embedding for the query text
    const queryEmbedding = await this.embedText(queryText);
    
    // Find all voice profiles for the user
    const profiles = await prisma.voiceProfile.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        samples: true,
        embedding: true,
      },
    });

    // Calculate similarities
    const similarities: SimilarityMatch[] = profiles.map(profile => ({
      profileId: profile.id,
      name: profile.name,
      similarity: this.cosineSimilarity(queryEmbedding, profile.embedding),
      samples: JSON.parse(profile.samples),
    }));

    // Sort by similarity and return top results
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  async getVoiceProfileSamples(profileId: string): Promise<string[]> {
    const profile = await prisma.voiceProfile.findUnique({
      where: { id: profileId },
      select: { samples: true },
    });

    if (!profile) {
      throw new Error('Voice profile not found');
    }

    return JSON.parse(profile.samples);
  }

  async updateVoiceProfile(
    profileId: string,
    data: Partial<VoiceProfileData>
  ): Promise<void> {
    const updateData: any = {};
    
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    
    if (data.samples) {
      const combinedText = data.samples.join('\n\n');
      const embedding = await this.embedText(combinedText);
      updateData.samples = JSON.stringify(data.samples);
      updateData.embedding = embedding;
      updateData.dimensions = embedding.length;
    }

    await prisma.voiceProfile.update({
      where: { id: profileId },
      data: updateData,
    });
  }

  async deleteVoiceProfile(profileId: string): Promise<void> {
    await prisma.voiceProfile.delete({
      where: { id: profileId },
    });
  }

  async getUserVoiceProfiles(userId: string) {
    return prisma.voiceProfile.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const voiceProfileEngine = new VoiceProfileEngine();
