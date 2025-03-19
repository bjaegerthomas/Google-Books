import type IUserContext from '../interfaces/IUserContext';
import type IUserDocument from '../interfaces/IUserDocument';
import type IBookInput from '../interfaces/IBookInput';

import { User } from '../models/index.js';
import { signToken, AuthenticationError } from '../services/auth-service.js';

const resolvers = {
    Query: {
        me: async (_parent: any, _args: any, context: IUserContext): Promise<IUserDocument | null> => {
            
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id }).select('-__v -password');
                return userData;
            }
            throw new AuthenticationError('You need to be logged in!');
        }, 
    },
    Mutation: {
        addUser: async (_parent: any, args: any): Promise<{ token: string; user: IUserDocument }> => {
            const user = await User.create(args);
            const token = signToken(user.username, user.email, user.id);
            return { token, user };
        },
        login: async (_parent: any, { email, password }: { email: string; password: string }): Promise<{ token: string; user: IUserDocument }> => {
            const user = await User.findOne({ email });

            if (!user || !(await user.isCorrectPassword(password))) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user.username, user.email, user.id);
            return { token, user };
        },
        saveBook: async (_pasrent: any, { bookId }: { bookId: string}, context: IUserContext): Promise<IUserDocument | null> => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookId } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async (_parent: any, { bookId }: { bookId: string }, context: IUserContext): Promise<IUserDocument | null> => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: bookId } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    }
};

export default resolvers;