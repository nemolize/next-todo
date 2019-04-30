import React from 'react'
import { shallow } from 'enzyme/build'
import { Head } from './head'

describe('Head', () => {
  let wrapper

  describe('without props', () => {
    beforeEach(() => (wrapper = shallow(<Head />)))

    test('should render title', () =>
      expect(wrapper.find('title').text()).toEqual(''))

    test('should render description', () =>
      expect(wrapper.find(`meta[name='description']`).prop('content')).toEqual(
        ''
      ))

    test('should render og:url', () =>
      expect(wrapper.find(`meta[property='og:url']`).prop('content')).toEqual(
        ''
      ))

    test('should render og:title', () =>
      expect(wrapper.find(`meta[property='og:title']`).prop('content')).toEqual(
        ''
      ))

    test('should render og:description', () =>
      expect(
        wrapper.find(`meta[property='og:description']`).prop('content')
      ).toEqual(''))

    test('should render twitter:site', () =>
      expect(wrapper.find(`meta[name='twitter:site']`).prop('content')).toEqual(
        ''
      ))
    test('should render twitter:image', () =>
      expect(
        wrapper.find(`meta[name='twitter:image']`).prop('content')
      ).toEqual(''))

    test('should render og:image', () =>
      expect(wrapper.find(`meta[property='og:image']`).prop('content')).toEqual(
        ''
      ))
  })

  describe('with props', () => {
    beforeEach(
      () =>
        (wrapper = shallow(
          <Head
            title={'dummyTitle'}
            description={'dummyDescription'}
            ogImage={'dummyImage'}
            url={'dummyUrl'}
          />
        ))
    )

    test('should render title', () =>
      expect(wrapper.find('title').text()).toEqual('dummyTitle'))

    test('should render description', () =>
      expect(wrapper.find(`meta[name='description']`).prop('content')).toEqual(
        'dummyDescription'
      ))

    test('should render og:url', () =>
      expect(wrapper.find(`meta[property='og:url']`).prop('content')).toEqual(
        'dummyUrl'
      ))

    test('should render og:title', () =>
      expect(wrapper.find(`meta[property='og:title']`).prop('content')).toEqual(
        'dummyTitle'
      ))

    test('should render og:description', () =>
      expect(
        wrapper.find(`meta[property='og:description']`).prop('content')
      ).toEqual('dummyDescription'))

    test('should render twitter:site', () =>
      expect(wrapper.find(`meta[name='twitter:site']`).prop('content')).toEqual(
        'dummyUrl'
      ))
    test('should render twitter:image', () =>
      expect(
        wrapper.find(`meta[name='twitter:image']`).prop('content')
      ).toEqual('dummyImage'))

    test('should render og:image', () =>
      expect(wrapper.find(`meta[property='og:image']`).prop('content')).toEqual(
        'dummyImage'
      ))
  })
})
