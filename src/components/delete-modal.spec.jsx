import React, { createRef } from 'react'
import { shallow } from 'enzyme/build'
import { DeleteModal } from './delete-modal'

const dummyTodo = { id: 1, name: 'dummyTodo', done: false }

describe('DeleteModal', () => {
  let wrapper
  let ref
  let onRemoveSpy

  beforeEach(
    () =>
      (wrapper = shallow(
        <DeleteModal
          ref={(ref = createRef())}
          onRemove={(onRemoveSpy = jest.fn())}
        />
      ))
  )

  describe('show', () => {
    test('should not render DOM before without calling show()', () => {
      expect(wrapper.find('.modal.is-active').exists()).toBeFalsy()
    })

    test('should render DOM after calling show()', () => {
      ref.current.show(dummyTodo)
      expect(wrapper.find('.modal.is-active').exists()).toBeTruthy()
    })
  })

  test('should call onRemove on click remove button', () => {
    ref.current.show(dummyTodo)
    wrapper
      .find('button')
      .filterWhere(b => b.text() === 'Delete')
      .simulate('click')
    expect(onRemoveSpy).toBeCalledWith(dummyTodo)
  })
  describe('removeTarget', () => {
    describe('should be cleared', () => {
      beforeEach(() => ref.current.show(dummyTodo))
      test('on click cancel button', () => {
        wrapper
          .find('button')
          .filterWhere(b => b.text() === 'Cancel')
          .simulate('click')
      })
      test('on click close button', () => {
        wrapper
          .find('button')
          .filterWhere(b => b.text() === 'Cancel')
          .simulate('click')
      })

      afterEach(() =>
        expect(wrapper.find('.modal.is-active').exists()).toBeFalsy()
      )
    })
  })
})
