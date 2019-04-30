import React, { Component, createRef } from 'react'
import { Head } from '../components/head'
import { TodoList } from '../components/todo-list'
import { DeleteModal } from '../components/delete-modal'
import { TodoAdd } from '../components/todo-add'
import Auth from '@aws-amplify/auth'
import aws_config from '../aws-exports'
import Amplify, { Hub } from '@aws-amplify/core'
import { listTodos } from '../graphql/queries'
import { createTodo, deleteTodo, updateTodo } from '../graphql/mutations'
import API from '@aws-amplify/api'

export const STORAGE_KEY = 'todos'
export const INITIAL_STATE = {
  loading: true,
  list: [],
}

class IndexPage extends Component {
  constructor(props) {
    super(props)
    this.deleteModalRef = createRef()
  }

  componentDidMount() {
    this.setState(() => INITIAL_STATE)

    Hub.listen('auth', data => {
      switch (data.payload.event) {
        case 'signIn':
          this.setAuthUser(data.payload.data).then(() => this.getList())
          break
        case 'signIn_failure':
          this.setAuthUser(null)
          this.setState({ authError: data.payload.data })
          break
      }
    })

    Amplify.configure(aws_config)
    Auth.currentUserInfo().then(authUser => {
      if (authUser) {
        this.setAuthUser(authUser).then(() => this.getList())
      }
    })
  }

  setAuthUser = async authUser => this.setState({ authUser })

  getList = async () => {
    const { data } = await API.graphql({ query: listTodos })
    this.setState({ list: data.listTodos.items })
  }

  add = async name => {
    await API.graphql({
      query: createTodo,
      variables: { input: { name, done: false } },
    })
    await this.getList()
  }

  remove = async ({ id }) => {
    await API.graphql({ query: deleteTodo, variables: { input: { id } } })
    await this.getList()
  }

  toggle = async todoId => {
    const { id, done } = this.state.list.find(({ id }) => id === todoId)
    await API.graphql({query:updateTodo,variables:{ input: { id, done: !done } }})
    await this.getList()
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
