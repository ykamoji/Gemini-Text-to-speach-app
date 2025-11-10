import type { VoiceOption } from './types';

const MALE_VOICES: VoiceOption[] = [
  { value: 'Achernar', label: 'Achernar', gender: 'Male', description: 'Deep and authoritative, excellent for documentaries or formal narration.' },
  { value: 'Achird', label: 'Achird', gender: 'Male', description: 'A bright, cheerful voice, highly effective for commercials and upbeat content.' },
  { value: 'Algenib', label: 'Algenib', gender: 'Male', description: 'A warm, friendly voice, ideal for storytelling and audiobooks.' },
  { value: 'Algieba', label: 'Algieba', gender: 'Male', description: 'A clear baritone, reassuring and suitable for formal announcements.' },
  { value: 'Alnilam', label: 'Alnilam', gender: 'Male', description: 'Crisp and articulate, a great choice for e-learning and instructional content.' },
  { value: 'Charon', label: 'Charon', gender: 'Male', description: 'A mature, calm voice, perfect for meditation guides or serious topics.' },
  { value: 'Enceladus', label: 'Enceladus', gender: 'Male', description: 'Clear and professional, well-suited for corporate videos and presentations.' },
  { value: 'Fenrir', label: 'Fenrir', gender: 'Male', description: 'A strong, energetic voice that commands attention, good for advertisements.' },
  { value: 'Iapetus', label: 'Iapetus', gender: 'Male', description: 'Smooth and sophisticated, excellent for luxury branding or elegant content.' },
  { value: 'Orus', label: 'Orus', gender: 'Male', description: 'A youthful and upbeat voice, suitable for explainers and engaging content.' },
  { value: 'Puck', label: 'Puck', gender: 'Male', description: 'Playful and whimsical, a fun choice for children\'s stories or creative projects.' },
  { value: 'Rasalgethi', label: 'Rasalgethi', gender: 'Male', description: 'A gravelly, powerful voice, designed for dramatic readings and trailers.' },
  { value: 'Sadachbia', label: 'Sadachbia', gender: 'Male', description: 'A gentle and reassuring tone, ideal for instructional or calming content.' },
  { value: 'Sadaltager', label: 'Sadaltager', gender: 'Male', description: 'Bright and engaging, a natural fit for podcasts and conversational reads.' },
  { value: 'Schedar', label: 'Schedar', gender: 'Male', description: 'A confident, clear voice that is well-suited for business presentations.' },
  { value: 'Umbriel', label: 'Umbriel', gender: 'Male', description: 'A mysterious, alluring voice for trailers or content with a dramatic flair.' },
  { value: 'Zubenelgenubi', label: 'Zubenelgenubi', gender: 'Male', description: 'A unique and memorable voice for distinctive brand messaging.' },
];

const FEMALE_VOICES: VoiceOption[] = [
  { value: 'Aoede', label: 'Aoede', gender: 'Female', description: 'Melodic and expressive, an ideal voice for audiobooks and dramatic performances.' },
  { value: 'Autonoe', label: 'Autonoe', gender: 'Female', description: 'A soft, professional voice, suitable for corporate explainers and IVR systems.' },
  { value: 'Callirrhoe', label: 'Callirrhoe', gender: 'Female', description: 'Warm and empathetic, great for customer service bots or heartfelt messages.' },
  { value: 'Despina', label: 'Despina', gender: 'Female', description: 'A clear and youthful voice, perfect for explainer videos and tutorials.' },
  { value: 'Erinome', label: 'Erinome', gender: 'Female', description: 'Elegant and smooth, a sophisticated choice for luxury advertising.' },
  { value: 'Gacrux', label: 'Gacrux', gender: 'Female', description: 'A slightly raspy, wise-sounding voice, perfect for character roles.' },
  { value: 'Laomedeia', label: 'Laomedeia', gender: 'Female', description: 'A calm, soothing voice, excellent for meditation apps and relaxation content.' },
  { value: 'Leda', label: 'Leda', gender: 'Female', description: 'A confident and friendly voice that works well for podcasts and vlogging.' },
  { value: 'Pulcherrima', label: 'Pulcherrima', gender: 'Female', description: 'A sweet and gentle voice, perfect for children\'s stories and lullabies.' },
  { value: 'Sulafat', label: 'Sulafat', gender: 'Female', description: 'A deep, resonant voice that can add weight to movie trailers or epic stories.' },
  { value: 'Vindemiatrix', label: 'Vindemiatrix', gender: 'Female', description: 'A professional, authoritative voice, suitable for news reading and announcements.' },
  { value: 'Zephyr', label: 'Zephyr', gender: 'Female', description: 'Light and airy, a relaxed voice for casual and soothing content.' },
];

export const VOICES_BY_GENDER = {
  female: FEMALE_VOICES,
  male: MALE_VOICES,
};

export const ALL_VOICES: VoiceOption[] = [...FEMALE_VOICES, ...MALE_VOICES];


export const TONE_OPTIONS: string[] = [
  'Professional', 'Friendly', 'Enthusiastic', 'Calm', 'Serious', 'Empathetic', 'Formal', 'Informal', 'Cheerful', 'Sad', 'Urgent', 'Mysterious'
];

export const ACCENT_OPTIONS: string[] = [
  'Neutral', 'American', 'British', 'Australian', 'Irish', 'Scottish', 'Indian', 'Canadian'
];

export const PACING_OPTIONS: string[] = [
  'conversational', 'slow', 'brisk', 'fast', 'very fast'
];

export const STYLE_OPTIONS: string[] = [
  'in a clear and engaging manner',
  'in an expressive and dramatic style',
  'in a calm and soothing voice',
  'in an energetic and upbeat way',
  'in a serious and authoritative tone',
  'with a warm and friendly demeanor',
  'in a whisper',
  'as a storyteller for children',
  'like a news anchor',
  'like a documentary narrator',
  'as if giving a lecture',
  'as if leading a meditation'
];