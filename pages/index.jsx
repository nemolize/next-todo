import React, { Component, createRef } from 'react'
import { Head } from '../components/head'
import { TodoList } from '../components/todo-list'
import { DeleteModal } from '../components/delete-modal'
import { TodoAdd } from '../components/todo-add'
import Auth from '@aws-amplify/auth'
import aws_config from '../aws-exports'
import { Hub } from '@aws-amplify/core'
import AWSAppSyncClient from 'aws-appsync'
import gql from 'graphql-tag'
import { listTodos } from '../graphql/queries'
import { createTodo, deleteTodo, updateTodo } from '../graphql/mutations'

export const STORAGE_KEY = 'todos'
export const INITIAL_STATE = {
  list: [
    { id: 1, done: true, name: 'Buy a milk for my boss' },
    { id: 2, done: false, name: 'Send a mail to a client' },
  ],
  counter: 3,
}

class IndexPage extends Component {
  constructor(props) {
    super(props)
    this.deleteModalRef = createRef()
  }

  componentDidMount() {
    this.setState(() => this.initialState)

    Hub.listen('auth', data => {
      switch (data.payload.event) {
        case 'signIn':
          this.client = this.getAppSyncClient()
          this.setAuthUser(data.payload.data).then(() => this.getList())
          break
        case 'signIn_failure':
          this.setAuthUser(null)
          this.setState({ authError: data.payload.data })
          break
        default:
          break
      }
    })

    Auth.configure({
      userPoolId: aws_config.aws_user_pools_id,
      userPoolWebClientId: aws_config.aws_user_pools_web_client_id,
      oauth: aws_config.oauth,
    })

    Auth.currentUserInfo().then(authUser => {
      if (authUser) {
        this.client = this.getAppSyncClient()
        this.setAuthUser(authUser).then(() => this.getList())
      }
    })
  }

  setAuthUser = async authUser => this.setState({ authUser })

  getAppSyncClient() {
    return new AWSAppSyncClient({
      url: aws_config.aws_appsync_graphqlEndpoint,
      region: aws_config.aws_appsync_region,
      auth: {
        type: aws_config.aws_appsync_authenticationType,
        jwtToken: async () =>
          (await Auth.currentSession()
            .then(data => {
              return data
            })
            .catch(err => {
              return err
            }))
            .getIdToken()
            .getJwtToken(),
      },
    })
  }

  getList = async () => {
    const { data } = await this.client.query({ query: gql(listTodos) })
    this.setState({ list: data.listTodos.items })
  }

  get initialState() {
    return this.localStorage || INITIAL_STATE
  }

  get localStorage() {
    const jsonString = localStorage.getItem(STORAGE_KEY)
    return jsonString ? JSON.parse(jsonString) : null
  }

  set localStorage(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  add = async name => {
    await this.client.mutate({
      mutation: gql(createTodo),
      variables: { input: { name, done: false } },
    })
    this.getList()
  }

  remove = async ({ id }) => {
    await this.client.mutate({
      mutation: gql(deleteTodo),
      variables: { input: { id } },
      update: (store) => {
        const data = store.readQuery({ query: gql(listTodos) })
        const index = data.listTodos.items.findIndex(todo => todo.id === id)
        if (index > -1) data.listTodos.items.splice(index, 1)
        store.writeQuery({ query: gql(listTodos), data })
      },
    })
    this.getList()
  }

  toggle = async todoId => {
    const { id, done } = this.state.list.find(({ id }) => id === todoId)
    await this.client.mutate({
      mutation: gql(updateTodo),
      variables: { input: { id, done: !done } },
      update: store => {
        const data = store.readQuery({ query: gql(listTodos) })
        const index = data.listTodos.items.findIndex(todo => todo.id === id)
        if (index > -1) data.listTodos.items.splice(index, 1)
        store.writeQuery({ query: gql(listTodos), data })
      },
    })
    this.getList()
  }

  showModal = todo => {
    this.deleteModalRef.current.show(todo)
  }

  signIn = () => Auth.federatedSignIn()
  signOut = () => Auth.signOut()

  render = () => (
    <>
      {this.state && (
        <>
          {this.state.authUser && this.state.authUser.username}
          <button onClick={this.signIn}>signIn</button>
          <button onClick={this.signOut}>signOut</button>
          <Head title="next-todo" />
          <section className="hero">
            <div className="hero-body">
              <div className="container">
                <h1 className="title">
                  <i className="fa fa-clipboard-list" />
                  <span className="pl-1">next-todo</span>
                </h1>
                <h2 className="subtitle">
                  A todo list manager made with Next.js
                </h2>
              </div>
            </div>
          </section>
          <section className="container">
            <TodoAdd onAdd={this.add} />
            <TodoList
              todos={this.state.list}
              onToggle={this.toggle}
              onClickRemove={this.showModal}
            />
          </section>
          <DeleteModal ref={this.deleteModalRef} onRemove={this.remove} />
        </>
      )}
    </>
  )
}

export default IndexPage
