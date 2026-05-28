import { render } from '@testing-library/react'
import PriceTrendChart from '../src/components/PriceTrendChart'

describe('PriceTrendChart', () => {
  it('renders a canvas', () => {
    const { container } = render(<PriceTrendChart center={300000} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()
  })
})
