import React, { Component, createRef } from 'react'
import { Head } from '../components/head'
import { TodoList } from '../components/todo-list'
import { DeleteModal } from '../components/delete-modal'
import { TodoAdd } from '../components/todo-add'
import Auth from '@aws-amplify/auth'
import aws_config from '../aws-exports'
import { Hub } from '@aws-amplify/core'

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
          this.setState({ authState: 'signedIn' })
          this.setState({ authUser: data.payload.data })
          break
        case 'signIn_failure':
          this.setState({ authState: 'signIn' })
          this.setState({ authUser: null })
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

    Auth.currentAuthenticatedUser({ bypassCache: true })
      .then(authUser => this.setState({ authUser }))
      .catch(err => console.warn(err))
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

  add = name => {
    this.setState(
      state => ({
        ...state,
        list: state.list.concat({ id: state.counter, name, done: false }),
        counter: state.counter + 1,
      }),
      () => (this.localStorage = this.state)
    )
  }

  remove = todo => {
    this.setState(
      state => ({
        ...state,
        list: state.list.filter(({ id }) => id !== todo.id),
      }),
      () => (this.localStorage = this.state)
    )
  }

  toggle = id => {
    const newList = [...this.state.list]
    const target = newList.find(todo => todo.id === id)
    if (target) target.done = !target.done
    this.setState(
      state => ({ ...state, list: newList }),
      () => (this.localStorage = this.state)
    )
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
