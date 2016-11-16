import { createElement, PropTypes } from 'react'

export default function createComponent(rule, type = 'div', passThroughProps = {}) {
  const component = ({ children, className, style, ...felaProps }, { renderer, theme }) => {

    // filter props to extract props to pass through
    const componentProps = Object.keys(passThroughProps).reduce((output, prop) => {
      output[prop] = felaProps[prop]
      if (!passThroughProps[prop]) {
        delete felaProps[prop]
      }
      return output
    }, { })

    componentProps.style = style

    const cls = className ? className + ' ' : ''
    componentProps.className = cls + renderer.renderRule(rule, {
      ...felaProps,
      theme
    }, _displayName)

    return createElement(type, componentProps, children)
  }

  component.contextTypes = {
    renderer: PropTypes.object,
    theme: PropTypes.object
  }

  return component
}
