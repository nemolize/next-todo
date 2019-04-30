import React, { useState } from 'react'
import { func } from 'prop-types'

export const TodoAdd = props => {
  const [name, setName] = useState('')
  const onSubmit = e => {
    e.preventDefault()
    props.onAdd(name)
    setName('')
  }

  return (
    <form onSubmit={onSubmit} className="field has-addons">
      <div className="control is-expanded has-icons-left">
        <input
          className="input"
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <span className="icon is-small is-left">
          <i className="fas fa-pen" />
        </span>
      </div>
      <div className="control">
        <button disabled={!name} className="button is-primary">
          <span className="icon is-small">
            <i className="fas fa-check" />
          </span>
          <span>add</span>
        </button>
      </div>
    </form>
  )
}

TodoAdd.propTypes = { onAdd: func }
