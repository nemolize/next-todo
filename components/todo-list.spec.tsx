import { TodoList } from './todo-list'
import { shallow, ShallowWrapper } from 'enzyme'
import { Todo } from '../types/todo'

const dummyTodos: Todo[] = [{ id: 1, name: 'dummyTodo', done: false }]

describe('TodoList', () => {
  let wrapper: ShallowWrapper<TodoList['props'], {}, TodoList>
  const onToggleSpy = jest.fn()
  const onClickRemoveSpy = jest.fn()

  wrapper = shallow<TodoList>(<div />)
  beforeEach(() => {
    wrapper = shallow(
      <TodoList
        todos={dummyTodos}
        onToggle={onToggleSpy}
        onClickRemove={onClickRemoveSpy}
      />
    )
  })
  test('should render', () => expect(wrapper.exists()).toBeTruthy())

  test('should render todos', () => {
    expect(wrapper.find('table tbody tr').text()).toContain('dummyTodo')
  })

  test('should call onToggle by clicking checkbox', () => {
    wrapper.find(`input[type='checkbox']`).simulate('change')
    expect(onToggleSpy).toHaveBeenCalledWith(1)
  })

  test('should call onClickRemove by clicking remove', () => {
    wrapper.find('button').simulate('click')
    expect(onClickRemoveSpy).toHaveBeenCalledWith(dummyTodos[0])
  })
})
