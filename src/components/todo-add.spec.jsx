import React from 'react'
import { shallow } from 'enzyme/build'
import { TodoAdd } from './todo-add'

describe('TodoAdd', () => {
  let wrapper
  const onAddSpy = jest.fn()

  beforeEach(() => {
    wrapper = shallow(<TodoAdd onAdd={onAddSpy} />)
  })

  test('should disable button if input field is empty', () => {
    expect(wrapper.find('button').is('[disabled]')).toBeTruthy()
  })

  test('should call onRenderSpy on click add button', () => {
    wrapper.find('input').simulate('change',{target:{value:'dummy name'}})
    wrapper.find('form').simulate('submit', new MouseEvent('click'))
    expect(onAddSpy).toBeCalledWith('dummy name')
  })
})
