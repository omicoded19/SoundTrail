import mongoose from 'mongoose'

export async function connectDatabase() {
  const mongoUri =
    process.env.MONGODB_URI?.trim()

  if (!mongoUri) {
    throw new Error(
      'MONGODB_URI is missing from server/.env',
    )
  }

  await mongoose.connect(mongoUri)

  console.log(
    'MongoDB connected successfully',
  )
}