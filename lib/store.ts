import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface VoiceProfile {
  id: string;
  name: string;
  description?: string;
  samples: string[];
  similarity?: number;
}

export interface GenerationContext {
  tone: string;
  audience: string;
  activeVoiceProfiles: VoiceProfile[];
  keywords: string[];
  targetLength: 'short' | 'medium' | 'long';
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface GenerationJob {
  id: string;
  topic: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  content?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface SolidWriterStore {
  // Current generation context
  context: GenerationContext;
  
  // UI state
  currentProject: string | null;
  isGenerating: boolean;
  generationJob: GenerationJob | null;
  
  // Voice profiles
  voiceProfiles: VoiceProfile[];
  selectedVoiceProfile: VoiceProfile | null;
  
  // Editor state
  editorContent: string;
  editorTitle: string;
  isEditing: boolean;
  
  // Actions
  setContext: (context: Partial<GenerationContext>) => void;
  setCurrentProject: (projectId: string | null) => void;
  setIsGenerating: (generating: boolean) => void;
  setGenerationJob: (job: GenerationJob | null) => void;
  setVoiceProfiles: (profiles: VoiceProfile[]) => void;
  addVoiceProfile: (profile: VoiceProfile) => void;
  removeVoiceProfile: (profileId: string) => void;
  setSelectedVoiceProfile: (profile: VoiceProfile | null) => void;
  setEditorContent: (content: string) => void;
  setEditorTitle: (title: string) => void;
  setIsEditing: (editing: boolean) => void;
  resetStore: () => void;
}

const defaultContext: GenerationContext = {
  tone: 'professional',
  audience: 'general',
  activeVoiceProfiles: [],
  keywords: [],
  targetLength: 'medium',
  readingLevel: 'intermediate',
};

export const useSolidWriterStore = create<SolidWriterStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      context: defaultContext,
      currentProject: null,
      isGenerating: false,
      generationJob: null,
      voiceProfiles: [],
      selectedVoiceProfile: null,
      editorContent: '',
      editorTitle: '',
      isEditing: false,
      
      // Actions
      setContext: (newContext) =>
        set((state) => ({
          context: { ...state.context, ...newContext },
        })),
        
      setCurrentProject: (projectId) =>
        set({ currentProject: projectId }),
        
      setIsGenerating: (generating) =>
        set({ isGenerating: generating }),
        
      setGenerationJob: (job) =>
        set({ generationJob: job }),
        
      setVoiceProfiles: (profiles) =>
        set({ voiceProfiles: profiles }),
        
      addVoiceProfile: (profile) =>
        set((state) => ({
          voiceProfiles: [...state.voiceProfiles, profile],
        })),
        
      removeVoiceProfile: (profileId) =>
        set((state) => ({
          voiceProfiles: state.voiceProfiles.filter((p) => p.id !== profileId),
          selectedVoiceProfile: 
            state.selectedVoiceProfile?.id === profileId
              ? null
              : state.selectedVoiceProfile,
        })),
        
      setSelectedVoiceProfile: (profile) =>
        set({ selectedVoiceProfile: profile }),
        
      setEditorContent: (content) =>
        set({ editorContent: content }),
        
      setEditorTitle: (title) =>
        set({ editorTitle: title }),
        
      setIsEditing: (editing) =>
        set({ isEditing: editing }),
        
      resetStore: () =>
        set({
          context: defaultContext,
          currentProject: null,
          isGenerating: false,
          generationJob: null,
          selectedVoiceProfile: null,
          editorContent: '',
          editorTitle: '',
          isEditing: false,
        }),
    }),
    {
      name: 'solidwriter-store',
    }
  )
);

// Selectors for convenience
export const useGenerationContext = () => useSolidWriterStore((state) => state.context);
export const useIsGenerating = () => useSolidWriterStore((state) => state.isGenerating);
export const useGenerationJob = () => useSolidWriterStore((state) => state.generationJob);
export const useVoiceProfiles = () => useSolidWriterStore((state) => state.voiceProfiles);
export const useSelectedVoiceProfile = () => useSolidWriterStore((state) => state.selectedVoiceProfile);
export const useEditorContent = () => useSolidWriterStore((state) => state.editorContent);
export const useEditorTitle = () => useSolidWriterStore((state) => state.editorTitle);
export const useIsEditing = () => useSolidWriterStore((state) => state.isEditing);
export const useCurrentProject = () => useSolidWriterStore((state) => state.currentProject);
