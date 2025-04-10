import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

interface IBook extends Document {
  bookId: string;
  title: string;
  authors: string[];
  description: string;
  image: string;
  link: string;
}

interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  savedBooks: IBook[];
  isCorrectPassword(password: string): Promise<boolean>;
  bookCount?: number;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    savedBooks: {
      type: [
        {
          bookId: { type: String, required: true },
          title: { type: String, required: true },
          authors: { type: [String], required: true },
          description: { type: String },
          image: { type: String },
          link: { type: String },
        },
      ],
    },
    bookCount: {
      type: Number,
      default: 0,
    },
  },
  // set this to use virtual below
  {
    toJSON: {
      virtuals: true,
    },
  }
);

// hash user password
userSchema.pre<IUser>('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// custom method to compare and validate password for logging in
userSchema.methods.isCorrectPassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// when we query a user, we'll also get another field called `bookCount` with the number of saved books we have
userSchema.virtual('bookCount').get(function () {
  return this.savedBooks.length;
});

const User = model<IUser>('User', userSchema);

export default User;
