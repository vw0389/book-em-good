const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {

    Query: {
      me: async (parent, args, context) => {
        if (context.user) {
          const userData = await User.findOne({ _id: context.user._id }).select('-__v -password').populate('savedBooks');
          return userData;
        }
        throw new AuthenticationError('not logged in');
      }
    },
  
    Mutation: {

      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
        if (user) {
          const validPassword = await user.isCorrectPassword(password);
          if (validPassword) {
            const token = signToken(user);
            return { user, token };
          }
        }
        throw new AuthenticationError('incorrect login credentials');
      },

      addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = signToken(user);
  
        return { token, user };
      },
      
      saveBook: async (parent, { input }, context) => {
        if (context.user) {
          const userAddingBook = await User.findByIdAndUpdate(
            { _id: context.user._id },
            { $push: { savedBooks: input } },
            { new: true }
          );
          return userAddingBook;
        }
        throw new AuthenticationError('You need to be logged in to save a book');
      },

      removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
          const userRemovingBook = await User.findByIdAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId: bookId } } },
            { new: true }
          );
          return userRemovingBook;
        }
        throw new AuthenticationError('You need to be logged in to remove a book');
      }
    }
  };
  
  module.exports = resolvers;