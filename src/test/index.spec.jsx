import React from 'react'
import IndexPage, { INITIAL_STATE, STORAGE_KEY } from '../pages'
import { shallow } from 'enzyme/build'
import { TodoList } from '../components/todo-list'

const initialState = {
  list: [{ id: 1, done: false, name: 'initial todo' }],
  counter: 2,
}

describe('IndexPage', () => {
  let wrapper
  let instance

  afterAll(() => localStorage.removeItem(STORAGE_KEY))

  beforeEach(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState))
    wrapper = shallow(<IndexPage />)
    instance = wrapper.instance()
  })

  test('should render', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  test('should generate initial state if LocalHistory value does not exist', () => {
    localStorage.removeItem(STORAGE_KEY)
    Object.assign(INITIAL_STATE, { list: [], counter: 1 })
    expect(shallow(<IndexPage />).state()).toEqual({ list: [], counter: 1 })
  })

  test('should pass list to TodoList', () => {
    expect(wrapper.find(TodoList).props().todos).toEqual(initialState.list)
  })

  test('should add an item', () => {
    instance.add('add test')
    expect(wrapper.state()).toEqual({
      list: [
        { id: 1, done: false, name: 'initial todo' },
        { id: 2, done: false, name: 'add test' },
      ],
      counter: 3,
    })
  })

  describe('toggle', () => {
    test('should toggle an item status', () => {
      instance.toggle(1)
      expect(wrapper.state()).toEqual({
        list: [{ id: 1, done: true, name: 'initial todo' }],
        counter: 2,
      })
    })

    test('should skip if id not found', () => {
      instance.toggle(2)
      expect(wrapper.state()).toEqual(initialState)
    })
  })

  test('should remove an item', () => {
    instance.remove(initialState.list[0])
    expect(wrapper.state()).toEqual({
      list: [],
      counter: 2,
    })
  })

  test('should show delete modal', () => {
    const showSpy = jest.fn()
    Object.assign(instance.deleteModalRef, { current: { show: showSpy } })
    instance.showModal(initialState.list[0])
    expect(showSpy).toHaveBeenCalledWith(initialState.list[0])
  })
})
