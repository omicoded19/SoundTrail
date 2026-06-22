import mongoose, {
  type Model,
  type Types,
} from 'mongoose'

export interface PlaylistTrack {
  id: string
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
}

export interface PlaylistDocument {
  userId: Types.ObjectId
  name: string
  description: string
  tracks: PlaylistTrack[]
  createdAt: Date
  updatedAt: Date
}

const playlistTrackSchema =
  new mongoose.Schema<PlaylistTrack>(
    {
      id: {
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
      _id: false,
    },
  )

const playlistSchema =
  new mongoose.Schema<PlaylistDocument>(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 60,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 240,
        default: '',
      },

      tracks: {
        type: [playlistTrackSchema],
        default: [],
      },
    },
    {
      timestamps: true,
    },
  )

playlistSchema.index({
  userId: 1,
  updatedAt: -1,
})

export const Playlist =
  (mongoose.models.Playlist as
    | Model<PlaylistDocument>
    | undefined) ??
  mongoose.model<PlaylistDocument>(
    'Playlist',
    playlistSchema,
  )