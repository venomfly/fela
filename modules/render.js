import warning from './utils/warning'
import createDOMInterface from './utils/DOMInterface'

export default function render(renderer, mountNode) {
  // check if the passed node is a valid element node which allows
  // setting the `textContent` property to update the node's content
  if (!mountNode || mountNode.nodeType !== 1) {
    throw new Error('You need to specify a valid element node (nodeType = 1) to render into.')
  }

  // warns if the DOM node either is not a valid <style> element thus the styles do not get applied as Expected
  // or if the node already got the data-fela-stylesheet attribute applied suggesting it is already used by another Renderer
  warning(mountNode.nodeName === 'STYLE', 'You are using a node other than `<style>`. Your styles might not get applied correctly.')
  warning(!mountNode.hasAttribute('data-fela-stylesheet'), 'This node is already used by another renderer. Rendering might overwrite other styles.')

  // mark and clean the DOM node to prevent side-effects
  mountNode.setAttribute('data-fela-stylesheet', '')

  const DOMInterface = createDOMInterface(renderer, mountNode)
  renderer.subscribe(DOMInterface.updateNode)

  // render currently rendered styles to the DOM once
  // if it is not already in DOM
  const css = renderer.renderToString()

  if (mountNode.textContent !== css) {
    mountNode.textContent = css
  }
}
