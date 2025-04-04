import User from '../models/index.js';
import { signToken, AuthenticationError } from '../utils/auth.js';

interface User {
    _id: string;
    username: string;
    email: string;
    password: string;
    bookCount: number;
    savedBooks: Array<{
        bookId: string;
        authors: string[];
        description: string;
        title: string;
        image: string;
        link: string;
    }>;
}

interface UserInput {
    username: string;
    email: string;
    password: string;
}
interface BookInput {
    bookId: string;
    title: string;
}

interface Context {
    user?: {
        _id: string;
        username: string;
        email: string;
    }
}

const resolvers = {
    Query: {
        me: async (_parent: unknown, _args: unknown, context: Context): Promise<User | null> => {
            if (context.user) {
              // If user is authenticated, return their profile
              return await User.findOne({ _id: context.user._id });
            }
            // If not authenticated, throw an authentication error
            throw new AuthenticationError('Not Authenticated');
          },
        },

    Mutation: {
        addUser: async (_parent: unknown, { input }: { input: UserInput }): Promise<{ token: string; user: User }> => {
            const user = await User.create({ ...input });
            const token = signToken(user.username, user.email, user.password);

            return { token, user };
        },

        login: async (_parent: unknown, { email, password }: { email: string; password: string }): Promise<{ token: string; user: User }> => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user.username, user.email, user.password);
            return { token, user };
        },
        saveBook: async (_parent: unknown, { bookData }: { bookData: BookInput }, context: Context): Promise<User | null> => {
            if (context.user) {
                return await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: bookData } },
                    { new: true, runValidators: true }
                );
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async (_parent: unknown, { bookId }: { bookId: string }, context: Context): Promise<User | null> => {
            if (context.user) {
                return await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
};

export default resolvers;