export interface VideoAnalytics {
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  watchTime: number; // in seconds
  clickThroughRate: number; // percentage
  lastUpdated: Date;
}

export interface VideoThumbnail {
  url: string;
  width: number;
  height: number;
  quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres';
}

export interface VideoMetadata {
  duration: number; // in seconds
  resolution: string; // e.g., '1920x1080'
  frameRate: number;
  bitrate: number;
  format: string; // e.g., 'mp4', 'webm'
  size: number; // in bytes
}

export interface VideoEngagement {
  averageViewDuration: number; // in seconds
  retentionRate: number; // percentage
  engagementRate: number; // percentage
  topComments: string[];
}
