import { gql } from '@apollo/client';

export const ADD_USER = gql`
  mutation addUser($username: String!, $email: String!, $password: String! savedBooks: [BookInput]) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
        password
        savedBooks {
          _id
          bookId
          authors
          description
          title
          image
          link
      }
    }`;

export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
        password
      }
    }
  }`;  

