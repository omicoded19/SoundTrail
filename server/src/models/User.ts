import mongoose, {
  Schema,
  type Model,
} from 'mongoose'

export interface UserDocument {
  name: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

const userSchema =
  new Schema<UserDocument>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      passwordHash: {
        type: String,
        required: true,
        select: false,
      },
    },
    {
      timestamps: true,
    },
  )

export const User =
  (mongoose.models.User as
    | Model<UserDocument>
    | undefined) ??
  mongoose.model<UserDocument>(
    'User',
    userSchema,
  )