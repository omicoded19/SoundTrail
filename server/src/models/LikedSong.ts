import mongoose, {
  type Model,
  type Types,
} from 'mongoose'

export interface LikedSongDocument {
  userId: Types.ObjectId
  trackId: string
  title: string
  artistId: string | null
  artistName: string
  albumId: string | null
  albumTitle: string
  artworkUrl: string
  durationSec: number
  previewUrl: string | null
  externalUrl: string | null
  source: string
  createdAt: Date
  updatedAt: Date
}

const likedSongSchema =
  new mongoose.Schema<LikedSongDocument>(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },

      trackId: {
        type: String,
        required: true,
        trim: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
      },

      artistId: {
        type: String,
        default: null,
      },

      artistName: {
        type: String,
        required: true,
        trim: true,
      },

      albumId: {
        type: String,
        default: null,
      },

      albumTitle: {
        type: String,
        required: true,
        trim: true,
      },

      artworkUrl: {
        type: String,
        default: '',
      },

      durationSec: {
        type: Number,
        required: true,
        min: 0,
      },

      previewUrl: {
        type: String,
        default: null,
      },

      externalUrl: {
        type: String,
        default: null,
      },

      source: {
        type: String,
        default: 'itunes',
      },
    },
    {
      timestamps: true,
    },
  )

likedSongSchema.index(
  {
    userId: 1,
    trackId: 1,
  },
  {
    unique: true,
  },
)

export const LikedSong =
  (mongoose.models.LikedSong as
    | Model<LikedSongDocument>
    | undefined) ??
  mongoose.model<LikedSongDocument>(
    'LikedSong',
    likedSongSchema,
  )