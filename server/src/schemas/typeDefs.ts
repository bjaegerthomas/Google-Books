const typeDefs = `
type User {
  _id: ID
  username: String!
  email: String!
  password: String!
  bookCount: Int
  savedBooks: [Book]
}

type Auth {
    token: ID!
    profile: Profile
  }

type UserInput {
    username: String!
    email: String!
    password: String!
  }

type Book {
    bookId: ID
    authors: [String]
    description: String
    title: String
    image: String
    link: String
    }

type Query {
    users: [User]!
    user(username: String!): User
    me: User
  }

type Mutation {
  addUser(input: UserInput!): Auth
  login(email: String!, password: String!): Auth

  addSkill(profileId: ID!, skill: String!): Profile
  removeProfile: Profile
  removeSkill(skill: String!): Profile
}
`;

export default typeDefs;

