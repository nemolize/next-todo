import React from 'react'
import IndexPage from '../pages'
import { shallow } from 'enzyme/build'
import { TodoList } from '../components/todo-list'
import API from '@aws-amplify/api'
import Auth from '@aws-amplify/auth'
import { Hub } from '@aws-amplify/core'
jest.mock('@aws-amplify/api')
jest.mock('@aws-amplify/auth')
Auth.currentUserInfo.mockResolvedValue(null)

const state = {
  list: [{ id: 1, done: false, name: 'dummy todo' }],
  loading: false,
  authUser: { name: 'dummyUser' },
}

describe('IndexPage', () => {
  let wrapper
  let instance

  beforeEach(() => {
    API.graphql.mockClear()
    wrapper = shallow(<IndexPage />)
    instance = wrapper.instance()
    instance.setState(state)
  })

  test('should render', () => expect(wrapper.exists()).toBeTruthy())

  test('should render loading indicator while loading', async () => {
    instance.setState({loading:true})
    expect(wrapper.find('.fas.fa-spin.fa-circle-notch').exists()).toBeTruthy()
  })

  test('should pass list to TodoList', () =>
    expect(wrapper.find(TodoList).props().todos).toEqual(state.list))
  test('should add an item', async () => {
    jest.spyOn(instance, 'getList').mockResolvedValue(null)
    await instance.add('add test')
    expect(API.graphql.mock.calls[0][0].variables).toEqual({
      input: { done: false, name: 'add test' },
    })
  })

  test('should toggle an item status', async () => {
    jest.spyOn(instance, 'getList').mockResolvedValue(null)
    await instance.toggle(1)
    expect(API.graphql.mock.calls[0][0].variables).toEqual({
      input: { id: 1, done: true },
    })
  })

  test('should remove an item', async () => {
    jest.spyOn(instance, 'getList').mockResolvedValue(null)
    await instance.remove(state.list[0])
    expect(API.graphql.mock.calls[0][0].variables).toEqual({ input: { id: 1 } })
  })

  test('should get list from API', async () => {
    API.graphql.mockResolvedValue({
      data: {
        listTodos: { items: [{ id: 1, done: false, name: 'dummy todo' }] },
      },
    })
    await instance.getList()
    expect(instance.state).toEqual({
      authUser: { name: 'dummyUser' },
      list: [{ done: false, id: 1, name: 'dummy todo' }],
      loading: false,
    })
  })

  test('should sign in', () => {
    instance.signIn()
    expect(Auth.federatedSignIn).toHaveBeenCalled()
  })

  test('should sign out', () => {
    instance.signOut()
    expect(Auth.signOut).toHaveBeenCalled()
  })

  test('should show delete modal', () => {
    const showSpy = jest.fn()
    Object.assign(instance.deleteModalRef, { current: { show: showSpy } })
    instance.showModal(state.list[0])
    expect(showSpy).toHaveBeenCalledWith(state.list[0])
  })

  test('should setUser if authorized', async () => {
    jest.spyOn(instance, 'getList').mockResolvedValue(null)
    Auth.currentUserInfo.mockResolvedValue({ name: 'dummyAuthUser' })
    const setAuthUserSpy = jest.spyOn(instance, 'setAuthUser')
    await instance.authorize()
    expect(setAuthUserSpy).toHaveBeenCalledWith({ name: 'dummyAuthUser' })
  })

  test('should handle signIn event', async () => {
    jest.spyOn(instance, 'getList').mockResolvedValue(null)
    const setAuthUserSpy = jest.spyOn(instance, 'setAuthUser')
    Hub.dispatch('auth', { event: 'signIn', data: { name: 'data' } })
    expect(setAuthUserSpy).toHaveBeenCalledWith({ name: 'data' })
  })

  test('should handle signIn event', async () => {
    jest.spyOn(instance, 'getList').mockResolvedValue(null)
    const setAuthUserSpy = jest.spyOn(instance, 'setAuthUser')
    Hub.dispatch('auth', { event: 'signIn_failure', data: { name: 'data' } })
    expect(setAuthUserSpy).toHaveBeenCalledWith(null)
  })
})
