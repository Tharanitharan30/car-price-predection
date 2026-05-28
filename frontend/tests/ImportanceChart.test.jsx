import { render } from '@testing-library/react'
import ImportanceChart from '../src/components/ImportanceChart'

describe('ImportanceChart', () => {
  it('renders a canvas', () => {
    const data = { a:0.5, b:0.3, c:0.2 }
    const { container } = render(<ImportanceChart data={data} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()
  })
})
